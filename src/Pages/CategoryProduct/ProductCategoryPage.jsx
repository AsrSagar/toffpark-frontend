import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import config from "../../config";

const CategoryProducts = () => {
  const API_URL = config.API_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const [loadingId, setLoadingId] = useState(null);

  // Extract full category path
  const categoryPath = location.pathname
    .replace("/wp-react-theme/product-category/", "")
    .replace(/\/$/, "");

  // WooCommerce uses the LAST slug
  const slug = categoryPath.split("/").pop();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getSlugFromPermalink = (permalink) => {
    if (!permalink) return "";
    const parts = permalink.split("/").filter(Boolean);
    return parts[parts.length - 1];
  }

  const goToProduct = (productLink) => {
    const slug = getSlugFromPermalink(productLink);
    navigate(`/wp-react-theme/product/${slug}`);
  };

  const handleAddToCart = (product) => {
    if (!isInCart(product.id)) {
      setLoadingId(product.id);
      setTimeout(() => {
        addToCart(product);
        setLoadingId(null);
      }, 600);
    }
  };

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    fetch(
      `${API_URL}/wc/store/v1/products?category=${slug}`
    )
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, [slug, API_URL]);

  return (
    <>
      <div id="custom-header">
        <div className="custom-header-content">
          <div className="container">
            <h1 className="page-title">{slug.replace(/-/g, " ")}</h1>
            <div id="breadcrumb">
              <div
                aria-label="Breadcrumbs"
                className="breadcrumbs breadcrumb-trail"
              >
                <ul className="trail-items">
                  <li className="trail-item trail-begin">
                    <a href="/" rel="home">
                      <span>Home</span>
                    </a>
                  </li>
                  {categoryPath.split("/").map((item, index) => (
                    <li key={index} className="trail-item">
                      <span>{item.replace(/-/g, " ")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="content" className="site-content global-layout-right-sidebar">
        <div className="container">
          <div className="inner-wrapper">
            <div id="primary" className="content-area">
              <main id="main" className="site-main">
                <div className="section-products">
                  <div className="inner-wrapper">
                    <div className="products-inner-wrapper clear-fix">
                      {loading && (
                        <div className="grid-message">
                          <p>Loading products...</p>
                        </div>
                      )}
                      {!loading && products.length === 0 && (
                        <div className="grid-message">
                          <p>No products found.</p>
                        </div>
                      )}
                      {!loading && products.length > 0 && (
                        <div className="products-grid-row clear-fix">
                          {products.map((product) => (
                            <div
                              key={product.id}
                              className="product-item col-grid-4 top-space"
                            >
                              <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                                <div className="product-thumb zoom-effect">
                                    <a
                                      href="/"
                                      className="thumbnail"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        goToProduct(product.link);
                                      }}
                                    >
                                      <img alt={product.name} src={product.images[0]?.src} />
                                    </a>

                                    <div className="pruduct-buttons">
                                        <button
                                          className="product-button tooltip"
                                          onClick={() => handleAddToCart(product)}
                                          disabled={loadingId === product.id || isInCart(product.id)}
                                        >
                                          <i
                                            className={
                                              loadingId === product.id
                                                ? "fas fa-spinner fa-spin"
                                                : isInCart(product.id)
                                                ? "fas fa-check"
                                                : "fas fa-cart-plus"
                                            }
                                          ></i>
                                          <span className="tooltiptext tooltip-right">
                                            {loadingId === product.id
                                              ? "Adding..."
                                              : isInCart(product.id)
                                              ? "Added"
                                              : "Add To Cart"}
                                          </span>
                                        </button>
                                        <button href="#" className="product-button tooltip">
                                            <i className="far fa-heart"></i>
                                            <span className="tooltiptext tooltip-right">Wishlist</span>
                                        </button>
                                        <button href="#" className="product-button tooltip">
                                            <i className="fa fa-retweet"></i>
                                            <span className="tooltiptext tooltip-right">Compair</span>
                                        </button>
                                    </div>
                                    <div className="quick-view">
                                        <a href="#quick-view-content-wrappr" className="custom-button button-small quick-view-link">
                                            <i className="far fa-eye"></i>Quick View
                                        </a>
                                    </div>
                                    <span className="ribbon-rotated onsale">-16%</span>
                                </div>

                                <div className="product-item-details">
                                  <h3 className="product-title">
                                    <Link to={`/product/${getSlugFromPermalink(product.permalink)}`}>
                                      {product.name}
                                    </Link>
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
                      )}
                    </div>
                  </div>
                </div>
              </main>
            </div>

            {/* SIDEBAR */}
            <div id="sidebar-primary" className="sidebar widget-area">
              <div className="sidebar-widget-wrapper">
                <aside className="widget widget-category">
                  <h3 className="widget-title">Categories</h3>
                  <ul>
                    <li>
                      <a href="/wp-react-theme/product-category/winter">
                        Winter
                      </a>
                    </li>
                    <li>
                      <a href="/wp-react-theme/product-category/winter/jackets">
                        Jackets
                      </a>
                    </li>
                    <li>
                      <a href="/wp-react-theme/product-category/winter/jackets/leather">
                        Leather Jackets
                      </a>
                    </li>
                  </ul>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryProducts;