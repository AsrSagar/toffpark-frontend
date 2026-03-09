import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
        setIsQuickViewOpen(true);
        setQuickLoading(true);

        const product = await getProductById(id);

        console.log("Quick View Product:", product);

        setSelectedProduct(product);
        setQuickLoading(false);
    };

    if (loading || products.length === 0) return null;

    if (quickLoading) {
        return (
        <div className="products-loading-state">
            <div className="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            </div>
        </div>
        );
    }

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
                                    <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">

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
                                                    onClick={() => {
                                                        handleQuickView(product.id);
                                                    }}
                                                >
                                                    <i className="far fa-eye"></i>
                                                    <span className="tooltiptext tooltip-right">QUICK VIEW</span>
                                                </button>
                                            </div>

                                            <div className="quick-view">
                                                <Link
                                                    to={`/product/${product.slug}`}
                                                    className="custom-button button-small quick-view-link"
                                                >
                                                    VIEW PRODUCT
                                                </Link>
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