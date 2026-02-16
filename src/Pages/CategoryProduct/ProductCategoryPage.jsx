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
    .replace("/product-category/", "")
    .replace(/\/$/, "");

  // WooCommerce uses LAST slug
  const slug = categoryPath.split("/").pop();
  const categoryName = slug.replace(/-/g, " ");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getSlugFromPermalink = (permalink) => {
    if (!permalink) return "";
    const parts = permalink.split("/").filter(Boolean);
    return parts[parts.length - 1];
  };

  const goToProduct = (productLink) => {
    const slug = getSlugFromPermalink(productLink);
    navigate(`/wp-react-theme/product/${slug}`);
  };

  const handleAddToCart = (product) => {
    if (isInCart(product.id)) return;

    setLoadingId(product.id);

    const addProduct = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
        addToCart(product);

        // ✅ AddToCart Event
        if (window.fbq) {
          window.fbq("track", "AddToCart", {
            content_ids: [product.id],
            content_name: product.name,
            value: product.prices?.price
              ? parseFloat(product.prices.price) / 100
              : 0,
            currency: "BDT",
          });
        }
      } catch (error) {
        console.error("Add to cart failed:", error);
      } finally {
        setLoadingId(null);
      }
    };

    addProduct();
  };

  // Fetch category products
  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    fetch(`${API_URL}/wc/store/v1/products?category=${slug}`)
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

  // ✅ ViewCategory + ViewContent (StrictMode Safe)
  useEffect(() => {
    if (!slug) return;

    const eventKey = `view_category_${slug}`;
    if (sessionStorage.getItem(eventKey)) return;

    const fireEvents = () => {
      if (!window.fbq) return;

      // Standard Meta Event
      window.fbq("track", "ViewContent", {
        content_type: "product_group",
        content_category: categoryName,
      });

      // Custom Event
      window.fbq("trackCustom", "ViewCategory", {
        category_name: categoryName,
      });

      sessionStorage.setItem(eventKey, "true");
    };

    if (window.fbq) {
      fireEvents();
    } else {
      const interval = setInterval(() => {
        if (window.fbq) {
          fireEvents();
          clearInterval(interval);
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [slug, categoryName]);

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
                                    <img
                                      alt={product.name}
                                      src={product.images[0]?.src}
                                    />
                                  </a>

                                  <div className="pruduct-buttons">
                                    <button
                                      className="product-button tooltip"
                                      onClick={() => handleAddToCart(product)}
                                      disabled={
                                        loadingId === product.id ||
                                        isInCart(product.id)
                                      }
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

                                    <button className="product-button tooltip">
                                      <i className="far fa-heart"></i>
                                      <span className="tooltiptext tooltip-right">Wishlist</span>
                                    </button>

                                    <button className="product-button tooltip">
                                      <i className="fa fa-retweet"></i>
                                      <span className="tooltiptext tooltip-right">Compare</span>
                                    </button>
                                  </div>

                                  <div className="quick-view">
                                    <a
                                      href="#quick-view-content-wrappr"
                                      className="custom-button button-small quick-view-link"
                                    >
                                      <i className="far fa-eye"></i>Quick View
                                    </a>
                                  </div>

                                  <span className="ribbon-rotated onsale">
                                    -16%
                                  </span>
                                </div>

                                <div className="product-item-details">
                                  <h3 className="product-title">
                                    <Link
                                      to={`/product/${getSlugFromPermalink(product.permalink)}`}
                                    >
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
                      <a href="/wp-react-theme/product-category/winter">Winter</a>
                    </li>
                    <li>
                      <a href="/wp-react-theme/product-category/winter/jackets">Jackets</a>
                    </li>
                    <li>
                      <a href="/wp-react-theme/product-category/winter/jackets/leather">Leather Jackets</a>
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
