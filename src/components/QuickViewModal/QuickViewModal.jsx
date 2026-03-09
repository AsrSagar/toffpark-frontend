import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { useCart } from "../../context/CartContext";
import { wcApi } from "../../api/woocommerce";
import BuyNowPopupCheckout from "../BuyNowPopupCheckout/BuyNowPopupCheckout";
import config from "../../config";

const QuickViewModal = ({ isOpen, onClose, product }) => {

    const { addToCart, setCartOpen, isInCart } = useCart();

    const [activeIndex, setActiveIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [variations, setVariations] = useState([]);
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [loadingId, setLoadingId] = useState(null);

    const API_URL = config.API_URL;

    useEffect(() => {
        if (!product) return;

        setActiveIndex(0);
        setQuantity(1);
        setSelectedSize(null);
        setSelectedVariation(null);

        const fetchVariations = async () => {
            if (product.type === "variable") {
                try {
                    const res = await wcApi.get(
                        `/products/${product.id}/variations`
                    );
                    setVariations(res.data);
                } catch (err) {
                    console.error("Variation fetch error:", err);
                }
            }
        };

        fetchVariations();
    }, [product]);

    if (!isOpen || !product) return null;

    const images =
        product.images && product.images.length > 0
            ? product.images.map((img) => img.src)
            : ["/images/shop/product-1.jpg"];

    const isOutOfStock = product?.stock_status !== "instock";

    const sizeAttribute = product?.attributes?.find(attr => attr.slug === "pa_size" || attr.name.toLowerCase() === "size");

    const isSizeAvailable = (size) => {
        const matched = variations.find((v) =>
            v.attributes.some(
                (attr) =>
                    attr.option.toLowerCase() === size.toLowerCase()
            )
        );

        if (!matched) return false;
        if (matched.stock_status !== "instock") return false;

        return true;
    };

    const handleSizeSelect = (size) => {
        setSelectedSize(size);

        const matchedVariation = variations.find((v) =>
            v.attributes.some(
                (attr) =>
                    attr.option.toLowerCase() === size.toLowerCase()
            )
        );

        if (!matchedVariation) {
            alert("Selected size is not available.");
            return;
        }

        setSelectedVariation(matchedVariation);
    };

    const handleAddToCart = async () => {
        if (isOutOfStock) return;

        if (product.type === "variable" && !selectedVariation) {
            alert("Please select a size");
            return;
        }

        const checkId =
            product.type === "variable"
                ? selectedVariation?.id
                : product.id;

        if (!isInCart(checkId)) {
            setLoadingId(checkId);

            try {
                const itemToAdd =
                    product.type === "variable"
                        ? selectedVariation
                        : product;

                addToCart(product, quantity, itemToAdd);
                setCartOpen(true);
            } finally {
                setLoadingId(null);
            }
        }
    };

    const cartId =
        product.type === "variable"
            ? selectedVariation?.id
            : product.id;

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.8)",
                zIndex: 999,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflowY: "auto",
            }}
        >
        <div
            className="quick-view-content mfp-close-btn-in white-popup-block"
            onClick={(e) => e.stopPropagation()}
            style={{
            position: "relative",
            background: "#fff",
            maxWidth: "1000px",
            width: "95%",
            }}
        >
            <button onClick={onClose} className="mfp-close">
            ✕
            </button>
            <div className="product-single">
                <div className="inner-wrapper">
                    <div className="col-grid-6">
                        <div className="single-thumb-detail clear-fix">
                            <div className="single-main-thumb clear-fix">
                                <div className="single-thumb">
                                    <img
                                        alt={product.name}
                                        src={images[activeIndex]}
                                        style={{ 
                                            width: "100%",
                                            padding: "0px 3px 10px 2px",
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="pager-thumbnail section-carousel-enabled">
                            <Slider
                                dots={false}
                                arrows={true}
                                slidesToShow={4}
                                slidesToScroll={1}
                                infinite={false}
                                focusOnSelect={true}
                                centerMode={false}
                                swipeToSlide={true}
                            >
                                {images.map((img, index) => (
                                <div key={index} onClick={() => setActiveIndex(index)}>
                                    <img
                                    alt={`thumb-${index}`}
                                    src={img}
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        objectFit: "cover",
                                        opacity: activeIndex === index ? 1 : 0.7,
                                        cursor: "pointer",
                                        margin: "0 auto",
                                    }}
                                    />
                                </div>
                                ))}
                            </Slider>
                            </div>
                        </div>
                    </div>

                    <div className="col-grid-6">
                        <div className="summary entry-summary">
                            <div className="product-item-details">
                                <h2 className="product-title">
                                    <a href={`/product/${product.slug}`}>
                                    {product.name}
                                    </a>
                                </h2>
                                <div
                                    className="product-price-container"
                                    dangerouslySetInnerHTML={{ __html: product.price_html }}
                                />
                            </div>

                            <div
                                className="item-content"
                                dangerouslySetInnerHTML={{
                                    __html: product.short_description || "",
                                }}
                            />

                            {selectedSize && (
                            <div style={{ marginBottom: "10px", fontWeight: "500" }}>
                                SIZE: {selectedSize}
                            </div>
                            )}

                            {sizeAttribute && (
                            <div className="quick-filter filter-by-size">
                                <div className="filter-size-container">
                                    {sizeAttribute.options.map((size) => {
                                        const available = isSizeAvailable(size);
                                        return (
                                            <button
                                                type="button"
                                                key={size}
                                                disabled={!available}
                                                className={`filter-size-box 
                                                    ${selectedSize === size ? "active" : ""} 
                                                    ${!available ? "disabled" : ""}`}
                                                onClick={() => available && handleSizeSelect(size)}
                                            >
                                                {size}
                                                {!available && <span className="size-cross">✕</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            )}

                            <form
                                className="single-cart"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleAddToCart();
                                }}
                            >
                                <input
                                    type="number"
                                    className="input-text"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                />
                                <button
                                    className="custom-button button-small"
                                    disabled={
                                        loadingId === cartId ||
                                        isInCart(cartId) ||
                                        isOutOfStock
                                    }
                                >
                                    {isOutOfStock
                                        ? "Out of Stock"
                                        : loadingId === cartId
                                        ? "Adding..."
                                        : isInCart(cartId)
                                        ? "Added"
                                        : "Add To Cart"}
                                </button>

                                {product && !isOutOfStock && (
                                    <BuyNowPopupCheckout
                                        product={product}
                                        API_URL={API_URL}
                                        selectedVariation={selectedVariation}
                                    />
                                )}
                            </form>

                            <div className="share-on">
                                <h4>SHARE PRODUCT:</h4>
                                <div className="social-links text-alignleft">
                                    <ul>
                                        <li><a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a></li>
                                        <li><a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a></li>
                                        <li><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="entry-meta product-meta">
                                <span><strong>SKU :</strong> {product.sku || "N/A"}</span>
                                <span><strong>CATEGORY :</strong> {product.categories &&
                                        product.categories.map((category, index) => (
                                            <span key={index}>
                                            <Link to={`/product-category/${category.slug}`}>
                                                {category.name}
                                            </Link>
                                            {index < product.categories.length - 1 && ", "}
                                            </span>
                                    ))}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default QuickViewModal;