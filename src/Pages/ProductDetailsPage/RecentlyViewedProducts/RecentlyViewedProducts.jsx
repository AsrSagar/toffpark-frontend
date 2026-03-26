import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import config from "../../../config";
import "./RecentlyViewedProducts.css";

const RecentlyViewedProducts = () => {
    const [products, setProducts] = useState([]);
    const API_URL = config.API_URL;
    const { slug } = useParams(); // optional if you want to exclude current

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

    // const NextArrow = (props) => {
    //     const { className, style, onClick } = props;
    //     return (
    //         <div
    //         className={className}
    //         style={{ ...style, display: "block", right: "-25px", zIndex: 1 }}
    //         onClick={onClick}
    //         />
    //     );
    // };

    // const PrevArrow = (props) => {
    //     const { className, style, onClick } = props;
    //     return (
    //         <div
    //         className={className}
    //         style={{ ...style, display: "block", left: "-25px", zIndex: 1 }}
    //         onClick={onClick}
    //         />
    //     );
    // };

    // const settings = {
    //     dots: false,
    //     infinite: false,
    //     speed: 500,
    //     slidesToShow: 4,
    //     slidesToScroll: 1,
    //     arrows: true,
    //     nextArrow: <NextArrow />,
    //     prevArrow: <PrevArrow />,
    //     responsive: [
    //         { breakpoint: 1024, settings: { slidesToShow: 3 } },
    //         { breakpoint: 768, settings: { slidesToShow: 2 } },
    //         { breakpoint: 480, settings: { slidesToShow: 1 } },
    //     ],
    // };

    return (
        <div className="section-products related-product clear-fix top-space">
            <div className="section-title-wrap text-alignleft">
                <h2 className="section-title">Recently Viewed Products</h2>
                <span className="divider"></span>
            </div>
            <div className="inner-wrapper">
                <div className="products-inner-wrapper clear-fix section-carousel-enabled byapr-carousel">
                    {products.map(product => (
                        <div key={product.id} className="product-item col-grid-3">
                            <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                                <div className="product-thumb zoom-effect">
                                    <Link className="thumbnail" to={`/product/${product.slug}`}>
                                        <img alt={product.name} src={product.images[0].src} />
                                    </Link>
                                    {product.on_sale && product.regular_price && product.sale_price && (
                                        <span className="ribbon-rotated onsale">
                                            -{Math.round(((product.regular_price - product.sale_price)/product.regular_price)*100)}%
                                        </span>
                                    )}
                                    <div className="quick-view">
                                        <Link
                                            to={`/product/${product.slug}`}
                                            className="custom-button button-small quick-view-link"
                                        >
                                            VIEW PRODUCT
                                        </Link>
                                    </div>
                                </div>
                                <div className="product-item-details">
                                    <h3 className="product-title">
                                        <Link to={`/product/${product.slug}`}>{product.name}</Link>
                                    </h3>
                                    <div
                                        className="product-price-container"
                                        dangerouslySetInnerHTML={{ __html: product.price_html }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecentlyViewedProducts;