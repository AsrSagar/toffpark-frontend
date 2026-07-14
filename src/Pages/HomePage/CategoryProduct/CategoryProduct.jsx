import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { wcApi } from "../../../api/woocommerce";
import QuickViewModal from "../../../components/QuickViewModal/QuickViewModal";
import "./CategoryProduct.css";
import { getProductById } from "../../../api/products";

const CategoryProduct = ({ categorySlug = "112", categoryTitle = "Kids Collections" }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quickLoading, setQuickLoading] = useState(false);
    const navigate = useNavigate();

    const handleQuickView = async (id) => {
        setQuickLoading(id);
        try {
            const [product] = await Promise.all([
                getProductById(id),
                new Promise((resolve) => setTimeout(resolve, 1000))
            ]);
            
            setSelectedProduct(product);
            setIsQuickViewOpen(true);

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "view_content",
                ecommerce: {
                    currency: "BDT", // আপনার সাইটের কারেন্সি অনুযায়ী চেঞ্জ করতে পারেন
                    items: [{
                        item_id: product.id?.toString(), // ID স্ট্রিং ফরম্যাটে পাঠানো বেস্ট প্র্যাকটিস
                        item_name: product.name,
                        price: parseFloat(product.price || 0) // প্রাইস ফ্লোট/নাম্বার ফরম্যাটে কনভার্ট করা হলো
                    }]
                }
            });

        } catch (error) {
            console.error("Error loading product:", error);
        } finally {
            setQuickLoading(null);
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await wcApi.get("/products", {
                    params: {
                        category: categorySlug,
                        per_page: 8,
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

    const getSlugFromPermalink = (permalink) => {
        if (!permalink) return "";
        return permalink.split("/").filter(Boolean).pop();
    };

    const handleCardClick = (permalink) => {
        const slug = getSlugFromPermalink(permalink);
        if (slug) navigate(`/product/${slug}`);
    };

    const decodeHtml = (html) => {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    };

    if (!loading && products.length === 0) return null;

    console.log("Products:", products);

    return (
        <aside className="section category-products">
            <div className="container">
                {/* Title Section */}
                <div className="underline-title-section-title-wrap">
                    <div className="title-left">
                        <h2>{categoryTitle}</h2>
                        <div className="title-underline"></div>
                    </div>
                    <Link to={`/product-category/${categorySlug}`} className="view-all-link">
                        VIEW ALL ITEMS <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>
                
                <div className="products-grid-container">
                    {loading ? (
                        <div className="category-products-loader">
                            <div className="full-page-loader">
                                <div className="spinner"></div>
                                <p>Loading {categoryTitle}...</p>
                            </div>
                        </div>
                    ) : (
                        products.map((product) => {
                            const regularPrice = parseFloat(product.prices?.regular_price || product.regular_price || 0);
                            const salePrice = parseFloat(product.prices?.sale_price || product.sale_price || 0);
                            const isSale = (product.on_sale || product.sale_price) && salePrice > 0 && regularPrice > salePrice;
                            const savePercent = isSale ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;
                            const isOutOfStock = product.stock_status === "outofstock";

                            // Priority dynamic category mapping
                            const productCategories = product.categories?.map(c => c.slug) || [];
                            let ribbonText = "";
                            if (productCategories.includes("best-selling")) {
                                ribbonText = "Best Selling";
                            } else if (productCategories.includes("free-delivery")) {
                                ribbonText = "Free Delivery";
                            } else if (productCategories.includes("new-arrival")) {
                                ribbonText = "New Arrival";
                            }

                            return (
                                <div key={product.id} className="custom-product-card">
                                    <Link
                                        to={`/product/${getSlugFromPermalink(product.permalink)}`}
                                        className="product-card-inner"
                                    >
                                        <div className="product-image-box">
                                            {isSale && savePercent > 0 && (
                                                <div className="badge-wrap">
                                                    <span className="ribbon-offered">{savePercent}% Off</span>
                                                    {ribbonText && <span className="ribbon-save">{ribbonText}</span>}
                                                </div>
                                            )}
                                            <img alt={product.name} src={product.images[0]?.src || ""} />
                                            {isOutOfStock && <span className="ribbon-out-stock">Out of Stock</span>}
                                        </div>
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

                                            <div className="card-button-group">
                                                <button 
                                                    className="btn-cart-action"
                                                    disabled={quickLoading === product.id}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleQuickView(product.id);
                                                    }}
                                                >
                                                    {quickLoading === product.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-shopping-cart"></i>} CART
                                                </button>
                                                <button 
                                                    className="btn-buy-action" 
                                                    onClick={(e) => { e.stopPropagation(); handleCardClick(product.permalink); }}
                                                >
                                                    BUY NOW
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })
                    )}
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