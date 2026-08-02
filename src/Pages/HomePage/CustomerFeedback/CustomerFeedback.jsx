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
    
    // 🎯 Dynamic ACF Discount State
    const [discountRules, setDiscountRules] = useState([]);
    const [defaultNotice, setDefaultNotice] = useState("");

    const { addToCart } = useCart();
    const [isFlying, setIsFlying] = useState(false);
    const [flyCoords, setFlyCoords] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });

    const imageRefs = useRef({});

    // 🎯 ১. ব্যাকএন্ড ডাটা ফেচ করা
    useEffect(() => {
        const fetchData = async () => {
            try {
                // WooCommerce Products Fetch
                const res = await fetch(`${API_URL}/wc/v3/products?featured=true&per_page=5`);
                const data = await res.json();
                if (Array.isArray(data)) setProducts(data);

                // ACF Custom Discount Endpoint Fetch
                const discountRes = await fetch(`${API_URL}/custom/v1/bundle-discounts`);
                const discountData = await discountRes.json();
                
                if (discountData && discountData.rules) {
                    const sortedData = discountData.rules.sort((a, b) => a.min_qty - b.min_qty);
                    setDiscountRules(sortedData);
                    setDefaultNotice(discountData.default_message || "");
                }

                setLoading(false);
            } catch (err) {
                console.error("Fetch Error:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, [API_URL]);

    // 🎯 ২. সক্রিয় ডিসকাউন্ট রুল বের করা
    const getActiveRule = (qty) => {
        if (!discountRules || discountRules.length === 0) return null;
        
        const eligibleRules = discountRules
            .filter(rule => qty >= rule.min_qty)
            .sort((a, b) => b.discount_percent - a.discount_percent);

        return eligibleRules.length > 0 ? eligibleRules[0] : null;
    };

    // 🎯 ৩. পরবর্তী অফার টার্গেট বের করা
    const getNextDiscountTier = (qty) => {
        if (!discountRules || discountRules.length === 0) return null;
        return discountRules.find(rule => qty < rule.min_qty) || null;
    };

    const activeRule = getActiveRule(selectedIds.length);
    const nextTier = getNextDiscountTier(selectedIds.length);
    const currentDiscountPercent = activeRule ? activeRule.discount_percent : 0;

    // 🎯 ৪. অফার মেসেজ জেনারেট করা (পরবর্তী অফারের next_tier_message ফেচ করবে)
    const renderNoticeMessage = () => {
        if (!discountRules || discountRules.length === 0) {
            return null;
        }

        const qty = selectedIds.length;

        if (activeRule) {
            let activeMsg = activeRule.active_message || "🎉 অভিনন্দন! আপনি ডিসকাউন্ট পেয়েছেন!";
            activeMsg = activeMsg
                .replace(/{qty}/g, qty)
                .replace(/{discount}/g, activeRule.discount_percent);

            let nextMsg = "";
            // 💡 target (nextTier) এর নিজের next_tier_message প্রিন্ট হবে
            if (nextTier && nextTier.next_tier_message) {
                const remaining = nextTier.min_qty - qty;
                nextMsg = nextTier.next_tier_message
                    .replace(/{remaining}/g, remaining)
                    .replace(/{next_discount}/g, nextTier.discount_percent);
            }

            return (
                <>
                    <div>{activeMsg}</div>
                    {nextMsg && (
                        <div style={{ fontSize: "12px", marginTop: "4px", color: "#155724", fontWeight: "normal" }}>
                            {nextMsg}
                        </div>
                    )}
                </>
            );
        }

        // কোনো একটিভ রুল না থাকলে (যেমন ১ বা ২ টি সিলেক্ট করা থাকলে) প্রথম রুলের next_tier_message দেখাবে
        if (nextTier && nextTier.next_tier_message) {
            const remaining = nextTier.min_qty - qty;
            return nextTier.next_tier_message
                .replace(/{remaining}/g, remaining)
                .replace(/{next_discount}/g, nextTier.discount_percent);
        }

        return defaultNotice || null;
    };

    // 🎯 ৫. প্রাইস ক্যালকুলেশন
    const totalPrice = products
        .filter(p => selectedIds.includes(p.id))
        .reduce((sum, p) => sum + parseInt(p.custom_price_data?.sale_price || p.custom_price_data?.regular_price || p.price || 0), 0);

    const discountAmount = (totalPrice * currentDiscountPercent) / 100;
    const finalPrice = totalPrice - discountAmount;

    const noticeContent = renderNoticeMessage();

    const handleAddToCart = async () => {
        if (selectedIds.length === 0) return;
        setAddingToCart(true);

        try {
            const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
            const dataLayerItems = [];

            for (const p of selectedProducts) {
                if (p.type === "variable") {
                    const sizeForThisProduct = selectedSize[p.id];
                    const variationRes = await wcApiV3.get(`products/${p.id}/variations`);
                    const variations = variationRes.data;

                    const matchedVariation = variations.find((v) =>
                        v.attributes.some(
                            (attr) => attr.option.toLowerCase() === sizeForThisProduct?.toLowerCase()
                        )
                    );

                    if (!matchedVariation) {
                        alert(`Selected size "${sizeForThisProduct}" not available for ${p.name}`);
                        continue;
                    }

                    addToCart(p, 1, matchedVariation);

                    const price = parseFloat(matchedVariation.price || p.custom_price_data?.regular_price || 0);
                    dataLayerItems.push({
                        item_id: p.id.toString(),
                        item_name: p.name,
                        item_category: p.categories?.[0]?.name || "",
                        item_variant: sizeForThisProduct,
                        price: price,
                        quantity: 1,
                    });
                } else {
                    addToCart(p, 1);
                    const price = parseFloat(p.custom_price_data?.sale_price || p.custom_price_data?.regular_price || 0);

                    dataLayerItems.push({
                        item_id: p.id.toString(),
                        item_name: p.name,
                        item_category: p.categories?.[0]?.name || "",
                        price: price,
                        quantity: 1,
                    });
                }
            }

            let totalValue = dataLayerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            if (currentDiscountPercent > 0) {
                totalValue = totalValue - (totalValue * (currentDiscountPercent / 100));
            }

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ ecommerce: null });
            window.dataLayer.push({
                event: "add_to_cart",
                ecommerce: {
                    currency: "BDT",
                    value: parseFloat(totalValue.toFixed(2)),
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

        const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
        for (const p of selectedProducts) {
            if (p.type === "variable") {
                const sizeForThisProduct = selectedSize[p.id];
                if (!sizeForThisProduct || sizeForThisProduct.trim() === "") {
                    alert(`Please select a size for "${p.name}"`);
                    return;
                }
            }
        }

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

        await handleAddToCart();
    };

    const toggleProduct = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const flyingImage = products.find(p => selectedIds.includes(p.id))?.images[0]?.src || "/images/placeholder.png";

    return (
        <>
            <section className="main-combo-video-section">
                <div className="customer-heading-section">
                    <h2 className="feedback-title">Popular Bundle for Kids</h2>
                    <p className="feedback-desc">
                        Parents usually choose these items together for their kids. Shop bundle now!
                    </p>
                </div>
                <div className="custom-container">
                    {loading ? (
                        <div className="fbt-main-loader">
                            <div className="spinner-grow text-secondary" role="status"></div>
                            <p>Loading Featured Combo & Reviews...</p>
                        </div>
                    ) : (
                        <div className="flex-wrapper">
                            <div className="left-video-side">
                                <div className="video-wrapper-custom">
                                    {!playVideo ? (
                                        <div className="video-box-custom" onClick={() => setPlayVideo(true)}>
                                            <img
                                                src="/images/testimonials/video-thumbnail.jpeg"
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
                                                src="https://www.youtube.com/embed/dqs8fx2hn6M?autoplay=1&mute=0&playsinline=1&enablejsapi=1"
                                                title="Customer Feedback"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
                                            const isSale = regularPrice > 0 && currentPrice > 0 && currentPrice < regularPrice;
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
                                        <span className="total-label">Total Price:</span>
                                        <div className="total-amount-box">
                                            {currentDiscountPercent > 0 ? (
                                                <>
                                                    <del style={{ fontSize: "16px", color: "#888", marginRight: "10px" }}>৳{totalPrice}</del>
                                                    <span className="grand-total">৳{finalPrice.toFixed(0)}</span>
                                                </>
                                            ) : (
                                                <span className="grand-total">৳{totalPrice}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* 🎯 ডায়নামিক নোটিশ বক্স */}
                                    {discountRules.length > 0 && noticeContent && (
                                        <div className="discount-notice-box" style={{
                                            padding: "10px",
                                            margin: "10px 0 20px 0",
                                            borderRadius: "8px",
                                            textAlign: "center",
                                            fontWeight: "bold",
                                            fontSize: "14px",
                                            backgroundColor: currentDiscountPercent > 0 ? "#d4edda" : "#fff3cd",
                                            color: currentDiscountPercent > 0 ? "#155724" : "#856404",
                                            border: `1px solid ${currentDiscountPercent > 0 ? "#c3e6cb" : "#ffeeba"}`
                                        }}>
                                            {noticeContent}
                                        </div>
                                    )}

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
                    )}
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

export default CustomerFeedback;