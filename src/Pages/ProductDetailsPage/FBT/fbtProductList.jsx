import React, { useEffect, useState, useMemo, useRef } from "react";
import config from "../../../config";
import "./fbtProductList.css";
import { useCart } from "../../../context/CartContext";
import { wcApiV3 } from "../../../api/woocommerce";
import { AnimatePresence, motion } from "framer-motion";

const FrequentlyBoughtTogether = ({ productId, onChange }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedSize, setSelectedSize] = useState({});
  const [isFlying, setIsFlying] = useState(false);
  const [flyCoords, setFlyCoords] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });
  const { addToCart } = useCart();
  const imageRefs = useRef({}); 

  const API_URL = config.API_URL;

  useEffect(() => {
    if (!productId) return;
    let isMounted = true;
    setLoading(true);

    fetch(`${API_URL}/fbt/v1/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) {
            setProducts(data);
            setSelectedIds([]); 
          } else {
            setProducts([]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        if (isMounted) {
          setProducts([]);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [productId, API_URL]);

  const { regularTotal, saleTotal } = useMemo(() => {
    return products
      .filter((p) => selectedIds.includes(p.id))
      .reduce(
        (acc, p) => {
          const reg = parseInt(p.custom_price_data?.regular_price || 0);
          const sale = parseInt(p.custom_price_data?.sale_price || 0);
          acc.regularTotal += reg;
          acc.saleTotal += sale > 0 ? sale : reg;
          return acc;
        },
        { regularTotal: 0, saleTotal: 0 }
      );
  }, [products, selectedIds]);

  useEffect(() => {
    if (onChange && !loading && products.length > 0) {
      const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
      onChange(selectedProducts, selectedIds, selectedSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, selectedSize]); 

  if (loading || !Array.isArray(products) || products.length === 0) return null;

  const toggleProduct = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddToCart = async (selectedProducts) => {
    setAddingToCart(true);

    try {
      const dataLayerItems = [];

      for (const p of selectedProducts) {
        if (p.type !== "variable") {
          addToCart(p, 1);

          const productPrice = parseFloat(
            p.custom_price_data?.sale_price ||
            p.custom_price_data?.regular_price ||
            0
          );

          dataLayerItems.push({
            item_id: String(p.id),
            item_name: p.name,
            item_category: p.categories?.[0]?.name || "",
            price: productPrice,
            quantity: 1,
          });

          continue;
        }

        const sizeForThisProduct = selectedSize[p.id];

        const variationRes = await wcApiV3.get(
          `products/${p.id}/variations`
        );

        const variations = variationRes.data;

        const matchedVariation = variations.find((v) =>
          v.attributes.some(
            (attr) =>
              attr.option.toLowerCase() ===
              sizeForThisProduct?.toLowerCase()
          )
        );

        if (!matchedVariation) {
          alert(
            `Selected size "${sizeForThisProduct}" not available for ${p.name}`
          );
          continue;
        }

        addToCart(p, 1, matchedVariation);

        const productPrice = parseFloat(
          matchedVariation.price ||
          p.custom_price_data?.regular_price ||
          0
        );

        dataLayerItems.push({
          item_id: String(p.id),
          item_name: p.name,
          item_category: p.categories?.[0]?.name || "",
          item_variant: sizeForThisProduct,
          price: productPrice,
          quantity: 1,
        });
      }

      // ✅ Total value calculation (IMPORTANT for GA4)
      const totalValue = dataLayerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      window.dataLayer = window.dataLayer || [];

      // clear previous ecommerce object
      window.dataLayer.push({
        ecommerce: null,
      });

      // single GA4 event (BEST PRACTICE)
      window.dataLayer.push({
        event: "add_to_cart",
        ecommerce: {
          currency: "BDT",
          value: totalValue,
          items: dataLayerItems,
        },
      });

    } catch (error) {
      console.error("FBT Add to cart error:", error);
      alert("কার্টে যোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddWithAnimation = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;

    // ১. প্রথমে ফিল্টার করে সিলেক্টেড প্রোডাক্টগুলো বের করা হচ্ছে
    const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

    // ২. চেক করা হচ্ছে কোনো ভেরিয়েবল প্রোডাক্টের সাইজ সিলেক্ট করা বাকি আছে কিনা
    const missingSizeProduct = selectedProducts.find(
      (p) => p.type === "variable" && !selectedSize[p.id]
    );

    if (missingSizeProduct) {
      alert(`Please select a size for: ${missingSizeProduct.name}`);
      return; // সাইজ না থাকলে এখানেই কোড এক্সিকিউশন স্টপ হবে
    }

    // ৩. সবকিছু ঠিক থাকলে ফ্লাইং অ্যানিমেশন স্টার্ট হবে
    const cartIcon = document.getElementById('cart-icon');
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

    // ৪. কার্ট এপিআই ও স্টেট হ্যান্ডলার কল করা হচ্ছে
    await handleAddToCart(selectedProducts);
  };

  const flyingImage = products.find(p => selectedIds.includes(p.id))?.images[0]?.src || "/images/placeholder.png";

  return (
    <>
    <div className="fbt-wrapper">
      <h3>Frequently Bought Together</h3>
      <div className="right-combo-side">
        <div className="combo-card-wrapper">
          <div className="combo-items-scroll">
            {products.map((product) => {

              const regularPrice = parseFloat(
                product?.custom_price_data?.regular_price ||
                product?.regular_price ||
                0
              );

              const currentPrice = parseFloat(
                product?.custom_price_data?.price ||
                product?.price ||
                regularPrice
              );

              const isSale =
                regularPrice > 0 &&
                currentPrice > 0 &&
                currentPrice < regularPrice;

              const salePrice = isSale ? currentPrice : regularPrice;

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
            <span className="total-label">TOTAL PRICE:</span>
            <div className="total-amount-box">
              {regularTotal > saleTotal && <del>৳{regularTotal.toFixed(0)}</del>}
              <span className="grand-total"> ৳{saleTotal.toFixed(0)}</span>
            </div>
          </div>
          <div className="fbt-cart-button-wrapper">
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
    <AnimatePresence>
      {isFlying && (
        <motion.img
          src={flyingImage}
          initial={{ 
            position: "fixed",
            top: flyCoords.startY,
            left: flyCoords.startX,
            width: "80px", 
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

export default FrequentlyBoughtTogether;