import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import config from "../../config";
import './ProductCategoryPage.css';

const CategoryProducts = () => {
  const API_URL = config.API_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, setCartOpen, isInCart } = useCart();

  const [loadingId, setLoadingId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Pagination & Sorting States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const PER_PAGE = 12;

  // Extract full category path
  const categoryPath = location.pathname
    .replace("/product-category/", "")
    .replace(/\/$/, "");

  // WooCommerce uses LAST slug
  const slug = categoryPath.split("/").pop();
  const categoryName = slug.replace(/-/g, " ");

  const getSlugFromPermalink = (permalink) => {
    if (!permalink) return "";
    const parts = permalink.split("/").filter(Boolean);
    return parts[parts.length - 1];
  };

  const goToProduct = (productLink) => {
    const slug = getSlugFromPermalink(productLink);
    navigate(`/product/${slug}`);
  };

  const handleAddToCart = (product) => {
    if (isInCart(product.id)) return;
    if (!product.is_in_stock || !product.is_purchasable) return;

    setLoadingId(product.id);

    const addProduct = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));

        addToCart(product);
        setCartOpen(true);

        // ✅ AddToCart Event
        // if (window.fbq) {
        //   window.fbq("track", "AddToCart", {
        //     content_ids: [product.id],
        //     content_name: product.name,
        //     value: product.prices?.price
        //       ? parseFloat(product.prices.price) / 100
        //       : 0,
        //     currency: "BDT",
        //   });
        // }
      } catch (error) {
        console.error("Add to cart failed:", error);
      } finally {
        setLoadingId(null);
      }
    };

    addProduct();
  };

  // ✅ Sorting Handler
  const handleSort = (type) => {
    setCurrentPage(1);

    switch (type) {
      case "popularity":
        setSortBy("popularity");
        setSortOrder("desc");
        break;
      case "rating":
        setSortBy("rating");
        setSortOrder("desc");
        break;
      case "price_low":
        setSortBy("price");
        setSortOrder("asc");
        break;
      case "price_high":
        setSortBy("price");
        setSortOrder("desc");
        break;
      default:
        setSortBy("date");
        setSortOrder("desc");
    }
  };

  // Fetch category products
  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    fetch(
      `${API_URL}/wc/store/v1/products?category=${slug}&page=${currentPage}&per_page=${PER_PAGE}&orderby=${sortBy}&order=${sortOrder}`
    )
      .then((res) => {
        const total = res.headers.get("X-WP-TotalPages");
        setTotalPages(Number(total) || 1);
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, [slug, currentPage, sortBy, sortOrder, API_URL]);

  // ✅ ViewCategory + ViewContent (StrictMode Safe)
  useEffect(() => {
    if (!slug) return;

    const eventKey = `view_category_${slug}`;
    if (sessionStorage.getItem(eventKey)) return;

    const fireEvents = () => {
      if (!window.fbq) return;
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
                  <div className="pruduct-filter-row clear-fix">
                    <div className="filter-row-box product-listing-filter">
                      <div className="sort-by">
                        <span className="sort-by-list">Sort by</span>
                        <ul>
                          <li><a href="/" onClick={(e)=>{e.preventDefault();handleSort("popularity")}}>Sort by popularity</a></li>
                          <li><a href="/" onClick={(e)=>{e.preventDefault();handleSort("rating")}}>Sort by average rating</a></li>
                          <li><a href="/" onClick={(e)=>{e.preventDefault();handleSort("newness")}}>Sort by newness</a></li>
                          <li><a href="/" onClick={(e)=>{e.preventDefault();handleSort("price_low")}}>Sort by price: low to high</a></li>
                          <li><a href="/" onClick={(e)=>{e.preventDefault();handleSort("price_high")}}>Sort by price: high to low</a></li>
                        </ul>
                      </div>
                    </div>
                    <nav className="filter-row-box navigation pagination pull-right">
                      <div className="nav-links">
                        {currentPage > 1 && (
                          <span
                            className="page-numbers"
                            onClick={() => setCurrentPage(currentPage - 1)}
                          >
                            « Prev
                          </span>
                        )}

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .slice(Math.max(currentPage - 2, 0), currentPage + 1)
                          .map((page) => (
                            <span
                              key={page}
                              className={`page-numbers ${
                                currentPage === page ? "current" : ""
                              }`}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </span>
                          ))}

                        {currentPage < totalPages && (
                          <span
                            className="page-numbers"
                            onClick={() => setCurrentPage(currentPage + 1)}
                          >
                            Next »
                          </span>
                        )}
                      </div>
                    </nav>
                  </div>
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
                          {products.map((product) => {
                            const isOutOfStock = !product.is_in_stock || !product.is_purchasable;
                            return(
                              <div
                              key={product.id}
                              className="product-item col-grid-3 top-space"
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
                                        isInCart(product.id) ||
                                        isOutOfStock
                                      }
                                    >
                                      <i
                                        className={
                                          isOutOfStock
                                            ? "fas fa-times"
                                            : loadingId === product.id
                                            ? "fas fa-spinner fa-spin"
                                            : isInCart(product.id)
                                            ? "fas fa-check"
                                            : "fas fa-cart-plus"
                                        }
                                      ></i>
                                      <span className="tooltiptext tooltip-right">
                                        {isOutOfStock
                                          ? "Out of Stock"
                                          : loadingId === product.id
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

                                  {isOutOfStock && (
                                    <span className="ribbon-rotated onsale">
                                      Out of Stock
                                    </span>
                                  )}
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
                            )
                          }
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </main>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryProducts;
