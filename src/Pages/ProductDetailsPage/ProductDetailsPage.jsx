import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { wcApi } from "../../api/woocommerce";
import { useCart } from "../../context/CartContext";
import BuyNowPopupCheckout from "../../components/BuyNowPopupCheckout/BuyNowPopupCheckout";
import config from "../../config";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import FrequentlyBoughtTogether from "./FBT/fbtProductList";
import RecentlyViewedProducts from "./RecentlyViewedProducts/RecentlyViewedProducts";
import "./ProductDetailsPage.css";


const ProductDetailsPage = () => {
    const { slug } = useParams();
    const { addToCart, setCartOpen, isInCart } = useCart();

    const [product, setProduct] = useState(null);
    const [activeImage, setActiveImage] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingId, setLoadingId] = useState(null); 
    const [quantity, setQuantity] = useState(1); 
    const [variations, setVariations] = useState([]);
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [activeTab, setActiveTab] = useState("description");
    const [relatedProducts, setRelatedProducts] = useState([]);

    const [fbtProducts, setFbtProducts] = useState([]);
    const [fbtSelected, setFbtSelected] = useState({});
    const [fbtSelectedSize, setFbtSelectedSize] = useState({});

    const API_URL = config.API_URL;

    useEffect(() => {
        let isMounted = true;
        const fetchProduct = async () => {
            try {
                const res = await wcApi.get("/products", { params: { slug } });
                if (!isMounted) return;
                const p = res.data[0];
                setProduct(p);
                setActiveImage(p.images[0]?.src);

                if (p.categories && p.categories.length > 0) {
                    const categoryId = p.categories[0].id;
                    const relatedRes = await wcApi.get("/products", { params: { category: categoryId, per_page: 8 } });
                    setRelatedProducts(relatedRes.data.filter(item => item.id !== p.id).slice(0,4));
                }

                if (p.type === "variable") {
                    const variationRes = await wcApi.get(`/products/${p.id}/variations`);
                    setVariations(variationRes.data);
                }

                setLoading(false);
            } catch (err) {
                console.error("Product fetch error:", err);
                setLoading(false);
            }
        };

        fetchProduct();
        return () => { isMounted = false; };
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
                const variationRes = await wcApi.get(`/products/${p.id}/variations`);
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

            setCartOpen(true);

        } catch (error) {
            console.error("Add to cart error:", error);
        } finally {
            setLoadingId(null);
        }
    };
    
    const sizeAttribute = product?.attributes?.find(attr => attr.slug === "pa_size" || attr.name.toLowerCase() === "size");

    return (
        <>
            {loading || !product ? (
                <div>Loading...</div>
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
                                        <li className="trail-item trail-end"><span>{product.name}</span></li>
                                    </ul>
                                </div> 
                            </div> 
                        </div>
                    </div>
                </div>

                <div id="content" className="site-content global-layout-right-sidebar">
                    <div className="container">
                        <div className="inner-wrapper">
                            <div id="primary" className="content-area">
                                <main id="main" className="site-main">
                                    <div className="product-single">
                                        <div className="inner-wrapper">
                                            <div className="col-grid-5">
                                                <div className="single-thumb-detail">
                                                    <div className="single-main-thumb">
                                                        <div className="single-thumb">
                                                            {isOutOfStock && (
                                                            <span className="ribbon-rotated onsale">Out of Stock</span>
                                                            )}
                                                            <img src={activeImage} alt="product" />
                                                        </div>
                                                    </div>
                                                    <div className="pager-thumbnail">
                                                        <Slider
                                                            dots={false}
                                                            arrows={false}
                                                            infinite={false}
                                                            slidesToShow={4}
                                                            slidesToScroll={1}
                                                            swipeToSlide={true}
                                                            responsive={[
                                                                { breakpoint: 768, settings: { slidesToShow: 3 } },
                                                                { breakpoint: 480, settings: { slidesToShow: 2 } },
                                                            ]}
                                                        >
                                                            {product.images.map((img) => (
                                                                <div key={img.id} onClick={() => setActiveImage(img.src)}>
                                                                    <img 
                                                                        src={img.src} 
                                                                        style={{
                                                                            width: "110px",
                                                                            height: "110px",
                                                                            objectFit: "cover",
                                                                            opacity: activeImage === img.src ? 1 : 0.7,
                                                                            cursor: "pointer",
                                                                            margin: "0 auto",
                                                                        }}
                                                                        alt="thumb" 
                                                                    />
                                                                </div>
                                                            ))}
                                                        </Slider>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-grid-7">
                                                <div className="summary entry-summary">
                                                    <div className="product-item-details">
                                                        <h2 className="product-title">{product.name}</h2>
                                                        <div
                                                            className="product-price-container"
                                                            dangerouslySetInnerHTML={{ __html: product.price_html }}
                                                        />
                                                        {product.short_description && (
                                                            <div
                                                                className="product-short-description"
                                                                dangerouslySetInnerHTML={{ __html: product.short_description }}
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="availability">
                                                        <i className="fas fa-check-circle" />
                                                        {product.stock_status === "instock" ? (
                                                            <span>In Stock</span>
                                                        ) : (
                                                            <span>Out of Stock</span>
                                                        )}
                                                    </div>

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

                                                    <form className="single-cart">
                                                        <input
                                                            type="number"
                                                            className="input-text"
                                                            min="1"
                                                            value={quantity}
                                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                                        />

                                                        <button
                                                            className="custom-button button-small"
                                                            onClick={(e) => { e.preventDefault(); handleAddAllToCart(); }}
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

                                    {/* Product Tabs */}
                                    <div className="product-tabs">
                                        <ul className="wc-custom-tabs">
                                            <li
                                                className={activeTab === "description" ? "active" : ""}
                                                onClick={() => setActiveTab("description")}
                                            >
                                                DESCRIPTION
                                            </li>

                                            <li
                                                className={activeTab === "additional" ? "active" : ""}
                                                onClick={() => setActiveTab("additional")}
                                            >
                                                ADDITIONAL INFORMATION
                                            </li>
                                        </ul>

                                        <div className="tab-content">
                                            {activeTab === "description" && (
                                                <div>
                                                    <h3>Description</h3>
                                                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                                </div>
                                            )}
                                            {activeTab === "additional" && (
                                                <div>
                                                    <h3>Additional Information</h3>
                                                    <table className="wc-attr-table">
                                                        <tbody>
                                                            {product.attributes.map((attr) => (
                                                                <tr key={attr.id}>
                                                                    <th>{attr.name}</th>
                                                                    <td>{attr.options.join(", ")}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="section-products related-product clear-fix top-space">
                                        {relatedProducts && relatedProducts.length > 0 && (
                                            <div className="section-title-wrap text-alignleft">
                                                <h2 className="section-title">Related Product</h2>
                                                <span className="divider"></span>
                                            </div>
                                        )}
                                        <div className="inner-wrapper">
                                            <div className="products-inner-wrapper clear-fix section-carousel-enabled byapr-carousel">
                                                {relatedProducts.map((item) => (
                                                    <div key={item.id} className="product-item col-grid-3">
                                                        <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                                                            <div className="product-thumb zoom-effect">
                                                                <Link className="thumbnail" to={`/product/${item.slug}`}>
                                                                    <img alt={item.name} src={item.images?.[0]?.src} />
                                                                </Link>
                                                                {item.on_sale && item.regular_price && item.sale_price && (
                                                                    <span className="ribbon-rotated onsale">
                                                                        -{Math.round(((item.regular_price - item.sale_price)/item.regular_price)*100)}%
                                                                    </span>
                                                                )}
                                                                <div className="quick-view">
                                                                    <Link
                                                                        to={`/product/${item.slug}`}
                                                                        className="custom-button button-small quick-view-link"
                                                                    >
                                                                        VIEW PRODUCT
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                            <div className="product-item-details">
                                                                <h3 className="product-title">
                                                                    <Link to={`/product/${item.slug}`}>{item.name}</Link>
                                                                </h3>
                                                                <div className="product-price-container" dangerouslySetInnerHTML={{ __html: item.price_html }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
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
        </>
    );
};

export default ProductDetailsPage;