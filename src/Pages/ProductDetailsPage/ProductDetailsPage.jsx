import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { wcApiV3 } from "../../api/woocommerce";
import { useCart } from "../../context/CartContext";
import BuyNowPopupCheckout from "../../components/BuyNowPopupCheckout/BuyNowPopupCheckout";
import config from "../../config";
import FrequentlyBoughtTogether from "./FBT/fbtProductList";
import RecentlyViewedProducts from "./RecentlyViewedProducts/RecentlyViewedProducts";
import "./ProductDetailsPage.css";
import SalesPopup from "../../components/SalesPopup/SalesPopup";
import { AnimatePresence, motion } from "framer-motion";
import { getProductById } from "../../api/products";
import QuickViewModal from "../../components/QuickViewModal/QuickViewModal";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const getSafeImage = (src) => {
    return typeof src === "string" && src.trim() !== ""
        ? src
        : undefined;
};

const ProductDetailsPage = () => {
    const { slug } = useParams();
    const { addToCart, isInCart } = useCart();
    const [product, setProduct] = useState(null);
    const [activeImage, setActiveImage] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingId, setLoadingId] = useState(null); 
    const [quickLoading, setQuickLoading] = useState(false);
    const [quantity, setQuantity] = useState(1); 
    const [variations, setVariations] = useState([]);
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [fbtProducts, setFbtProducts] = useState([]);
    const [fbtSelected, setFbtSelected] = useState({});
    const [fbtSelectedSize, setFbtSelectedSize] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const mainImageRef = useRef(null); 
    const [isFlying, setIsFlying] = useState(false);
    const [flyCoords, setFlyCoords] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });
    const API_URL = config.API_URL;
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const mainSliderRef = useRef(null);
    const thumbSliderRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // থাম্বনেইলে ক্লিক করলে বড় ইমেজ এবং স্লাইডার দুইটাই চেঞ্জ হবে
    const handleThumbClick = (index) => {
        setActiveIndex(index);
        if (mainSliderRef.current) {
            mainSliderRef.current.slickGoTo(index);
        }
        if (thumbSliderRef.current) {
            thumbSliderRef.current.slickGoTo(index);
        }
    };

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

        // Handle Add to Cart with Animation
    const handleAddWithAnimation = async (e) => {
        e.preventDefault();
        
        const cartIcon = document.getElementById('cart-icon');
        const productImage = mainImageRef.current;

        console.log("Adding to cart:", cartIcon);

        if (product.type === "variable" && !selectedVariation) {
            alert("Please select a size");
            return;
        }

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

        await handleAddAllToCart();
    };

    const handleQuickView = async (id) => {
        setQuickLoading(id); 
        try {
            const [product] = await Promise.all([
                getProductById(id),
                new Promise((resolve) => setTimeout(resolve, 1000)) // Artificial delay
            ]);

            setSelectedProduct(product);
            setIsQuickViewOpen(true); // Ekhon modal open hobe
        } catch (error) {
            console.error("Error loading product:", error);
        } finally {
            setQuickLoading(null); 
        }
    };

    const getSlugFromPermalink = (permalink) => {
        if (!permalink) return "";
        return permalink.split("/").filter(Boolean).pop();
    };
    const goToProduct = (permalink) => {
        const slug = getSlugFromPermalink(permalink);

        if (!slug) return;

        // Instant scroll top
        window.scrollTo({
            top: 0,
            behavior: "instant"
        });

        navigate(`/product/${slug}`);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    useEffect(() => {
        let isMounted = true;

        const fetchProduct = async () => {
            try {
                // Reset state instantly
                setLoading(true);
                setProduct(null);
                setSelectedVariation(null);
                setSelectedSize(null);
                setVariations([]);
                setRelatedProducts([]);
                setActiveImage("");

                // STEP 1: Fetch Product First
                const productRes = await wcApiV3.get("/products", {
                    params: { slug }
                });

                if (!isMounted) return;

                const p = productRes.data[0];

                if (!p) {
                    setLoading(false);
                    return;
                }

                setProduct(p);
                setActiveImage(getSafeImage(p?.images?.[0]?.src) || "");

                // STEP 2: Parallel API Calls
                const relatedPromise =
                    p.categories?.length > 0
                        ? wcApiV3.get("/products", {
                            params: {
                                category: p.categories[0].id,
                                per_page: 8,
                            },
                        })
                        : Promise.resolve({ data: [] });

                const variationPromise =
                    p.type === "variable"
                        ? wcApiV3.get(`/products/${p.id}/variations`)
                        : Promise.resolve({ data: [] });

                const [relatedRes, variationRes] = await Promise.all([
                    relatedPromise,
                    variationPromise,
                ]);

                if (!isMounted) return;

                // Related Products
                setRelatedProducts(
                    relatedRes.data
                        .filter((item) => item.id !== p.id)
                        .slice(0, 4)
                );

                // Variations
                setVariations(variationRes.data);

            } catch (err) {
                console.error("Product fetch error:", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProduct();

        return () => {
            isMounted = false;
        };
    }, [slug]);

    useEffect(() => {
        if (!product?.id) return; // ensure product is loaded

        // Get existing recently viewed IDs
        let viewed = JSON.parse(localStorage.getItem("recently_viewed") || "[]");

        // Remove current product if already in list
        viewed = viewed.filter(id => id !== product.id);

        // Add current product at the beginning
        viewed.unshift(product.id);

        // Keep only last 10
        if (viewed.length > 10) viewed = viewed.slice(0, 10);

        // Save back to localStorage
        localStorage.setItem("recently_viewed", JSON.stringify(viewed));
    }, [product]);

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        const matchedVariation = variations.find(v =>
            v.attributes.some(attr => attr.option.toLowerCase() === size.toLowerCase())
        );
        if (!matchedVariation) return;
        setSelectedVariation(matchedVariation);
    };

    const isSizeAvailable = (size) => {
        const matched = variations.find(v =>
            v.attributes.some(attr => attr.option.toLowerCase() === size.toLowerCase())
        );
        return matched?.stock_status === "instock";
    };

    const isOutOfStock = product?.stock_status !== "instock";

    // ✅ Add main product + selected FBT products
    const handleAddAllToCart = async () => {
        if (!product || isOutOfStock) return;

        // ✅ Main product validation
        if (product.type === "variable" && !selectedVariation) {
            alert("Please select a size");
            return;
        }

        const mainProduct = product.type === "variable" ? selectedVariation : product;
        setLoadingId(mainProduct.id);

        try {
            // ✅ Add Main Product
            addToCart(product, quantity, mainProduct);

            // ✅ Add Selected FBT Products
            for (const p of fbtProducts) {

                if (!fbtSelected[p.id]) continue;

                // SIMPLE PRODUCT
                if (p.type !== "variable") {
                    addToCart(p, 1);
                    continue;
                }

                // VARIABLE PRODUCT
                const selectedSize = fbtSelectedSize[p.id];

                if (!selectedSize) {
                    alert(`Please select size for ${p.name}`);
                    return;
                }

                // Fetch variations of this FBT product
                const variationRes = await wcApiV3.get(`/products/${p.id}/variations`);
                const variations = variationRes.data;

                const matchedVariation = variations.find(v =>
                    v.attributes.some(attr =>
                        attr.option.toLowerCase() === selectedSize.toLowerCase()
                    )
                );

                if (!matchedVariation) {
                    alert(`Selected size not available for ${p.name}`);
                    return;
                }

                addToCart(p, 1, matchedVariation);
            }


        } catch (error) {
            console.error("Add to cart error:", error);
        } finally {
            setLoadingId(null);
        }
    };
    
    const sizeAttribute = product?.attributes?.find(
    attr =>
        attr.slug === "pa_size" ||
        attr?.name?.toLowerCase() === "size"
    );



    const regularPrice = parseInt(product?.custom_price_data?.regular_price || product?.regular_price || 0);
    const salePrice = parseInt(product?.custom_price_data?.sale_price || product?.sale_price || 0);
    const isSale = salePrice < regularPrice;
    const savePercent = isSale ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;
    const decodeHtml = (html) => {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    };

    // if (loading) {
    //     return (
    //     <div className="full-page-loader">
    //         <div className="spinner"></div>
    //         <p>Loading...</p>
    //     </div>
    //     );
    // }

    return (
        <>
            {loading || !product ? (
                <div className="full-page-loader">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            ) : (
            <div className="product-single-page">
                <div id="custom-header">
                    <div className="custom-header-content">
                        <div className="container">
                            <div id="breadcrumb">
                                <div  aria-label="Breadcrumbs" className="breadcrumbs breadcrumb-trail">
                                    <ul className="trail-items">
                                    <li className="trail-item trail-begin"><a href="/" rel="home"><span>Home</span></a></li>
                                    <li className="trail-item"><span>Shop</span></li>
                                        <li className="trail-item trail-end desktop-view"><span>{product.name}</span></li>
                                        <li className="trail-item trail-end mobile-view"><span>{product?.name?.length > 30 ? product.name.substring(0, 30) + "..." : product?.name}</span></li>
                                    </ul>
                                </div> 
                            </div> 
                        </div>
                    </div>
                </div>

                <div id="content" className="site-content global-layout-right-sidebar single-product-layout">
                    <div className="container">
                        <div className="inner-wrapper">
                            <div id="primary" className="content-area">
                                <main id="main" className="site-main">
                                    <div className="product-single">
                                        <div className="inner-wrapper">
                                            <div className="col-grid-6">
                                                <div className="single-thumb-detail">
                                                    <div className="single-main-thumb">
                                                        <div className="single-thumb">
                                                        {isSale && (
                                                            <>
                                                            <span className="ribbon-offered">{savePercent}% Off</span>
                                                            <span className="ribbon-save">Offered items</span>
                                                            </>
                                                        )}
                                                        <Slider
                                                            ref={mainSliderRef}
                                                            asNavFor={thumbSliderRef.current || undefined}
                                                            arrows={false}
                                                            fade={true}
                                                            afterChange={(index) => setActiveIndex(index)}
                                                        >
                                                            {(product?.images || []).map((img, index) => (
                                                                <div key={img?.id || index}>
                                                                    <img
                                                                        ref={index === activeIndex ? mainImageRef : null}
                                                                        src={getSafeImage(img?.src)}
                                                                        width="100%"
                                                                        alt={product?.name || "product"}
                                                                        className="single-product-image"
                                                                        style={{ cursor: "grab" }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </Slider>
                                                        {isOutOfStock && (
                                                            <span className="ribbon-rotated onsale">Out of Stock</span>
                                                        )}
                                                        </div>
                                                    </div>

                                                    <div className="pager-thumbnail">
                                                        <Slider
                                                            ref={thumbSliderRef}
                                                            asNavFor={mainSliderRef.current || undefined}
                                                            slidesToShow={5}
                                                            swipeToSlide={true}
                                                            focusOnSelect={true}
                                                            arrows={false}
                                                            infinite={false}
                                                            responsive={[
                                                                { breakpoint: 768, settings: { slidesToShow: 5 } },
                                                                { breakpoint: 480, settings: { slidesToShow: 5 } }
                                                            ]}
                                                        >
                                                            {(product?.images || []).map((img, index) => (
                                                                <div
                                                                    key={img?.id || index}
                                                                    onClick={() => handleThumbClick(index)}
                                                                >
                                                                    <img
                                                                        src={getSafeImage(img?.src)}
                                                                        alt="thumb"
                                                                        style={{
                                                                            width: "100px",
                                                                            height: "100px",
                                                                            objectFit: "cover",
                                                                            margin: "5px auto",
                                                                            borderRadius: "4px",
                                                                            border: "1px solid #eee",
                                                                            opacity: activeIndex === index ? 1 : 0.6,
                                                                            cursor: "pointer",
                                                                            transition: "0.3s"
                                                                        }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </Slider>
                                                    </div>
                                                </div>
                                                <div className="fbt-desktop">
                                                    <FrequentlyBoughtTogether
                                                        productId={product.id}
                                                        onChange={(products, selected, selectedSize) => {
                                                            setFbtProducts(products);
                                                            setFbtSelected(selected);
                                                            setFbtSelectedSize(selectedSize); 
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-grid-6">
                                                <div className="summary entry-summary">
                                                    <div className="product-item-details">
                                                        <h2 className="product-title">{product.name}</h2>
                                                        <div className="product-price-container">
                                                            {isSale && <span className="sale-price">৳{salePrice.toFixed(0)}</span>}
                                                            {isSale && <del className="regular-price">৳{regularPrice.toFixed(0)}</del>}
                                                            {isSale && <span className="save-amount"> Save ৳{((regularPrice - salePrice)).toFixed(0)}</span>}
                                                            {!isSale && <span className="regular-price sale-price">৳{regularPrice.toFixed(0)}</span>}
                                                        </div>
                                                        {product.short_description && (
                                                            <div
                                                                className="product-short-description"
                                                                dangerouslySetInnerHTML={{ __html: product.short_description }}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="availability">
                                                        <span>Select Size: {selectedSize}</span>
                                                    </div>
                                                    {sizeAttribute && (
                                                        <div className="quick-filter filter-by-size">
                                                            <div className="filter-size-container">
                                                                {(sizeAttribute?.options || []).map((size) => {
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
                                                    <form className="single-cart">
                                                        <div className="quantity-selector">
                                                            <button 
                                                            type="button" 
                                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                            className="qty-btn qty-minus"
                                                            >
                                                            −
                                                            </button>
                                                            
                                                            <input
                                                            type="number"
                                                            className="input-text"
                                                            min="1"
                                                            value={quantity}
                                                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                                                            />
                                                            
                                                            <button 
                                                            type="button" 
                                                            onClick={() => setQuantity(quantity + 1)}
                                                            className="qty-btn qty-plus"
                                                            >
                                                            +
                                                            </button>
                                                        </div>

                                                        <button
                                                            className="custom-button button-small single-add-to-cart-btn"
                                                            onClick={handleAddWithAnimation}
                                                            disabled={loadingId === product?.id || isInCart(product?.id) || isOutOfStock}
                                                        >
                                                            {isOutOfStock
                                                                ? "Out of Stock"
                                                                : loadingId === product?.id
                                                                ? "Adding..."
                                                                : "Add To Cart"}
                                                        </button>

                                                        {product && !isOutOfStock && (
                                                            <BuyNowPopupCheckout
                                                                product={product}
                                                                selectedVariation={selectedVariation}
                                                                API_URL={API_URL}
                                                                fbtProducts={fbtProducts}
                                                                fbtSelected={fbtSelected}
                                                                fbtSelectedSize={fbtSelectedSize}
                                                            />
                                                        )}
                                                    </form>
                                                </div>
                                                <div className="product-info-wrapper">
                                                    <div className={`policy-accordion ${isOpen ? 'active' : ''}`}>
                                                        <div className="accordion-header" onClick={toggleAccordion} style={{ cursor: 'pointer' }}>
                                                            <div className="terms-box">
                                                                <span className="check-icon"><img src="/icons/Exchange.svg" alt="return" /></span>
                                                                <strong>Easy Return & Exchange</strong>
                                                            </div>
                                                            <div className="terms-box">
                                                                <span className="check-icon"><img src="/icons/Fast-Delivery.svg" alt="Fast Delivery" /></span>
                                                                <strong>Fast Home Delivery</strong>
                                                            </div>
                                                            <div className="terms-box">
                                                                <span className="check-icon"><img src="/icons/Quality.svg" alt="Quality" /></span>
                                                                <strong>Best Quality</strong>
                                                            </div>
                                                            {/* <span className={`arrow-down ${isOpen ? 'rotate' : ''}`}>▼</span> */}
                                                        </div>
                                                        {isOpen && (
                                                            <div className="accordion-content">
                                                                <div className="policy-details">
                                                                    orlazz
                                                                    {/* <p>Your satisfaction is our priority. If something isn't right with your order, returning it is simple.</p>
                                                                    
                                                                    <h4>Return Window</h4>
                                                                    <p>Request a return within <strong>7 days</strong> of receiving your order.</p>
                                                                    
                                                                    <h4>Free Return Shipping</h4>
                                                                    <p>We cover return shipping for defective products, size/color mismatch, print issues, or wrong item sent.</p>
                                                                    
                                                                    <h4>How to Return</h4>
                                                                    <ul>
                                                                        <li>Call our hotline +8809677666888, email support@fabrilife.com, or message us on Facebook</li>
                                                                        <li>Items must be unused, unwashed, with original tags and packaging</li>
                                                                        <li>We'll arrange pickup for eligible returns</li>
                                                                    </ul>
                                                                    
                                                                    <a href="/" className="view-policy-link">View Full Return & Refund Policy</a> */}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="product_meta">
                                                        <span className="sku_wrapper">SKU: <span className="sku">{product.sku}</span></span>    
                                                    </div>
                                                    <div className="product-description-text">
                                                        {product.description && (
                                                            <div
                                                                className="product-short-description"
                                                                dangerouslySetInnerHTML={{ __html: product.description }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="fbt-mobile">
                                                    <FrequentlyBoughtTogether
                                                        productId={product.id}
                                                        onChange={(products, selected, selectedSize) => {
                                                            setFbtProducts(products);
                                                            setFbtSelected(selected);
                                                            setFbtSelectedSize(selectedSize); 
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="section-products related-product clear-fix top-space">
                                        {relatedProducts && relatedProducts.length > 0 && (
                                            <div className="underline-title-section-title-wrap">
                                                <div className="title-left">
                                                    <h2>Related Products</h2>
                                                    <div className="title-underline"></div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="products-grid-container">
                                            {relatedProducts.map((item) => {
                                                const regularPrice = parseInt(
                                                    item?.custom_price_data?.regular_price || item?.regular_price || 0
                                                );

                                                const salePrice = parseInt(
                                                    item?.custom_price_data?.sale_price || item?.sale_price || 0
                                                );
                                                const isSale = salePrice < regularPrice;
                                                const savePercent = isSale ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;

                                                return (
                                                    <div key={item.id} className="custom-product-card">
                                                        <div className="product-card-inner" onClick={() => goToProduct(item.permalink)}>
                                                            {/* Thumbnail */}
                                                            <div className="product-image-box">
                                                                {isSale && savePercent > 0 && (
                                                                    <div className="badge-wrap">
                                                                        <span className="ribbon-offered">{savePercent}% Off</span>
                                                                        <span className="ribbon-save">Offered items</span>
                                                                    </div>
                                                                )}
                                                                <img
                                                                    alt={item?.name || ""}
                                                                    src={getSafeImage(item?.images?.[0]?.src)}
                                                                />
                                                                {isOutOfStock && <span className="ribbon-out-stock">Out of Stock</span>}
                                                            </div>

                                                            {/* Details */}
                                                            <div className="product-info">
                                                                <h3 className="product-title product-title-desktop">
                                                                    {decodeHtml((item?.name || "").length > 60 ? item.name.substring(0, 60) + "..." : item.name)}
                                                                </h3>
                                                                <h3 className="product-title product-title-mobile">
                                                                    {decodeHtml((item?.name || "").length > 40 ? item.name.substring(0, 40) + "..." : item.name)}
                                                                </h3>
                                                                <div className="product-price">
                                                                    {isSale ? (
                                                                        <>
                                                                            <span className="price-new">৳{salePrice.toFixed(0)}</span>
                                                                            <del className="price-old">৳{regularPrice.toFixed(0)}</del>
                                                                            <div className="save-tag">Save ৳{(regularPrice - salePrice).toFixed(0)}</div>
                                                                        </>
                                                                    ) : (
                                                                        <span className="price-new">৳{regularPrice.toFixed(0)}</span>
                                                                    )}
                                                                </div>

                                                                {/* Buttons */}
                                                                <div className="card-button-group">
                                                                    <button 
                                                                        className="btn-cart" 
                                                                        disabled={quickLoading === item.id}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation(); // 2. Eta card-er click event-ke thamay dibe
                                                                            handleQuickView(item.id);
                                                                        }}
                                                                        >
                                                                        {quickLoading === item.id ? (
                                                                            <i className="fas fa-spinner fa-spin"></i> 
                                                                        ) : (
                                                                            <i className="fas fa-shopping-cart"></i> 
                                                                        )}
                                                                        CART
                                                                    </button>
                                                                    <button 
                                                                        className="btn-buy-now" onClick={() => goToProduct(item.permalink)}>
                                                                        Buy Now
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <RecentlyViewedProducts />
                                </main>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}
            <AnimatePresence>
                {isFlying && (
                    <motion.img
                        src={getSafeImage(activeImage)}
                        initial={{ 
                            position: "fixed",
                            top: flyCoords.startY,
                            left: flyCoords.startX,
                            width: mainImageRef.current
                            ? `${mainImageRef.current.offsetWidth}px`
                            : "400px",
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
            <QuickViewModal
                isOpen={isQuickViewOpen}
                onClose={() => {
                    setIsQuickViewOpen(false);
                    setSelectedProduct(null);
                }}
                product={selectedProduct}
            />
            <SalesPopup />
        </>
    );
};

export default ProductDetailsPage;