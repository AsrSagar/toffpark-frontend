import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import config from "../../config";
import "./ShopPage.css";
import SalesPopup from "../../components/SalesPopup/SalesPopup";
import QuickViewModal from "../../components/QuickViewModal/QuickViewModal";
import { getProductById } from "../../api/products";

const ShopPage = () => {
  const API_URL = config.API_URL;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickLoading, setQuickLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("popularity");
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
        case "rating": return "orderby=rating";
        case "date": return "orderby=date";
        case "price_asc": return "orderby=price&order=asc";
        case "price_desc": return "orderby=price&order=desc";
        default: return "orderby=popularity";
      }
    };

    fetch(`${API_URL}/wc/store/v1/products?page=${currentPage}&per_page=${perPage}&${getSortParams()}`)
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

    return pages.map((page, idx) => (
      <span
        key={idx}
        className={`page-numbers ${page === "..." ? "dots" : ""} ${currentPage === page ? "current" : ""}`}
        style={{ cursor: page === "..." ? "default" : "pointer" }}
        onClick={() => page !== "..." && setCurrentPage(page)}
      >
        {page}
      </span>
    ));
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
              <div aria-label="Breadcrumbs" className="breadcrumbs breadcrumb-trail">
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
                  {/* Sorting & Pagination Row */}
                  <div className="pruduct-filter-row clear-fix">
                    <div className="filter-row-box product-listing-filter">
                      <div className="sort-by">
                        <span className="sort-by-list">Sort by</span>
                        <ul>
                          <li><a href="/" onClick={(e)=>{e.preventDefault(); setSortBy("popularity");}}>Sort by popularity</a></li>
                          <li><a href="/" onClick={(e)=>{e.preventDefault(); setSortBy("rating");}}>Sort by average rating</a></li>
                          <li><a href="/" onClick={(e)=>{e.preventDefault(); setSortBy("date");}}>Sort by newness</a></li>
                          <li><a href="/" onClick={(e)=>{e.preventDefault(); setSortBy("price_asc");}}>Sort by price: low to high</a></li>
                          <li><a href="/" onClick={(e)=>{e.preventDefault(); setSortBy("price_desc");}}>Sort by price: high to low</a></li>
                        </ul>
                      </div>
                    </div>
                    <nav className="filter-row-box navigation pagination pull-right">
                      <div className="nav-links">
                        {renderPagination()}
                        {currentPage < totalPages && (
                          <span className="next page-numbers" style={{ cursor: "pointer" }} onClick={() => setCurrentPage(currentPage + 1)}>
                            Next »
                          </span>
                        )}
                      </div>
                    </nav>
                  </div>

                  {/* Product Grid */}
                  <div className="products-inner-wrapper clear-fix">
                    {products.length > 0 ? (
                      products.map((product) => {
                        const isOutOfStock = !product.is_in_stock || !product.is_purchasable;
                        const regularPrice = parseInt(product.prices.regular_price);
                        const salePrice = parseInt(product.prices.sale_price);
                        const isSale = salePrice < regularPrice;
                        const savePercent = isSale ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;

                        return (
                          <div key={product.id} className="product-item col-grid-3 top-space">
                            <div 
                              className="product-item-wrapper zoom-effect-hover-container"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleCardClick(product.permalink)}
                            >
                              <div className="product-thumb zoom-effect">
                                {isSale && (
                                  <>
                                    <span className="ribbon-offered">{savePercent}% Off</span>
                                    <span className="ribbon-save">Offered items</span>
                                  </>
                                )}
                                
                                <Link
                                  className="thumbnail"
                                  to={`/product/${getSlugFromPermalink(product.permalink)}`}
                                  onClick={(e) => { e.preventDefault(); goToProduct(product.permalink); }}
                                >
                                  <img alt={product.name} src={product.images[0]?.src} />
                                </Link>

                                {isOutOfStock && (
                                  <span className="ribbon-rotated onsale">Out of Stock</span>
                                )}
                              </div>

                              <div className="product-item-details">
                                <h3 className="product-title">
                                  <Link to={`/product/${getSlugFromPermalink(product.permalink)}`}>
                                    {product.name.length > 45 ? product.name.substring(0, 45) + "..." : product.name}
                                  </Link>
                                </h3>
                                <div className="product-price-container">
                                  {isSale && <span className="sale-price">৳{(salePrice / 100).toFixed(0)}</span>}
                                  {isSale && <del className="regular-price">৳{(regularPrice / 100).toFixed(0)}</del>}
                                  {isSale && <span className="save-amount"> Save ৳{((regularPrice - salePrice) / 100).toFixed(0)}</span>}
                                  {!isSale && <span className="regular-price sale-price">৳{(regularPrice / 100).toFixed(0)}</span>}
                                </div>
                                <div className="button-group">
                                  <button 
                                    className="btn-cart" 
                                    disabled={quickLoading === product.id}
                                    onClick={(e) => {
                                      e.stopPropagation(); // 2. Eta card-er click event-ke thamay dibe
                                      handleQuickView(product.id);
                                    }}
                                    >
                                      {quickLoading === product.id ? (
                                        <i className="fas fa-spinner fa-spin"></i> 
                                      ) : (
                                        <i className="fas fa-shopping-cart"></i> 
                                      )}
                                      CART
                                  </button>
                                  <button 
                                    className="btn-buy-now" onClick={(e) => { e.stopPropagation(); 
                                    goToProduct(product.permalink); }}>
                                      Buy Now
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p>No products found.</p>
                    )}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
      <SalesPopup />
    </>
  );
};

export default ShopPage;