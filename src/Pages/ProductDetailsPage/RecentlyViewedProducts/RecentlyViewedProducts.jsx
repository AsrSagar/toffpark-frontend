import React, {  useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import config from "../../../config";
import "./RecentlyViewedProducts.css";
import { getProductById } from "../../../api/products";
import QuickViewModal from "../../../components/QuickViewModal/QuickViewModal";

const RecentlyViewedProducts = () => {
    const [products, setProducts] = useState([]);
    const [quickLoading, setQuickLoading] = useState(false);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const API_URL = config.API_URL;
    const { slug } = useParams(); // optional if you want to exclude current
    const navigate = useNavigate();

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
        navigate(`/product/${slug}`);
    };

    useEffect(() => {
        const currentProductId = slug; // current product to exclude
        let viewed = JSON.parse(localStorage.getItem("recently_viewed") || "[]");

        // Remove current product
        viewed = viewed.filter(id => id !== currentProductId);
        if (!viewed.length) return;

        // Fetch products from general API
        Promise.all(
            viewed.map(id =>
                fetch(`${API_URL}/wc/store/v1/products/${id}`)
                    .then(res => res.json())
                    .then(data => data || null)
            )
        ).then(res => setProducts(res.filter(Boolean)));
    }, [API_URL, slug]);

    const decodeHtml = (html) => {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    };

    if (!products.length) return null;

    return (
        <>
        <div className="section-products related-product clear-fix top-space">
            <div className="underline-title-section-title-wrap">
                <div className="title-left">
                    <h2>Recently Viewed Products</h2>
                    <div className="title-underline"></div>
                </div>
            </div>


            <div className="products-grid-container">
                {products.map((product) => {
                    const isOutOfStock = !product.is_in_stock || !product.is_purchasable;
                    const regularPrice = parseInt(product.prices.regular_price);
                    const salePrice = parseInt(product.prices.sale_price);
                    const isSale = salePrice < regularPrice;
                    const savePercent = isSale ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;

                    return (
                        <div key={product.id} className="custom-product-card">
                            <div className="product-card-inner" onClick={() => goToProduct(product.permalink)}>
                                {/* Thumbnail */}
                                <div className="product-image-box">
                                    {isSale && savePercent > 0 && (
                                        <div className="badge-wrap">
                                            <span className="ribbon-offered">{savePercent}% Off</span>
                                            <span className="ribbon-save">Offered items</span>
                                        </div>
                                    )}
                                    <img alt={product.name} src={product.images[0]?.src || ""} />
                                     {isOutOfStock && (
                                        <span className="ribbon-rotated onsale">Out of Stock</span>
                                    )}
                                        
                                </div>

                                {/* Details */}
                                <div className="product-info">
                                    <h3 className="product-title product-title-desktop">
                                        {decodeHtml(product.name.length > 60 ? product.name.substring(0, 60) + "..." : product.name)}
                                    </h3>
                                    <h3 className="product-title product-title-mobile">
                                        {decodeHtml(product.name.length > 40 ? product.name.substring(0, 40) + "..." : product.name)}
                                    </h3>
                                    
                                    <div className="product-price">
                                        {isSale ? (
                                            <>
                                                <span className="price-new">৳{(salePrice / 100).toFixed(0)}</span>
                                                <del className="price-old">৳{(regularPrice / 100).toFixed(0)}</del>
                                                <div className="save-tag">Save ৳{((regularPrice - salePrice) / 100).toFixed(0)}</div>
                                            </>
                                        ) : (
                                            <span className="price-new">৳{(regularPrice / 100).toFixed(0)}</span>
                                        )}
                                    </div>

                                    {/* Buttons */}
                                    <div className="card-button-group">
                                        <button 
                                            className="btn-cart" 
                                            disabled={quickLoading === product.id}
                                            onClick={(e) => {
                                                e.stopPropagation(); // 2. Eta card-er click event-ke thamay dibe
                                                handleQuickView(product.id);
                                            }}
                                            >
                                            {quickLoading === product.id ? (
                                                <i className="fas fa-spinner fa-spin"></i> 
                                            ) : (
                                                <i className="fas fa-shopping-cart"></i> 
                                            )}
                                            CART
                                        </button>
                                        <button 
                                            className="btn-buy-now" onClick={() => goToProduct(product.permalink)}>
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
        <QuickViewModal
            isOpen={isQuickViewOpen}
            onClose={() => {
            setIsQuickViewOpen(false);
            setSelectedProduct(null);
            }}
            product={selectedProduct}
        />
        </>
    );
};

export default RecentlyViewedProducts;