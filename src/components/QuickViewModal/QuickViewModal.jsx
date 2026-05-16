import React, { useEffect, useState, useRef } from "react";
import { useCart } from "../../context/CartContext";
import { wcApiV3 } from "../../api/woocommerce";
import { AnimatePresence, motion } from "framer-motion";
import "./QuickViewModal.css";

const QuickViewModal = ({ isOpen, onClose, product }) => {
    const { addToCart, isInCart } = useCart();

    const [variations, setVariations] = useState([]);
    const [variationLoading, setVariationLoading] = useState(false);

    const [selectedVariation, setSelectedVariation] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [loadingId, setLoadingId] = useState(null);
    const mainImageRef = useRef(null); // Ref for the starting position
    const [isFlying, setIsFlying] = useState(false);
    const [flyCoords, setFlyCoords] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });

    useEffect(() => {
        if (!product) return;
        setSelectedSize(null);
        setSelectedVariation(null);
        setVariations([]);

        const fetchVariations = async () => {
            if (product.type === "variable") {
                try {
                    setVariationLoading(true);

                    const res = await wcApiV3.get(
                        `/products/${product.id}/variations?per_page=100`
                    );

                    setVariations(res.data);
                } catch (err) {
                    console.error("Variation fetch error:", err);
                } finally {
                    setVariationLoading(false);
                }
            }
        };
        fetchVariations();
    }, [product]);

    if (!isOpen || !product) return null;

    const productImage = product.images?.[0]?.src || "/images/shop/product-1.jpg";
    const isOutOfStock = product?.stock_status !== "instock";
    const sizeAttribute = product?.attributes?.find(attr => attr.slug === "pa_size" || attr.name.toLowerCase() === "size");

    const isSizeAvailable = (size) => {
        const matched = variations.find((v) =>
            v.attributes.some(
                (attr) =>
                    attr.option.toLowerCase() === size.toLowerCase()
            )
        );

        return matched && matched.stock_status === "instock";
    };

    const handleSizeSelect = (size) => {
        const matchedVariation = variations.find((v) =>
            v.attributes.some(
                (attr) =>
                    attr.option.toLowerCase() === size.toLowerCase()
            )
        );

        if (matchedVariation && matchedVariation.stock_status === "instock") {
            setSelectedSize(size);
            setSelectedVariation(matchedVariation);
        }
    };

    const handleAddToCart = async () => {
        if (isOutOfStock) return;
        if (product.type === "variable" && !selectedVariation) {
            alert("Please select a size");
            return;
        }

        const checkId = product.type === "variable" ? selectedVariation?.id : product.id;
        if (!isInCart(checkId)) {
            setLoadingId(checkId);
            try {
                addToCart(product, 1, product.type === "variable" ? selectedVariation : product);
            } finally {
                setLoadingId(null);
            }
        }
    };

    const handleAddWithAnimation = async (e) => {
        e.preventDefault();
        if (isOutOfStock) return;
        if (product.type === "variable" && !selectedVariation) {
            alert("Please select a size");
            return;
        }
        const cartIcon = document.getElementById('cart-icon');
        const productImage = mainImageRef.current;

        if (cartIcon && productImage) {
            const startRect = productImage.getBoundingClientRect();
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

    const cartId = product.type === "variable" ? selectedVariation?.id : product.id;

    const regularPrice = parseFloat(product.custom_price_data?.regular_price || 0).toFixed(0);
    const currentPrice = parseFloat(product.price || 0).toFixed(0);


    
    return (
        <>
        <div onClick={onClose} style={styles.overlay}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={styles.modal}>
                <div style={styles.header}>
                    <span style={{ fontWeight: '600' }}>Select Options</span>
                    <button 
                        onClick={onClose} 
                        className="modal-close-btn" 
                        style={styles.closeBtn}
                    >
                        ✕
                    </button>
                </div>
                <div style={styles.body}>
                    <div style={styles.imageContainer}>
                        <img 
                            src={productImage} 
                            alt={product.name} 
                            className="product-image"
                            ref={mainImageRef}
                        />
                    </div>

                    <h3 className="quickview-product-title">{product.name}</h3>
                    {/* <button 
                        type="button" 
                        onClick={(e) => {
                            e.preventDefault();
                        }} 
                        style={styles.sizeGuideBtn}
                    >
                        Size Guide
                    </button> */}
                    {sizeAttribute && (
                        <>
                            <p className="quickview-product-size">
                                Choose Size
                            </p>

                            {variationLoading ? (
                                <div style={{ padding: "10px" }}>
                                    Loading sizes...
                                </div>
                            ) : (
                                <div style={styles.sizeGroup}>
                                    {sizeAttribute?.options.map((size) => {
                                        const available =
                                            isSizeAvailable(size);

                                        const isSelected =
                                            selectedSize === size;

                                        return (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() =>
                                                    available &&
                                                    handleSizeSelect(size)
                                                }
                                                className="size-variation-btn"
                                                style={{
                                                    ...styles.sizeBox,
                                                    borderColor: isSelected
                                                        ? "#1a2233"
                                                        : "#e5e5e5",
                                                    cursor: available
                                                        ? "pointer"
                                                        : "not-allowed",
                                                    color: available
                                                        ? "#1a2233"
                                                        : "#cccccc",
                                                }}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                    <div className="product-price-container" style={{ marginBottom: "10px" }}>
                        <label style={styles.PriceLabel}>Price:</label>
                        <span style={styles.UnitPrice}>৳{currentPrice}</span>
                        {
                            parseFloat(regularPrice) > parseFloat(currentPrice) && (
                                <del className="regular-price" style={{ marginRight: "0", color: "#999" }}>
                                    ৳{regularPrice}
                                </del>
                            )
                        }
                    </div>
                    <button
                        onClick={handleAddWithAnimation}
                        className="add-to-cart-btn"
                        disabled={loadingId === cartId || isInCart(cartId) || isOutOfStock}
                    >
                        {isOutOfStock ? "Out of Stock" : loadingId === cartId ? "Adding..." : isInCart(cartId) ? "Added to Cart" : "ADD TO CART"}
                    </button>
                </div>
            </div>
        </div>
        <AnimatePresence>
            {isFlying && (
                <motion.img
                    src={productImage}
                    initial={{ 
                        position: "fixed",
                        top: flyCoords.startY,
                        left: flyCoords.startX,
                        width: mainImageRef.current?.offsetWidth || "400px", 
                        height: mainImageRef.current?.offsetHeight || "auto",
                        zIndex: 99999,
                        borderRadius: "10px",
                        opacity: 0.8,
                        scale: 1
                    }}
                    animate={{ 
                        top: flyCoords.endY, 
                        left: flyCoords.endX, 
                        width: "40px", 
                        height: "40px",
                        opacity: 0.5,
                        scale: 0.1,
                        rotate: 45 
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                        duration: 0.8,
                        ease: [0.45, 0, 0.55, 1], 
                    }}
                    style={{ 
                        pointerEvents: "none", 
                        objectFit: "cover",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)" 
                    }}
                />
            )}
        </AnimatePresence>
        </>
 
    );
};

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px"
    },
    modal: {
        background: "#fff",
        width: "100%",
        maxWidth: "420px",
        borderRadius: "4px",
        overflow: "hidden",
    },
    header: {
        background: "#000",
        color: "#fff",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    closeBtn: {
        border: "none",
        cursor: "pointer",
        zIndex: 20,
        color: "white",
        opacity: 0.9,
        boxShadow: "none", // 'shas' কে boxShadow এ পরিবর্তন করা হয়েছে
        fontSize: "14px",   // font-size -> fontSize
        fontWeight: 400,    // Number হিসেবে রাখা যায়
        padding: 0,
        margin: 0,
        width: "28px",
        height: "28px",
        background: "rgba(0, 0, 0, 0.25)",
        borderRadius: "50%", // border-radius -> borderRadius
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "center",     // align-items -> alignItems
        justifyContent: "center", // justify-content -> justifyContent
        lineHeight: 1,            // line-height -> lineHeight
    },
    body: {
        padding: "20px",
        textAlign: "center"
    },
    imageContainer: {
        marginBottom: "15px"
    },
    sizeGuide: {
        fontSize: "12px",
        color: "#888",
        textDecoration: "underline",
        display: "block",
        marginBottom: "15px"
    },
    sizeGroup: {
        display: "flex",
        justifyContent: "center", 
        flexWrap: "wrap",        
        gap: "10px",             
        marginBottom: "10px",
        marginTop: "10px",
        maxWidth: "100%",        
        padding: "0 10px"        
    },
    crossIcon: {
        position: "absolute",
        color: "rgba(255, 0, 0, 0.6)",
        fontSize: "16px",
        fontWeight: "bold"
    },
    sizeGuideBtn: {
        fontSize: "12px",
        color: "#888",
        textDecoration: "underline",
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "block",
        margin: "0 auto 15px auto", // মাঝখানে রাখার জন্য
        padding: 0
    },
    PriceLabel: {
        fontSize: "16px",
        fontWeight: "500", 
        color: "#000"       
    },
    UnitPrice: {
        fontSize: "16px",
        fontWeight: "500",
        color: "#000"
    }   
};

export default QuickViewModal;