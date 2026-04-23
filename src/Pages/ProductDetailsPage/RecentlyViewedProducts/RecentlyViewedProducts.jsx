import React, {  useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
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
            <div className="inner-wrapper">
                <div className="products-inner-wrapper clear-fix section-carousel-enabled byapr-carousel">
                    {products.map(product => {
                        const isOutOfStock = !product.is_in_stock || !product.is_purchasable;
                        const regularPrice = parseInt(product.prices.regular_price);
                        const salePrice = parseInt(product.prices.sale_price);
                        const isSale = salePrice < regularPrice;
                        const savePercent = isSale ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;
                        return(
                            <div key={product.id} className="product-item col-grid-3">
                                <div className="product-item-wrapper zoom-effect-hover-container">
                                    <div className="product-thumb zoom-effect">
                                        {isSale && (
                                        <>
                                            <span className="ribbon-offered">{savePercent}% Off</span>
                                            <span className="ribbon-save">Offered items</span>
                                        </>
                                        )}
                                        <Link className="thumbnail" to={`/product/${product.slug}`}>
                                            <img alt={product.name} src={product.images[0].src} />
                                        </Link>
                                        {isOutOfStock && (
                                            <span className="ribbon-rotated onsale">Out of Stock</span>
                                        )}
                                        
                                    </div>
                                    <div className="product-item-details">
                                        <h3 className="product-title">
                                            <Link to={`/product/${product.slug}`}>
                                                {product.name.length > 45 
                                                ? product.name.substring(0, 45) + "..." 
                                                : product.name}
                                            </Link>
                                        </h3>
                                        <div className="product-price-container">
                                        {isSale && <span className="sale-price">৳{(salePrice / 100).toFixed(0)}</span>}
                                        {isSale && <del className="regular-price">৳{(regularPrice / 100).toFixed(0)}</del>}
                                        {isSale && <span className="save-amount"> Save ৳{((regularPrice - salePrice) / 100).toFixed(0)}</span>}
                                        {!isSale && <span className="regular-price sale-price">৳{(regularPrice / 100).toFixed(0)}</span>}
                                        </div>
                                        <div className="button-group">
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
                                            className="btn-buy-now" onClick={(e) => { e.stopPropagation(); 
                                            goToProduct(product.permalink); }}>
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