import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { wcApi } from "../../../api/woocommerce";
import { getProductById } from "../../../api/products";
import QuickViewModal from "../../../components/QuickViewModal/QuickViewModal";
import "./CategoryProduct.css";

const CategoryProduct = ({ categorySlug = "112", categoryTitle = "Kids Collections" }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quickLoading, setQuickLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await wcApi.get("/products", {
                    params: {
                        category: categorySlug,
                        per_page: 12,
                    },
                });

                setProducts(res.data);
            } catch (error) {
                console.error("Category products error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categorySlug]);

    const handleQuickView = async (id) => {
        setQuickLoading(id); 
        
        try {
            const [product] = await Promise.all([
            getProductById(id),
            new Promise((resolve) => setTimeout(resolve, 1000)) // Artificial delay
            ]);

            setSelectedProduct(product);
            setIsQuickViewOpen(true); 
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

    const handleCardClick = (permalink) => {
        const slug = getSlugFromPermalink(permalink);
        if (slug) navigate(`/product/${slug}`);
    };

    if (loading || products.length === 0) return null;

    return (
        <aside className="section category-products">
            <div className="section-products">
                <div className="container">
                    <div className="section-title-wrap">
                        <h2 className="section-title">{categoryTitle}</h2>
                    </div>
                    <div className="inner-wrapper">
                        <div className="products-inner-wrapper">

                            {products.map((product) => (
                                <div key={product.id} className="product-item col-grid-3">
                                    <div 
                                        className="product-item-wrapper zoom-effect-hover-container box-shadow-block"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleCardClick(product.permalink)}
                                    >
                                        <div className="product-thumb zoom-effect">
                                            <Link className="thumbnail" to={`/product/${product.slug}`}>
                                                <img
                                                    alt={product.name}
                                                    src={product.images?.[0]?.src}
                                                />
                                            </Link>
                                            <div className="pruduct-buttons">
                                                <button 
                                                    className="product-button tooltip"
                                                    disabled={quickLoading === product.id}
                                                    onClick={(e) => {
                                                    e.stopPropagation(); // 2. Eta card-er click event-ke thamay dibe
                                                    handleQuickView(product.id);
                                                    }}
                                                >
                                                    {quickLoading === product.id ? (
                                                    <i className="fas fa-spinner fa-spin"></i> 
                                                    ) : (
                                                    <i className="far fa-eye"></i> 
                                                    )}
                                                    <span className="tooltiptext tooltip-right">
                                                    {quickLoading === product.id ? "LOADING..." : "QUICK VIEW"}
                                                    </span>
                                                </button>
                                            </div>
                                            <div className="quick-view">
                                                <button
                                                    className="custom-button button-small quick-view-link"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // 4. Etao card-er click event-ke thamay dibe
                                                        goToProduct(product.permalink);
                                                    }}
                                                    >
                                                    VIEW PRODUCT
                                                </button>
                                            </div>

                                            {product.on_sale && (
                                                <span className="ribbon-rotated onsale">
                                                    -
                                                    {Math.round(
                                                        ((product.regular_price - product.sale_price) /
                                                            product.regular_price) *
                                                            100
                                                    )}
                                                    %
                                                </span>
                                            )}
                                        </div>

                                        <div className="product-item-details">
                                            <h3 className="product-title">
                                                <Link to={`/product/${product.slug}`}>
                                                    {product.name}
                                                </Link>
                                            </h3>

                                            <div
                                                className="product-price-container"
                                                dangerouslySetInnerHTML={{
                                                    __html: product.price_html,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>

                        <div className="more-wrapper clear-fix">
                            <Link to={`/product-category/${categorySlug}`} className="custom-button">
                                Explore More
                            </Link>
                        </div>

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
        </aside>
    );
};

export default CategoryProduct;