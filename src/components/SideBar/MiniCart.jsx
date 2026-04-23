import React, { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import config from "../../config";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./MiniCart.css";

const MiniCart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    addToCart,
    cartOpen,
    setCartOpen,
  } = useCart();

  const [recommendations, setRecommendations] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [loading, setLoading] = useState(false);

  const API_URL = config.API_URL;

  // Logic: Cart-er prottekta product-er FBT data fetch kora
  useEffect(() => {
    const fetchAllFBTProducts = async () => {
      if (cartOpen && cartItems.length > 0) {
        setLoading(true);
        try {
          // 1. Sob gulo Unique Product ID ber kora (jate duplicate API call na hoy)
          const uniqueProductIds = [...new Set(cartItems.map(item => item.productId))];

          // 2. Sob gulo Product ID-r jonno eksathe API call kora
          const fetchPromises = uniqueProductIds.map(id =>
            fetch(`${API_URL}/fbt/v1/products/${id}`).then(res => res.json())
          );

          const results = await Promise.all(fetchPromises);

          // 3. Sob gulo result ke ekta single array-te merge kora
          let combinedRecommendations = results.flat();

          // 4. Duplicate product remove kora (jodi ekoi product multiple FBT-te thake)
          const uniqueRecommendations = combinedRecommendations.filter(
            (prod, index, self) =>
              prod && prod.id && index === self.findIndex((p) => p.id === prod.id)
          );

          // 5. Cart-e already thaka product gulo ke recommendation theke bad deya
          const finalRecs = uniqueRecommendations.filter(
            (recProd) => !cartItems.some(cartItem => cartItem.productId === recProd.id)
          );

          setRecommendations(finalRecs);
        } catch (error) {
          console.error("FBT Fetch Error:", error);
          setRecommendations([]);
        } finally {
          setLoading(false);
        }
      } else {
        setRecommendations([]);
      }
    };

    fetchAllFBTProducts();
  }, [cartOpen, cartItems, API_URL]);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const handleSizeChange = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product) => {
    const size = selectedSizes[product.id];
    if (product.type === "variable" && !size) {
      alert("Please select a size first!");
      return;
    }
    
    // Add item with correct properties
    addToCart({ 
      ...product, 
      productId: product.id, // consistency rakhar jonno
      image: product.images?.[0]?.src,
      size: size 
    });

    console.log(size);
  };

  console.log(cartItems);

  return (
    <>
      <div className={`cart-overlay ${cartOpen ? "active" : ""}`} onClick={() => setCartOpen(false)}></div>

      <div className={`mini-cart ${cartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h4>Shopping cart</h4>
          <button className="close-btn" onClick={() => setCartOpen(false)}>Close</button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <p className="empty-msg">Your cart is empty</p>
          ) : (
            cartItems.map((item) => (
              <div className="product-mini-cart-item" key={item.cartId}>
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <h6>{item.name}</h6>
                  {item.size && <span className="variation-info">Size: {item.size}</span>}
                  <div className="price-qty">
                    <span>{item.qty} × ৳ {item.price * item.qty}</span>
                  </div>
                  <div className="qty-controls">
                    <div className="quantity-selector">
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.cartId, item.qty - 1)}
                          className="qty-btn qty-minus"
                          >
                        −
                        </button>
                        
                        <input
                          type="number"
                          className="input-text"
                          min="1"
                          value={item.qty}
                          onChange={(e) => updateQuantity(item.cartId, item.qty + 1)}
                        />
                        
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.cartId, item.qty + 1)}
                          className="qty-btn qty-plus"
                          >
                        +
                        </button>
                    </div>
                    <button className="mini-remove-btn" onClick={() => removeFromCart(item.cartId)}>
                      <i className="fa fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          {!loading && recommendations.length > 0 && (
            <div className="recommendations-container">
              <div className="rec-header">
                <p className="rec-title">You May Also Like</p>
                <div className="swiper-nav-buttons">
                  <div className="prev-el">‹</div>
                  <div className="next-el">›</div>
                </div>
              </div>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={8}
                slidesPerView={1.1}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                navigation={{ prevEl: ".prev-el", nextEl: ".next-el" }}
                pagination={{ clickable: true, type: "progressbar" }}
                className="rec-swiper"
              >
                {recommendations.map((prod) => (
                  <SwiperSlide key={prod.id}>
                    <div className="rec-card">
                      <div className="rec-img-box">
                        <img src={prod.images?.[0]?.src} alt={prod.name} />
                      </div>
                      <div className="rec-content">
                        <h6 className="rec-name" title={prod.name}>{prod.name}</h6>
                        <p className="rec-price">৳ {prod.price}</p>
                        
                        {prod.type === "variable" && (
                          <div className="size-option">
                            <select
                              value={selectedSizes[prod.id] || ""}
                              onChange={(e) => handleSizeChange(prod.id, e.target.value)}
                            >
                              <option value="">Size</option>
                              {prod.attributes
                                ?.find((attr) => attr.variation === true)
                                ?.options?.map((size) => (
                                  <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                          </div>
                        )}
                        
                        <button className="rec-add-btn" onClick={() => handleAddToCart(prod)}>
                          <span>+ ADD</span>
                        </button>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
          <div className="subtotal">
            <span>Subtotal:</span>
            <span>৳ {subtotal.toFixed(0)}</span>
          </div>

          <Link to="/checkout" className="btn btn-success w-100" onClick={() => setCartOpen(false)}>
            Checkout
          </Link>
        </div>
      </div>
    </>
  );
};

export default MiniCart;