import React, { useEffect, useState, useMemo } from "react";
import config from "../../../config";
import "./fbtProductList.css";
import { useCart } from "../../../context/CartContext";
import { wcApiV3 } from "../../../api/woocommerce";

const FrequentlyBoughtTogether = ({ productId, onChange }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedSize, setSelectedSize] = useState({});
  const { addToCart, setCartOpen } = useCart();

  const API_URL = config.API_URL;

  // ১. ডাটা ফেচ করা
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

  // ২. প্রাইস ক্যালকুলেশন
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
      // সরাসরি কল না করে একটি নির্দিষ্ট কন্ডিশনে কল করুন
      onChange(selectedProducts, selectedIds, selectedSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, selectedSize]); 
  // এখানে products বা onChange দিলে লুপ হওয়ার সম্ভাবনা থাকে।

  if (loading || !Array.isArray(products) || products.length === 0) return null;

  const toggleProduct = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ৪. ডাইনামিক অ্যাড টু কার্ট লজিক
  const handleAddToCart = async () => {
    if (selectedIds.length === 0) return;

    setAddingToCart(true);

    try {
      const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

      for (const p of selectedProducts) {
        // ১. সিম্পল প্রোডাক্টের জন্য
        if (p.type !== "variable") {
          addToCart(p, 1);
          continue;
        }

        // ২. ভ্যারিয়েবল প্রোডাক্টের জন্য সাইজ চেক
        const sizeForThisProduct = selectedSize[p.id];

        if (!sizeForThisProduct) {
          alert(`Please select a size for ${p.name}`);
          setAddingToCart(false);
          return;
        }

        // ৩. ভ্যারিয়েশন ফেচ করা
        const variationRes = await wcApiV3.get(`products/${p.id}/variations`);
        const variations = variationRes.data;

        // ৪. সাইজ ম্যাচ করানো
        const matchedVariation = variations.find(v =>
          v.attributes.some(attr =>
            attr.option.toLowerCase() === sizeForThisProduct.toLowerCase()
          )
        );

        if (!matchedVariation) {
          alert(`Selected size "${sizeForThisProduct}" not available for ${p.name}`);
          continue;
        }

        // ৫. কার্টে যোগ করা (Original Product, Quantity, Variation)
        addToCart(p, 1, matchedVariation);
      }

      setCartOpen(true); 
    } catch (error) {
      console.error("FBT Add to cart error:", error);
      alert("কার্টে যোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="fbt-wrapper">
      <h3>Frequently Bought Together</h3>
      <div className="right-combo-side">
        <div className="combo-card-wrapper">
          <div className="combo-items-scroll">
            {products.map((product) => {
              const regularPrice = parseInt(product.custom_price_data?.regular_price || 0);
              const salePrice = parseInt(product.custom_price_data?.sale_price || 0);
              const isSale = salePrice > 0 && salePrice < regularPrice;

              return (
                <div key={product.id} className="combo-item-row">
                  <div className="item-main-info">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                    />
                    <div className="item-img-box">
                      <img src={product.images?.[0]?.src} alt={product.name} />
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
              onClick={handleAddToCart}
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
  );
};

export default FrequentlyBoughtTogether;