import React from "react";
import './QuickViewModal.css';

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  return (
    <div className="quick-view-content white-popup-block mfp-hide" id="quick-view-content-wrappr">
        <div className="product-single">
            <div className="inner-wrapper">
            <div className="col-grid-6">
                <div className="single-thumb-detail clear-fix">
                <div className="single-main-thumb clear-fix">
                    <div className="single-thumb">
                    <span className="ribbon-rotated onsale">-16%</span>
                    <a href="/">
                        <img alt="product" src="images/shop/product-1.jpg" />
                    </a>
                    </div>
                    <div className="single-thumb">
                    <span className="ribbon-rotated onsale">-16%</span>
                    <a href="/">
                        <img alt="product" src="images/shop/product-2.jpg" />
                    </a>
                    </div>
                    <div className="single-thumb">
                    <span className="ribbon-rotated onsale">-16%</span>
                    <a href="/">
                        <img alt="product" src="images/shop/product-3.jpg" />
                    </a>
                    </div>
                    <div className="single-thumb">
                    <span className="ribbon-rotated onsale">-16%</span>
                    <a href="/">
                        <img alt="product" src="images/shop/product-4.jpg" />
                    </a>
                    </div>
                </div>

                <div className="pager-thumbnail section-carousel-enabled">
                    <div className="pager-thumb active">
                    <img alt="product" src="images/shop/product-1.jpg" />
                    </div>
                    <div className="pager-thumb">
                    <img alt="product" src="images/shop/product-2.jpg" />
                    </div>
                    <div className="pager-thumb">
                    <img alt="product" src="images/shop/product-3.jpg" />
                    </div>
                    <div className="pager-thumb">
                    <img alt="product" src="images/shop/product-4.jpg" />
                    </div>
                </div>
                </div>
            </div>

            <div className="col-grid-6">
                <div className="summary entry-summary">
                <div className="product-item-details">
                    <h2 className="product-title">
                    <a href="/" title="title">
                        Asymmetric Ruffle Skirt
                    </a>
                    </h2>

                    <div className="rating-wrapper clear-fix">
                    <div className="product-ratings">
                        <span className="star active"></span>
                        <span className="star active"></span>
                        <span className="star active"></span>
                        <span className="star"></span>
                        <span className="star"></span>
                    </div>
                    <ul className="info-links">
                        <li>
                        <a href="/"> (3.5) 54 Ratings </a>
                        </li>
                        <li>
                        <a href="/"> 4 Reviews </a>
                        </li>
                    </ul>
                    </div>

                    <div className="product-price-container">
                    <del className="dis-price">$65.99</del>
                    <span className="fix-price">$45.99</span>
                    </div>
                </div>

                <div className="item-content">
                    <p>
                    Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.
                    </p>
                </div>

                <div className="availability">
                    <i className="fas fa-check-circle"></i>
                    <span>200 in stock</span>
                </div>

                <div className="quick-filter filter-by-color">
                    <div className="filter-color-container">
                    <a href="/" className="filter-color-box color-1 active" title="color-1"></a>
                    <a href="/" className="filter-color-box color-2" title="color-2"></a>
                    <a href="/" className="filter-color-box color-3" title="color-3"></a>
                    <a href="/" className="filter-color-box color-4" title="color-4"></a>
                    <a href="/" className="filter-color-box color-5" title="color-5"></a>
                    <a href="/" className="filter-color-box color-6" title="color-6"></a>
                    </div>
                </div>

                <div className="quick-filter filter-by-size">
                    <div className="filter-size-container">
                    <a href="/" className="filter-size-box active">xs</a>
                    <a href="/" className="filter-size-box">s</a>
                    <a href="/" className="filter-size-box">m</a>
                    <a href="/" className="filter-size-box">l</a>
                    <a href="/" className="filter-size-box">xl</a>
                    </div>
                </div>

                <form className="single-cart" method="post">
                    <input type="number" className="input-text" step="1" min="1" defaultValue="1" />
                    <button type="submit" name="add-ro-cart" className="custom-button button-small">
                    Add To Cart
                    </button>
                    <button type="submit" name="add-ro-cart" className="custom-button custom-secondary-button button-small">
                    Wishlist
                    </button>
                </form>

                <div className="entry-meta product-meta">
                    <h4>CATEGORY :</h4>
                    <span className="cat-links">
                    <a href="/" rel="tag">Clothes,</a>
                    <a href="/" rel="tag">Winter</a>
                    </span>
                </div>

                <div className="share-on">
                    <h4>SHARE US:</h4>
                    <div className="social-links text-alignleft">
                    <ul>
                        <li><a href="http://facebook.com/" title="t">Facebook</a></li>
                        <li><a href="http://twitter.com/">Twitter</a></li>
                        <li><a href="http://linkedin.com/">Linkedln</a></li>
                        <li><a href="http://youtube.com/">Linkedln</a></li>
                    </ul>
                    </div>
                </div>

                </div>
            </div>
            </div>
        </div>
    </div>

  );
};

export default QuickViewModal;
