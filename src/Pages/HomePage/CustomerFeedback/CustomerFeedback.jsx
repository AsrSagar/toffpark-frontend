import React, { useState, useEffect, useRef } from "react";
import config from "../../../config";
import "./CustomerFeedback.css";
import { useCart } from "../../../context/CartContext";
import { wcApiV3 } from "../../../api/woocommerce";
import { motion, AnimatePresence } from "framer-motion";

const CustomerFeedback = () => {
    const API_URL = config.API_URL;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playVideo, setPlayVideo] = useState(false);
    const [selectedSize, setSelectedSize] = useState({});
    const [selectedIds, setSelectedIds] = useState([]);
    const [addingToCart, setAddingToCart] = useState(false);
    const { addToCart } = useCart();
    const [isFlying, setIsFlying] = useState(false);
    const [flyCoords, setFlyCoords] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });
    
    // একাধিক ইমেজের রেফারেন্স ট্র্যাক করার জন্য এটি ব্যবহার করা ভালো
    const imageRefs = useRef({}); 

    const handleAddToCart = async () => {
      if (selectedIds.length === 0) return;
  
      setAddingToCart(true);
  
      try {
        const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
  
        for (const p of selectedProducts) {
          if (p.type !== "variable") {
            addToCart(p, 1);
            continue;
          }
  
          const sizeForThisProduct = selectedSize[p.id];
  
          if (!sizeForThisProduct) {
            alert(`Please select a size for ${p.name}`);
            setAddingToCart(false);
            return;
          }
  
          const variationRes = await wcApiV3.get(`products/${p.id}/variations`);
          const variations = variationRes.data;
  
          const matchedVariation = variations.find(v =>
            v.attributes.some(attr =>
              attr.option.toLowerCase() === sizeForThisProduct.toLowerCase()
            )
          );
  
          if (!matchedVariation) {
            alert(`Selected size "${sizeForThisProduct}" not available for ${p.name}`);
            continue;
          }
  
          addToCart(p, 1, matchedVariation);
        }
      } catch (error) {
        console.error("FBT Add to cart error:", error);
        alert("কার্টে যোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      } finally {
        setAddingToCart(false);
      }
    };

    const handleAddWithAnimation = async (e) => {
      e.preventDefault();
      
      const cartIcon = document.getElementById('cart-icon');
      // প্রথম সিলেক্টেড ইমেজের রেফারেন্স নেয়া হচ্ছে এনিমেশনের জন্য
      const firstSelectedId = selectedIds[0];
      const productImageElement = imageRefs.current[firstSelectedId];

      if (cartIcon && productImageElement) {
        const startRect = productImageElement.getBoundingClientRect();
        const endRect = cartIcon.getBoundingClientRect();

        setFlyCoords({
          startX: startRect.left,
          startY: startRect.top,
          endX: endRect.left + (endRect.width / 2), 
          endY: endRect.top + (endRect.height / 2)
        });

        setIsFlying(true);
        setTimeout(() => {
          setIsFlying(false);
          cartIcon.classList.add('cart-icon-bounce');
          setTimeout(() => cartIcon.classList.remove('cart-icon-bounce'), 400);
        }, 800); 
      }
      await handleAddToCart();
    };

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const res = await fetch(`${API_URL}/wc/v3/products?featured=true&per_page=5`);
                const data = await res.json();
                
                if (Array.isArray(data)) {
                    setProducts(data);
                }
                setLoading(false);
            } catch (err) {
                console.error("Featured Product Fetch Error:", err);
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, [API_URL]);

    const toggleProduct = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const totalPrice = products
        .filter(p => selectedIds.includes(p.id))
        .reduce((sum, p) => sum + parseInt(p.custom_price_data?.sale_price || 0), 0);

    if (loading) return <div className="loading">Loading Featured Combo...</div>;

    const flyingImage = products.find(p => selectedIds.includes(p.id))?.images[0]?.src || "/images/placeholder.png";

    return (
      <>
      <section className="main-combo-video-section">
        <div className="customer-heading-section">
            <h2 className="feedback-title">CUSTOMERS FEEDBACK</h2>
            <p className="feedback-desc">
                We're thrilled that you were satisfied with our products and services.
            </p>
        </div>
        <div className="custom-container">
            <div className="flex-wrapper">
                <div className="left-video-side">
                    <div className="video-wrapper-custom">
                        {!playVideo ? (
                            <div className="video-box-custom" onClick={() => setPlayVideo(true)}>
                                <img
                                    src="/images/testimonials/Thumbnail-OVC-Nadia-2.jpg"
                                    alt="Customer Feedback"
                                    className="video-thumb-custom"
                                    style={{ objectFit: "cover" }}
                                />
                                <div className="play-btn-custom">
                                    <div className="play-icon-custom"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="iframe-container">
                                <iframe
                                    src="https://www.youtube.com/embed/Weh-dTfljgA?autoplay=1"
                                    title="Customer Feedback"
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    className="video-iframe-custom"
                                ></iframe>
                            </div>
                        )}
                    </div>
                </div>

                <div className="right-combo-side"> 
                    <div className="combo-card-wrapper">
                        <div className="combo-items-scroll">
                            {products.map((product) => {
                                const regularPrice = parseInt(product.custom_price_data?.regular_price || 0);
                                const salePrice = parseInt(product.custom_price_data?.sale_price || 0);
                                const isSale = salePrice > 0 && salePrice < regularPrice;
                                const activeImage = product.images[0]?.src || "/images/placeholder.png";

                                return (
                                    <div key={product.id} className="combo-item-row">
                                        <div className="item-main-info">
                                            <input 
                                              type="checkbox" 
                                              checked={selectedIds.includes(product.id)} 
                                              onChange={() => toggleProduct(product.id)}
                                            />
                                            <div className="item-img-box">
                                              <img 
                                                src={activeImage} 
                                                alt={product.name} 
                                                ref={el => imageRefs.current[product.id] = el}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                              />
                                            </div>
                                            <div className="item-text">
                                                <h4>{product.name}</h4>
                                                <div className="product-price-container fbt-price-container">
                                                  <span className="sale-price">৳{salePrice > 0 ? salePrice.toFixed(0) : regularPrice.toFixed(0)}</span>
                                                  {isSale && (
                                                    <>
                                                      <del className="regular-price">৳{regularPrice.toFixed(0)}</del>
                                                      <span className="save-amount"> Save ৳{(regularPrice - salePrice).toFixed(0)}</span>
                                                    </>
                                                  )}
                                                </div>
                                                {product.type === "variable" && product.attributes?.length > 0 && (
                                                  <div className="fbt-select-wrapper">
                                                    <select
                                                      className="combo-select"
                                                      value={selectedSize[product.id] || ""}
                                                      onChange={(e) =>
                                                        setSelectedSize((prev) => ({
                                                          ...prev,
                                                          [product.id]: e.target.value,
                                                        }))
                                                      }
                                                    >
                                                      <option value="">Select Size</option>
                                                      {product.attributes
                                                        .find((attr) => attr.variation === true || attr.name.toLowerCase() === "size")
                                                        ?.options?.map((size) => (
                                                          <option key={size} value={size}>{size}</option>
                                                        ))}
                                                    </select>
                                                  </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="total-price-summary">
                            <span className="total-label">Total Price:</span>
                            <div className="total-amount-box">
                                <span className="grand-total">৳{totalPrice}</span>
                            </div>
                        </div>
                        <button
                          className={`add-to-cart-combo-btn ${selectedIds.length > 0 ? "active" : "disabled"}`}
                          onClick={handleAddWithAnimation}
                          disabled={selectedIds.length === 0 || addingToCart}
                        >
                          {addingToCart ? (
                            <><i className="fas fa-spinner fa-spin"></i> Adding...</>
                          ) : (
                            <>
                              <i className="fas fa-shopping-basket"></i> 
                              {selectedIds.length === 0 
                                ? " Add Selected Items" 
                                : ` Add ${selectedIds.length} ${selectedIds.length === 1 ? "Item" : "Items"} To Cart`}
                            </>
                          )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <AnimatePresence>
          {isFlying && (
              <motion.img
                  src={flyingImage}
                  initial={{ 
                      position: "fixed",
                      top: flyCoords.startY,
                      left: flyCoords.startX,
                      width: "80px", // উড়ন্ত ইমেজের শুরুর সাইজ ছোট রাখলে চ্যাপ্টা ভাব কম হবে
                      height: "80px",
                      zIndex: 99999,
                      borderRadius: "10px",
                      opacity: 0.9,
                      scale: 1,
                      objectFit: "cover"
                  }}
                  animate={{ 
                      top: flyCoords.endY, 
                      left: flyCoords.endX, 
                      width: "20px", 
                      height: "20px",
                      opacity: 0.4,
                      scale: 0.1,
                      rotate: 720 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                      duration: 0.8,
                      ease: "easeInOut", 
                  }}
                  style={{ 
                      pointerEvents: "none", 
                      boxShadow: "0 10px 25px rgba(0,0,0,0.3)" 
                  }}
              />
          )}
      </AnimatePresence>
      </>
    );
};

export default CustomerFeedback;