import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import config from "../../config";
import QuickViewModal from "../../components/QuickViewModal/QuickViewModal";
import { getProductById } from "../../api/products";
import "./ShopPage.css";
import SalesPopup from "../../components/SalesPopup/SalesPopup";

const ShopPage = () => {
  const API_URL = config.API_URL;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("popularity");
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickLoading, setQuickLoading] = useState(false);

  const perPage = 20;

  const navigate = useNavigate();

  const handleQuickView = async (id) => {
    setQuickLoading(id); 
    
    try {
      const [product] = await Promise.all([
        getProductById(id),
        new Promise((resolve) => setTimeout(resolve, 1000)) // Artificial delay
      ]);

      setSelectedProduct(product);
      setIsQuickViewOpen(true); // Ekhon modal open hobe
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setQuickLoading(null); 
    }
  };

  const getSlugFromPermalink = (permalink) => {
    if (!permalink) return "";
    return permalink.split("/").filter(Boolean).pop();
  };

  const goToProduct = (permalink) => {
    const slug = getSlugFromPermalink(permalink);
    if (!slug) return;
    navigate(`/product/${slug}`);
  };

  const handleCardClick = (permalink) => {
    const slug = getSlugFromPermalink(permalink);
    if (slug) navigate(`/product/${slug}`);
  };

  // Fetch Products
  useEffect(() => {
    setLoading(true);

    const getSortParams = () => {
      switch (sortBy) {
        case "rating":
          return "orderby=rating";
        case "date":
          return "orderby=date";
        case "price_asc":
          return "orderby=price&order=asc";
        case "price_desc":
          return "orderby=price&order=desc";
        default:
          return "orderby=popularity";
      }
    };

    const sortParams = getSortParams();

    fetch(
      `${API_URL}/wc/store/v1/products?page=${currentPage}&per_page=${perPage}&${sortParams}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        const total = res.headers.get("X-WP-TotalPages");
        if (total) setTotalPages(parseInt(total));
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Product fetch error:", err);
        setLoading(false);
      });
  }, [API_URL, currentPage, sortBy]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const renderPagination = () => {
    const pages = [];

    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (currentPage > 4) pages.push("...");
      pages.push(totalPages);
    }

    return pages.map((page, idx) => {
      if (page === "...") {
        return (
          <span key={idx} className="page-numbers dots">
            ...
          </span>
        );
      }
      return (
        <span
          key={idx}
          className={`page-numbers ${currentPage === page ? "current" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="full-page-loader">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div id="custom-header">
        <div className="custom-header-content">
          <div className="container">
            <div id="breadcrumb">
              <div  aria-label="Breadcrumbs" className="breadcrumbs breadcrumb-trail">
                <ul className="trail-items">
                  <li className="trail-item trail-begin"><a href="/" rel="home"><span>Home</span></a></li>
                  <li className="trail-item trail-end"><span>Shop</span></li>
                </ul>
              </div> 
            </div> 
          </div>
        </div>
      </div>
      <div id="content" className="site-content default-full-width">
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
                          <li><a href="/" onClick={(e)=>{e.preventDefault();setSortBy("popularity");}}>Sort by popularity</a></li>
                          <li><a href="/" onClick={(e)=>{e.preventDefault();setSortBy("rating");}}>Sort by average rating</a></li>
                          <li><a href="/" onClick={(e)=>{e.preventDefault();setSortBy("date");}}>Sort by newness</a></li>
                          <li><a href="/" onClick={(e)=>{e.preventDefault();setSortBy("price_asc");}}>Sort by price: low to high</a></li>
                          <li><a href="/" onClick={(e)=>{e.preventDefault();setSortBy("price_desc");}}>Sort by price: high to low</a></li>
                        </ul>
                      </div>
                    </div>
                    <nav className="filter-row-box navigation pagination pull-right">
                      <div className="nav-links">
                        {renderPagination()}
                        {currentPage < totalPages && (
                          <span
                            className="next page-numbers"
                            style={{ cursor: "pointer" }}
                            onClick={() => setCurrentPage(currentPage + 1)}
                          >
                            Next »
                          </span>
                        )}
                      </div>
                    </nav>
                  </div>
                  <div className="products-inner-wrapper clear-fix">
                    {loading
                      ? [...Array(perPage)].map((_, idx) => (
                          <div key={idx} className="product-item col-grid-3 top-space">
                            <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                              <div className="product-thumb zoom-effect skeleton"></div>
                              <div className="product-item-details skeleton"></div>
                            </div>
                          </div>
                        ))
                      : products.length > 0
                      ? products.map((product) => {

                          const isOutOfStock = !product.is_in_stock || !product.is_purchasable;

                          return (
                            <div key={product.id} className="product-item col-grid-3 top-space">
                              <div 
                                className="product-item-wrapper zoom-effect-hover-container box-shadow-block"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleCardClick(product.permalink)}
                              >
                                <div className="product-thumb zoom-effect">
                                  <Link
                                    className="thumbnail"
                                    to={`/product/${getSlugFromPermalink(product.permalink)}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      goToProduct(product.permalink);
                                    }}
                                  >
                                    <img
                                      alt={product.name}
                                      src={product.images[0]?.src}
                                    />
                                  </Link>

                                  <div className="pruduct-buttons">
                                    <div className="pruduct-buttons">
                                      <button 
                                        className="product-button tooltip"
                                        disabled={quickLoading === product.id}
                                        onClick={(e) => {
                                          e.stopPropagation(); // 2. Eta card-er click event-ke thamay dibe
                                          handleQuickView(product.id);
                                        }}
                                      >
                                        {quickLoading === product.id ? (
                                          <i className="fas fa-spinner fa-spin"></i> 
                                        ) : (
                                          <i className="far fa-eye"></i> 
                                        )}
                                        <span className="tooltiptext tooltip-right">
                                          {quickLoading === product.id ? "LOADING..." : "QUICK VIEW"}
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="quick-view">
                                    <button
                                      className="custom-button button-small quick-view-link"
                                      onClick={(e) => {
                                        e.stopPropagation(); // 4. Etao card-er click event-ke thamay dibe
                                        goToProduct(product.permalink);
                                      }}
                                    >
                                      VIEW PRODUCT
                                    </button>
                                  </div>

                                  {isOutOfStock && (
                                    <span className="ribbon-rotated onsale">
                                      Out of Stock
                                    </span>
                                  )}
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
                          );
                        })
                      : <p>No products found.</p>
                    }
                  </div>

                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
      <SalesPopup />
      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </>
  );
};

export default ShopPage;