import React from "react";

const PopularProducts = () => {
    return (
        <aside className="section">
            <div className="section-products">
                <div className="container">
                    <div className="section-title-wrap">
                        <h2 className="section-title">Popular Product</h2>
                    </div>
                    <div className="inner-wrapper">
                        <div className="products-inner-wrapper">
                        {/* Product 1 */}
                        <div className="product-item col-grid-3">
                            <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                            <div className="product-thumb zoom-effect">
                                <a className="thumbnail" href="/">
                                <img src="images/shop/product-10.jpg" alt="product" />
                                </a>
                                <div className="pruduct-buttons">
                                <a href="/" className="product-button tooltip">
                                    <i className="fas fa-cart-plus" />
                                    <span className="tooltiptext tooltip-right">Add To Cart</span>
                                </a>
                                <a href="/" className="product-button tooltip">
                                    <i className="far fa-heart" />
                                    <span className="tooltiptext tooltip-right">Wishlist</span>
                                </a>
                                <a href="/" className="product-button tooltip">
                                    <i className="fa fa-retweet" />
                                    <span className="tooltiptext tooltip-right">Compare</span>
                                </a>
                                </div>

                                <div className="quick-view">
                                <a href="#quick-view-content-wrappr" className="custom-button button-small quick-view-link">
                                    <i className="far fa-eye" /> Quick View
                                </a>
                                </div>

                                <span className="ribbon-rotated onsale">-16%</span>
                            </div>

                            <div className="product-item-details">
                                <h3 className="product-title">
                                <a href="/product" title="title">Straight-fit cotton jeans</a>
                                </h3>

                                <div className="product-ratings">
                                <span className="star active" />
                                <span className="star active" />
                                <span className="star active" />
                                <span className="star" />
                                <span className="star" />
                                </div>

                                <div className="product-price-container">
                                <del className="dis-price">$65.99</del>
                                <span className="fix-price">$45.99</span>
                                </div>
                            </div>
                            </div>
                        </div>

                        {/* Product 2 */}
                        <div className="product-item col-grid-3">
                            <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                            <div className="product-thumb zoom-effect">
                                <a className="thumbnail" href="/">
                                <img src="images/shop/product-11.jpg" alt="product" />
                                </a>

                                <div className="pruduct-buttons">
                                <a href="/" className="product-button tooltip">
                                    <i className="fas fa-cart-plus" />
                                    <span className="tooltiptext tooltip-right">Add To Cart</span>
                                </a>
                                <a href="/" className="product-button tooltip">
                                    <i className="far fa-heart" />
                                    <span className="tooltiptext tooltip-right">Wishlist</span>
                                </a>
                                <a href="/" className="product-button tooltip">
                                    <i className="fa fa-retweet" />
                                    <span className="tooltiptext tooltip-right">Compare</span>
                                </a>
                                </div>

                                <div className="quick-view">
                                <a href="#quick-view-content-wrappr" className="custom-button button-small quick-view-link">
                                    <i className="far fa-eye" /> Quick View
                                </a>
                                </div>
                            </div>

                            <div className="product-item-details">
                                <h3 className="product-title">
                                <a href="/product" title="title">Racquet City Shorts</a>
                                </h3>

                                <div className="product-ratings">
                                <span className="star active" />
                                <span className="star active" />
                                <span className="star active" />
                                <span className="star" />
                                <span className="star" />
                                </div>

                                <div className="product-price-container">
                                <span className="fix-price">$600</span>
                                </div>
                            </div>
                            </div>
                        </div>

                        {/* Product 3 */}
                        <div className="product-item col-grid-3">
                            <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                            <div className="product-thumb zoom-effect">
                                <a className="thumbnail" href="/">
                                <img src="images/shop/product-12.jpg" alt="product" />
                                </a>

                                <div className="pruduct-buttons">
                                <a href="/" className="product-button tooltip">
                                    <i className="fas fa-cart-plus" />
                                    <span className="tooltiptext tooltip-right">Add To Cart</span>
                                </a>
                                <a href="/" className="product-button tooltip">
                                    <i className="far fa-heart" />
                                    <span className="tooltiptext tooltip-right">Wishlist</span>
                                </a>
                                <a href="/" className="product-button tooltip">
                                    <i className="fa fa-retweet" />
                                    <span className="tooltiptext tooltip-right">Compare</span>
                                </a>
                                </div>

                                <div className="quick-view">
                                <a href="#quick-view-content-wrappr" className="custom-button button-small quick-view-link">
                                    <i className="far fa-eye" /> Quick View
                                </a>
                                </div>
                            </div>

                            <div className="product-item-details">
                                <h3 className="product-title">
                                <a href="/product" title="title">Palm Leaf Drapey Shorts</a>
                                </h3>

                                <div className="product-ratings">
                                <span className="star active" />
                                <span className="star active" />
                                <span className="star active" />
                                <span className="star" />
                                <span className="star" />
                                </div>

                                <div className="product-price-container">
                                <del className="dis-price">$500</del>
                                <span className="fix-price">$450</span>
                                </div>
                            </div>
                            </div>
                        </div>

                        {/* Product 4 */}
                        <div className="product-item col-grid-3">
                            <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                            <div className="product-thumb zoom-effect">
                                <a className="thumbnail" href="/">
                                <img src="images/shop/product-14.jpg" alt="product" />
                                </a>

                                <div className="pruduct-buttons">
                                <a href="/" className="product-button tooltip">
                                    <i className="fas fa-cart-plus" />
                                    <span className="tooltiptext tooltip-right">Add To Cart</span>
                                </a>
                                <a href="/" className="product-button tooltip">
                                    <i className="far fa-heart" />
                                    <span className="tooltiptext tooltip-right">Wishlist</span>
                                </a>
                                <a href="/" className="product-button tooltip">
                                    <i className="fa fa-retweet" />
                                    <span className="tooltiptext tooltip-right">Compare</span>
                                </a>
                                </div>

                                <div className="quick-view">
                                <a href="#quick-view-content-wrappr" className="custom-button button-small quick-view-link">
                                    <i className="far fa-eye" /> Quick View
                                </a>
                                </div>

                                <span className="ribbon-rotated hot-item">NEW</span>
                            </div>

                            <div className="product-item-details">
                                <h3 className="product-title">
                                <a href="/product" title="title">Applique Graphic Tee</a>
                                </h3>

                                <div className="product-ratings">
                                <span className="star active" />
                                <span className="star active" />
                                <span className="star active" />
                                <span className="star" />
                                <span className="star" />
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
export default PopularProducts;