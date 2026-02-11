import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import config from "../../config";

const ShopPage = () => {
  const API_URL = config.API_URL;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 12;

  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  // Extract slug safely from WooCommerce permalink
  const getSlugFromPermalink = (permalink) => {
    if (!permalink) return "";
    return permalink.split("/").filter(Boolean).pop();
  };

  const goToProduct = (permalink) => {
    const slug = getSlugFromPermalink(permalink);
    if (!slug) return;
    navigate(`/product/${slug}`);
  };

  const handleAddToCart = (product) => {
    if (!isInCart(product.id)) {
      // qty defaults to 1
      addToCart(product);
    }
  };

  // Fetch products from WooCommerce
  useEffect(() => {
    setLoading(true);
    fetch(
      `${API_URL}/wc/store/v1/products?page=${currentPage}&per_page=${perPage}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        const total = res.headers.get("X-WP-TotalPages");
        if (total) setTotalPages(Number(total));
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Product fetch error:", err);
        setError("Failed to load products.");
        setLoading(false);
      });
  }, [API_URL, currentPage]);

  console.log(error);

  // Generate pagination numbers with "..." logic
  const getPagination = (current, total) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <div id="custom-header">
        <div className="custom-header-content">
          <div className="container">
            <h1 className="page-title">Shop</h1>
            <div id="breadcrumb">
              <div aria-label="Breadcrumbs" className="breadcrumbs breadcrumb-trail">
                <ul className="trail-items">
                  <li className="trail-item trail-begin"><span>Home</span></li>
                  <li className="trail-item trail-end"><span>Shop</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div id="content" className="site-content default-full-width">
        <div className="container">
          <div className="inner-wrapper">
            <div id="primary" className="content-area">
              <main id="main" className="site-main">
                <div className="section-products">
                  {/* ===== Filter & Pagination Top ===== */}
                  <div className="pruduct-filter-row clear-fix">
                    <div className="filter-row-box product-view pull-left">
                      <a href="#l" className="cat-grid active" title="Category grid"><i className="fa fa-th"></i></a>
                      <a href="/" className="cat-list" title="Category List"><i className="fa fa-th-list"></i></a>
                    </div>
                    <div className="filter-row-box product-listing-filter">
                      <div className="sort-by">
                        <span className="sort-by-list">Sort by popularity</span>
                        <ul>
                          <li><a href="/">Sort by popularity</a></li>
                          <li><a href="/">Sort by average rating</a></li>
                          <li><a href="/">Sort by newness</a></li>
                          <li><a href="/">Sort by price: low to high</a></li>
                          <li><a href="/">Sort by price: high to low</a></li>
                        </ul>
                      </div>
                    </div>
                    <nav className="filter-row-box navigation pagination pull-right">
                      <div className="nav-links">
                        {/* Prev */}
                        <button
                          className="prev page-numbers"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                          « Prev
                        </button>

                        {/* Page numbers */}
                        {getPagination(currentPage, totalPages).map((page, idx) =>
                          page === "..." ? (
                            <span key={idx} className="dots">…</span>
                          ) : (
                            <button
                              key={idx}
                              className={`page-numbers ${page === currentPage ? "current" : ""}`}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          )
                        )}

                        {/* Next */}
                        <button
                          className="next page-numbers"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        >
                          Next »
                        </button>
                      </div>
                    </nav>
                  </div>

                  {/* ===== Product Grid ===== */}
                  <div className="inner-wrapper">
                    <div className="products-inner-wrapper clear-fix">
                      {loading ? (
                        [...Array(perPage)].map((_, idx) => (
                          <div key={idx} className="product-item col-grid-3 top-space">
                            <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                              <div className="product-thumb zoom-effect skeleton"></div>
                              <div className="product-item-details skeleton"></div>
                            </div>
                          </div>
                        ))
                      ) : products.length > 0 ? (
                        products.map((product) => (
                          <div key={product.id} className="product-item col-grid-3 top-space">
                            <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                              <div className="product-thumb zoom-effect">
                                <a
                                  className="thumbnail"
                                  href={product.permalink}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    goToProduct(product.permalink);
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
                        ))
                      ) : (
                        <p>No products found.</p>
                      )}
                    </div>
                  </div>

                  {/* ===== Pagination ===== */}
                  <div className="pruduct-filter-row clear-fix top-space">
                    <div className="filter-row-box pull-left">
                      <span>
                        Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, totalPages * perPage)}
                      </span>
                    </div>
                    <nav className="filter-row-box navigation pagination pull-right">
                      <div className="nav-links">
                        {/* Prev */}
                        <button
                          className="prev page-numbers"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                          « Prev
                        </button>

                        {/* Page numbers */}
                        {getPagination(currentPage, totalPages).map((page, idx) =>
                          page === "..." ? (
                            <span key={idx} className="dots">…</span>
                          ) : (
                            <button
                              key={idx}
                              className={`page-numbers ${page === currentPage ? "current" : ""}`}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          )
                        )}

                        {/* Next */}
                        <button
                          className="next page-numbers"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        >
                          Next »
                        </button>
                      </div>
                    </nav>
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

export default ShopPage;