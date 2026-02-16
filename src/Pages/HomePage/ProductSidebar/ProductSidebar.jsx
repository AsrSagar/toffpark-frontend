import React from "react";

const ProductSidebar = () => {
    return (
        <aside className="section">
            <div className="container">
                <div className="inner-wrapper">
                {/* Featured */}
                <div className="col-grid-4">
                    <div className="recent-product-list">
                    <div className="section-title-wrap text-alignleft">
                        <h2 className="section-title">Featured</h2>
                    </div>

                    <div className="products-list">
                        <a href="/" className="product-thumb" title="Product Name">
                        <img src="images/shop/product-1.jpg" alt="product" className="product-image" />
                        </a>

                        <h5 className="product-title">
                        <a href="/">Cold Shoulder Wrap Top</a>
                        </h5>

                        <div className="product-ratings">
                        <span className="star active" />
                        <span className="star active" />
                        <span className="star active" />
                        <span className="star" />
                        <span className="star" />
                        </div>

                        <div className="product-price-container">
                        <span className="fix-price">$45.99</span>
                        </div>

                        <div className="pruduct-buttons">
                        <a href="/" className="product-button tooltip">
                            <i className="fas fa-cart-plus" />
                            <span className="tooltiptext tooltip-bottom">Add To Cart</span>
                        </a>
                        <a href="/" className="product-button tooltip">
                            <i className="far fa-heart" />
                            <span className="tooltiptext tooltip-bottom">Wishlist</span>
                        </a>
                        <a href="#quick-view-content-wrappr" className="product-button quick-view-link tooltip">
                            <i className="far fa-eye" />
                            <span className="tooltiptext tooltip-bottom">Quick View</span>
                        </a>
                        </div>
                    </div>

                    <div className="products-list">
                        <a href="/" className="product-thumb" title="Product Name">
                        <img src="images/shop/product-2.jpg" alt="product" className="product-image" />
                        </a>

                        <h5 className="product-title">
                        <a href="/">Plaid Flounce Skirt</a>
                        </h5>

                        <div className="product-ratings">
                        <span className="star active" />
                        <span className="star active" />
                        <span className="star active" />
                        <span className="star" />
                        <span className="star" />
                        </div>

                        <div className="product-price-container">
                        <span className="fix-price">$45.99</span>
                        </div>

                        <div className="pruduct-buttons">
                        <a href="/" className="product-button tooltip">
                            <i className="fas fa-cart-plus" />
                            <span className="tooltiptext tooltip-bottom">Add To Cart</span>
                        </a>
                        <a href="/" className="product-button tooltip">
                            <i className="far fa-heart" />
                            <span className="tooltiptext tooltip-bottom">Wishlist</span>
                        </a>
                        <a href="#quick-view-content-wrappr" className="product-button quick-view-link tooltip">
                            <i className="far fa-eye" />
                            <span className="tooltiptext tooltip-bottom">Quick View</span>
                        </a>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Popular */}
                <div className="col-grid-4">
                    <div className="recent-product-list">
                    <div className="section-title-wrap text-alignleft">
                        <h2 className="section-title">Popular</h2>
                    </div>

                    <div className="products-list">
                        <a href="/" className="product-thumb">
                        <img src="images/shop/product-3.jpg" alt="product" className="product-image" />
                        </a>

                        <h5 className="product-title">
                        <a href="/">Pocket Flare Dress</a>
                        </h5>

                        <div className="product-ratings">
                        <span className="star active" />
                        <span className="star active" />
                        <span className="star active" />
                        <span className="star" />
                        <span className="star" />
                        </div>

                        <div className="product-price-container">
                        <span className="fix-price">$45.99</span>
                        </div>
                    </div>

                    <div className="products-list">
                        <a href="/" className="product-thumb">
                        <img src="images/shop/product-4.jpg" alt="product" className="product-image" />
                        </a>

                        <h5 className="product-title">
                        <a href="/">Asymmetric Ruffle Skirt</a>
                        </h5>

                        <div className="product-ratings">
                        <span className="star active" />
                        <span className="star active" />
                        <span className="star active" />
                        <span className="star" />
                        <span className="star" />
                        </div>

                        <div className="product-price-container">
                        <span className="fix-price">$45.99</span>
                        </div>
                    </div>
                    </div>
                </div>

                {/* On Sale */}
                <div className="col-grid-4">
                    <div className="recent-product-list">
                    <div className="section-title-wrap text-alignleft">
                        <h2 className="section-title">On Sale</h2>
                    </div>

                    <div className="products-list">
                        <a href="/" className="product-thumb">
                        <img src="images/shop/product-5.jpg" alt="product" className="product-image" />
                        <span className="ribbon-rotated onsale">-16%</span>
                        </a>

                        <h5 className="product-title">
                        <a href="/">Cold Shoulder Faux</a>
                        </h5>

                        <div className="product-price-container">
                        <del className="dis-price">$65.99</del>
                        <span className="fix-price">$45.99</span>
                        </div>
                    </div>

                    <div className="products-list">
                        <a href="/" className="product-thumb">
                        <img src="images/shop/product-6.jpg" alt="product" className="product-image" />
                        <span className="ribbon-rotated onsale">-16%</span>
                        </a>

                        <h5 className="product-title">
                        <a href="/">Mixed Stripe Skirt</a>
                        </h5>

                        <div className="product-price-container">
                        <del className="dis-price">$65.99</del>
                        <span className="fix-price">$45.99</span>
                        </div>
                    </div>
                    </div>
                </div>

                </div>
            </div>
        </aside>

    );
};  

export default ProductSidebar;