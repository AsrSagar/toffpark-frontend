import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import config from "../../config";
import "./ShopPage.css";
import SalesPopup from "../../components/SalesPopup/SalesPopup";
import QuickViewModal from "../../components/QuickViewModal/QuickViewModal";
import { getProductById } from "../../api/products";

const ShopPage = () => {
  const API_URL = config.API_URL;
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickLoading, setQuickLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("popularity");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const perPage = 20;
  const navigate = useNavigate();
  const categoryPath = location.pathname.replace("/product-category/", "").replace(/\/$/, "");
  const slug = categoryPath.split("/").pop();

    useEffect(() => {
      setCurrentPage(1);
      setSearchInput(""); 
      setSearchQuery("");
    }, [slug]);

  const buildCategoryTree = (categories) => {
    const map = {};
    const tree = [];
    categories.forEach(cat => {
      map[cat.id] = { ...cat, children: [] };
    });
    categories.forEach(cat => {
      if (cat.parent !== 0 && map[cat.parent]) {
        map[cat.parent].children.push(map[cat.id]);
      } else if (cat.parent === 0) {
        tree.push(map[cat.id]);
      }
    });
    return tree;
  };

  useEffect(() => {
    fetch(`${API_URL}/wc/store/v1/products/categories?per_page=100`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const tree = buildCategoryTree(data);
          setAllCategories(tree);
        }
      })
      .catch(err => console.error("Categories Fetch Error:", err));
  }, [API_URL]);

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

  const renderCategoryList = (categories) => {
    return (
      <ul className="category-tree">
        {categories.map((cat) => {
          const isActive = slug === cat.slug;
          const hasChildren = cat.children && cat.children.length > 0;

          return (
            <li key={cat.id} className={hasChildren ? "has-children" : ""}>
              <div className={`category-item ${isActive ? "active" : ""}`}>
                <Link to={`/product-category/${cat.slug}`} className="cat-link">
                  <span className="cat-name">{cat.name}</span>
                </Link>
                <span className="cat-count">{cat.count}</span>
                {hasChildren && <i className="fas fa-chevron-right arrow-icon"></i>}
              </div>
              {hasChildren && renderCategoryList(cat.children)}
            </li>
          );
        })}
      </ul>
    );
  };

  const findCurrentCategoryDetails = (categories, currentSlug) => {
    for (let cat of categories) {
      if (cat.slug === currentSlug) return { parent: cat, children: cat.children };
      if (cat.children) {
        const childMatch = cat.children.find(c => c.slug === currentSlug);
        if (childMatch) return { parent: cat, children: cat.children };
      }
    }
    return { parent: null, children: [] };
  };

  const { parent: currentParent, children: subCategories } = findCurrentCategoryDetails(allCategories, slug);

  // if (loading) {
  //   return (
  //     <div className="full-page-loader">
  //       <div className="spinner"></div>
  //       <p>Loading...</p>
  //     </div>
  //   );
  // }

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
      <div id="content" className="site-content category-page-content">
        <div className="container">
          <div className="inner-wrapper product-category-layout">
            <aside id="secondary" className="widget-area category-sidebar">
              <section className="widget widget-special-links">
                <h2 className="widget-title">Special Offers</h2>
                <ul>
                  <li><Link to="/product-category/up-to-60-off/">Up To 60% Off</Link></li>
                  <li><Link to="/product-category/new-arrivals/">New Arrival</Link></li>
                  <li><Link to="/product-category/top-selling-items/">Top Selling</Link></li>
                </ul>
              </section>
              <section className="widget widget-categories-list">
                <div className="widget-header">
                  <h2 className="widget-title">Categories</h2>
                  <button className="clear-filter" onClick={() => navigate('/shop')}>
                    CLEAR ALL
                  </button>
                </div>
                <div className="all-categories-wrapper">
                  {allCategories.length > 0 ? (
                    renderCategoryList(allCategories)
                  ) : (
                    <div className="loading-cats">Loading...</div>
                  )}
                </div>
              </section>
            </aside>
            <div id="primary" className="content-area category-content-area">
              <main id="main" className="site-main">
                <div className="category-search-container">
                  <div className="search-box">
                    {/* <i className="fas fa-search"></i>
                    <input 
                      type="text" 
                      placeholder={`Search in ${slug.replace(/-/g, " ")}...`} 
                      value={searchInput}
                      onChange={handleSearchChange}
                    /> */}
                  </div>
                </div>

                <div className="section-products">
                  <div className="pruduct-filter-row clear-fix">
                    <div className="top-category-list">
                      <div className="category-filter-container">
                        <div className="parent-category-tabs">
                          {allCategories.map(cat => (
                            <button 
                              key={cat.id} 
                              className={`tab-btn ${currentParent?.slug === cat.slug ? 'active' : ''}`}
                              onClick={() => navigate(`/product-category/${cat.slug}`)}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>

                        <div className="divider"></div>

                        {subCategories.length > 0 && (
                          <div className="sub-category-pills">
                            {subCategories.map(sub => (
                              <span 
                                key={sub.id} 
                                className={`pill ${slug === sub.slug ? 'active' : ''}`}
                                onClick={() => navigate(`/product-category/${sub.slug}`)}
                                style={{cursor: 'pointer'}}
                              >
                                {sub.name} <small>{sub.count}</small>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="active-filter-row">
                          <div className="filter-tag">
                            {slug.replace(/-/g, " ")} <i className="fas fa-times" onClick={() => navigate('/shop')}></i>
                          </div>
                          <button className="clear-btn" onClick={() => navigate('/shop')}>Clear</button>
                        </div>
                      </div>
                    </div>
                    <div className="sort-by-container">
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
                          {currentPage > 1 && <span className="page-numbers" onClick={() => setCurrentPage(currentPage - 1)}>« Prev</span>}
                          <span className="page-numbers current">{currentPage}</span>
                          {currentPage < totalPages && <span className="page-numbers" onClick={() => setCurrentPage(currentPage + 1)}>Next »</span>}
                        </div>
                      </nav>
                    </div>
                  </div>
                  <div className="products-inner-wrapper clear-fix">
                    {loading ? (
                      <div className="grid-message"><p><i className="fas fa-spinner fa-spin"></i> Loading...</p></div>
                    ) : products.length === 0 ? (
                      <div className="grid-message">
                        {/* <p>No products found in <strong>{slug}</strong> {searchQuery && `for "${searchQuery}"`}.</p> */}
                      </div>
                    ) : (
                      <div className="products-grid-container category-products-wrapper">
                        {products.map((product) => {
                          const regularPrice = parseFloat(product.prices.regular_price || 0);
                          const salePrice = parseFloat(product.prices.sale_price || 0);
                          const isSale = product.on_sale && salePrice > 0 && regularPrice > salePrice;
                          const savePercent = isSale ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;
                          const isOutOfStock = product.stock_status === "outofstock";
                          return(
                            <div class="custom-product-card">
                              <div class="product-card-inner" onClick={() => navigate(`/product/${product.slug}`)}>
                                <div class="product-image-box">
                                  {isSale && savePercent > 0 && (
                                    <div className="badge-wrap">
                                      <span className="ribbon-offered">{savePercent}% Off</span>
                                      <span className="ribbon-save">Offered items</span>
                                    </div>
                                  )}
                                  <img alt={product.name} src={product.images[0]?.src || ""} />
                                  {isOutOfStock && <span className="ribbon-out-stock">Out of Stock</span>}
                                </div>
                                <div class="product-item-details">
                                  <h3 className="product-title product-title-desktop">
                                    {product.name.length > 42 ? product.name.substring(0, 38) + "..." : product.name}
                                  </h3>
                                  <h3 className="product-title product-title-mobile">
                                    {product.name.length > 35 ? product.name.substring(0, 35) + "..." : product.name}
                                  </h3>
                                  <div className="product-price">
                                    {isSale ? (
                                      <>
                                        <span className="price-new">৳{(salePrice / 100).toFixed(0)}</span>
                                        <del className="price-old">৳{(regularPrice / 100).toFixed(0)}</del>
                                        <div className="save-tag">Save ৳{((regularPrice - salePrice) / 100).toFixed(0)}</div>
                                      </>
                                    ) : (
                                      <span className="price-new">৳{(regularPrice / 100).toFixed(0)}</span>
                                    )}
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
                          )
                        })}
                      </div>
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