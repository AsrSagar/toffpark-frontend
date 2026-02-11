import React from "react";
const NewProducts = () => {
    return (
        <aside className="section">
            <div className="section-products">
                <div className="container">
                <div className="section-title-wrap">
                    <h2 className="section-title">New Products</h2>
                </div>

                <div className="inner-wrapper">
                    <div
                    className="products-inner-wrapper iteam-col-4 section-carousel-enabled byapr-carousel"
                    data-slick='{"slidesToShow":4,"dots":false,"prevArrow":"<span data-role=\"none\" class=\"slick-prev\" tabindex=\"0\"><i class=\"fa fa-angle-left\" aria-hidden=\"true\"></i></span>","nextArrow":"<span data-role=\"none\" class=\"slick-next\" tabindex=\"0\"><i class=\"fa fa-angle-right\" aria-hidden=\"true\"></i></span>","responsive":[{"breakpoint":1024,"settings":{"slidesToShow":4}},{"breakpoint":800,"settings":{"slidesToShow":3}},{"breakpoint":659,"settings":{"slidesToShow":2}},{"breakpoint":479,"settings":{"slidesToShow":1}}]}'
                    >
                    <div className="product-item col-grid-3">
                        <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                        <div className="product-thumb zoom-effect">
                            <a className="thumbnail" href="/">
                            <img alt="product" src="images/shop/product-5.jpg" />
                            </a>

                            <div className="pruduct-buttons">
                            <a href="/" className="product-button tooltip">
                                <i className="fas fa-cart-plus"></i>
                                <span className="tooltiptext tooltip-right">Add To Cart</span>
                            </a>
                            <a href="/" className="product-button tooltip">
                                <i className="far fa-heart"></i>
                                <span className="tooltiptext tooltip-right">Wishlist</span>
                            </a>
                            <a href="/" className="product-button tooltip">
                                <i className="fa fa-retweet"></i>
                                <span className="tooltiptext tooltip-right">Compair</span>
                            </a>
                            </div>

                            <div className="quick-view">
                            <a href="/" className="custom-button button-small quick-view-link">
                                <i className="far fa-eye"></i> Quick View
                            </a>
                            </div>

                            <span className="ribbon-rotated onsale">-16%</span>
                        </div>

                        <div className="product-item-details">
                            <h3 className="product-title">
                            <a href="product.html" title="title">
                                Cold Shoulder Faux
                            </a>
                            </h3>

                            <div className="product-ratings">
                            <span className="star active"></span>
                            <span className="star active"></span>
                            <span className="star active"></span>
                            <span className="star"></span>
                            <span className="star"></span>
                            </div>

                            <div className="product-price-container">
                            <del className="dis-price">$65.99</del>
                            <span className="fix-price">$45.99</span>
                            </div>
                        </div>
                        </div>
                    </div>

                    <div className="product-item col-grid-3">
                        <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                        <div className="product-thumb zoom-effect">
                            <a className="thumbnail" href="/">
                            <img alt="product" src="images/shop/product-6.jpg" />
                            </a>

                            <div className="pruduct-buttons">
                            <a href="/" className="product-button tooltip">
                                <i className="fas fa-cart-plus"></i>
                                <span className="tooltiptext tooltip-right">Add To Cart</span>
                            </a>
                            <a href="/" className="product-button tooltip">
                                <i className="far fa-heart"></i>
                                <span className="tooltiptext tooltip-right">Wishlist</span>
                            </a>
                            <a href="/" className="product-button tooltip">
                                <i className="fa fa-retweet"></i>
                                <span className="tooltiptext tooltip-right">Compair</span>
                            </a>
                            </div>

                            <div className="quick-view">
                            <a href="/" className="custom-button button-small quick-view-link">
                                <i className="far fa-eye"></i> Quick View
                            </a>
                            </div>
                        </div>

                        <div className="product-item-details">
                            <h3 className="product-title">
                            <a href="product.html" title="title">
                                Mixed Stripe Skirt
                            </a>
                            </h3>

                            <div className="product-ratings">
                            <span className="star active"></span>
                            <span className="star active"></span>
                            <span className="star active"></span>
                            <span className="star"></span>
                            <span className="star"></span>
                            </div>

                            <div className="product-price-container">
                            <span className="fix-price">$600</span>
                            </div>
                        </div>
                        </div>
                    </div>

                    <div className="product-item col-grid-3">
                        <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                        <div className="product-thumb zoom-effect">
                            <a className="thumbnail" href="/">
                            <img alt="product" src="images/shop/product-7.jpg" />
                            </a>

                            <div className="pruduct-buttons">
                            <a href="/" className="product-button tooltip">
                                <i className="fas fa-cart-plus"></i>
                                <span className="tooltiptext tooltip-right">Add To Cart</span>
                            </a>
                            <a href="/" className="product-button tooltip">
                                <i className="far fa-heart"></i>
                                <span className="tooltiptext tooltip-right">Wishlist</span>
                            </a>
                            <a href="/" className="product-button tooltip">
                                <i className="fa fa-retweet"></i>
                                <span className="tooltiptext tooltip-right">Compair</span>
                            </a>
                            </div>

                            <div className="quick-view">
                            <a href="/" className="custom-button button-small quick-view-link">
                                <i className="far fa-eye"></i> Quick View
                            </a>
                            </div>
                        </div>

                        <div className="product-item-details">
                            <h3 className="product-title">
                            <a href="product.html" title="title">
                                Cocktail Dress
                            </a>
                            </h3>

                            <div className="product-ratings">
                            <span className="star active"></span>
                            <span className="star active"></span>
                            <span className="star active"></span>
                            <span className="star"></span>
                            <span className="star"></span>
                            </div>

                            <div className="product-price-container">
                            <del className="dis-price">$500</del>
                            <span className="fix-price">$450</span>
                            </div>
                        </div>
                        </div>
                    </div>

                    <div className="product-item col-grid-3">
                        <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                        <div className="product-thumb zoom-effect">
                            <a className="thumbnail" href="/">
                            <img alt="product" src="images/shop/product-8.jpg" />
                            </a>

                            <div className="pruduct-buttons">
                            <a href="/" className="product-button tooltip">
                                <i className="fas fa-cart-plus"></i>
                                <span className="tooltiptext tooltip-right">Add To Cart</span>
                            </a>
                            <a href="/" className="product-button tooltip">
                                <i className="far fa-heart"></i>
                                <span className="tooltiptext tooltip-right">Wishlist</span>
                            </a>
                            <a href="/" className="product-button tooltip">
                                <i className="fa fa-retweet"></i>
                                <span className="tooltiptext tooltip-right">Compair</span>
                            </a>
                            </div>

                            <div className="quick-view">
                            <a href="/" className="custom-button button-small quick-view-link">
                                <i className="far fa-eye"></i> Quick View
                            </a>
                            </div>

                            <span className="ribbon-rotated hot-item">NEW</span>
                        </div>

                        <div className="product-item-details">
                            <h3 className="product-title">
                            <a href="product.html" title="title">
                                Stripe Tie
                            </a>
                            </h3>

                            <div className="product-ratings">
                            <span className="star active"></span>
                            <span className="star active"></span>
                            <span className="star active"></span>
                            <span className="star"></span>
                            <span className="star"></span>
                            </div>

                            <div className="product-price-container">
                            <span className="fix-price">$500</span>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </aside>

    );
};  

export default NewProducts;