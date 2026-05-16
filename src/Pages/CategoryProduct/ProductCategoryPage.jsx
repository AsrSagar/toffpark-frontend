import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import config from "../../config";
import './ProductCategoryPage.css';
import QuickViewModal from "../../components/QuickViewModal/QuickViewModal";
import { getProductById } from "../../api/products";
import SalesPopup from "../../components/SalesPopup/SalesPopup";
import debounce from "lodash.debounce";

const CategoryProducts = () => {
  const API_URL = config.API_URL;
  const location = useLocation();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickLoading, setQuickLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const PER_PAGE = 32;

  // ক্যাটাগরি স্ল্যাগ বের করা
  const categoryPath = location.pathname.replace("/product-category/", "").replace(/\/$/, "");
  const slug = categoryPath.split("/").pop();

  // ১. সল্যুশন: যখনই ক্যাটাগরি (slug) চেঞ্জ হবে, পেজ নাম্বার ১-এ রিসেট হবে
  useEffect(() => {
    setCurrentPage(1);
    setSearchInput(""); 
    setSearchQuery("");
  }, [slug]);

  const delayedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchQuery(value);
        setCurrentPage(1);
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      delayedSearch.cancel();
    };
  }, [delayedSearch]);

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
    fetch(`${API_URL}/wc/store/v1/products/categories?per_page=32`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const tree = buildCategoryTree(data);
          setAllCategories(tree);
        }
      })
      .catch(err => console.error("Categories Fetch Error:", err));
  }, [API_URL]);

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

  const getSlugFromPermalink = (permalink) => {
    if (!permalink) return "";
    return permalink.split("/").filter(Boolean).pop();
  };

  const goToProduct = (permalink) => {
    const slug = getSlugFromPermalink(permalink);
    if (!slug) return;
    navigate(`/product/${slug}`);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    delayedSearch(value);
  };

  const handleQuickView = async (id) => {
    setQuickLoading(id); 
    try {
      const product = await getProductById(id);
      setSelectedProduct(product);
      setIsQuickViewOpen(true);
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setQuickLoading(null); 
    }
  };

  const handleSort = (type) => {
    setCurrentPage(1);
    switch (type) {
      case "popularity": setSortBy("popularity"); setSortOrder("desc"); break;
      case "price_low": setSortBy("price"); setSortOrder("asc"); break;
      case "price_high": setSortBy("price"); setSortOrder("desc"); break;
      default: setSortBy("date"); setSortOrder("desc");
    }
  };

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const searchParam = searchQuery ? `&search=${searchQuery}` : "";
    const fetchUrl = `${API_URL}/wc/store/v1/products?category=${slug}&page=${currentPage}&per_page=${PER_PAGE}&orderby=${sortBy}&order=${sortOrder}${searchParam}`;

    fetch(fetchUrl)
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
  }, [slug, currentPage, sortBy, sortOrder, searchQuery, API_URL]);

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

  return (
    <>
      <div id="custom-header">
        <div className="custom-header-content">
          <div className="container">
            <div id="breadcrumb">
              <div aria-label="Breadcrumbs" className="breadcrumbs breadcrumb-trail">
                <ul className="trail-items">
                  <li className="trail-item trail-begin">
                    <Link to="/" rel="home"><span>Home</span></Link>
                  </li>
                  {categoryPath.split("/").map((item, index) => (
                    <li key={index} className="trail-item">
                      <span style={{textTransform: 'capitalize'}}>{item.replace(/-/g, " ")}</span>
                    </li>
                  ))}
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
                   {allCategories.length > 0 ? renderCategoryList(allCategories) : <div className="loading-cats">Loading...</div>}
                 </div>
               </section>
            </aside>

            <div id="primary" className="content-area category-content-area">
              <main id="main" className="site-main">
                <div className="category-search-container">
                  <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input 
                      type="text" 
                      placeholder={`Search in ${slug.replace(/-/g, " ")}...`} 
                      value={searchInput}
                      onChange={handleSearchChange}
                    />
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
                            <li><button className="sort-btn" onClick={()=>handleSort("popularity")}>Popularity</button></li>
                            <li><button className="sort-btn" onClick={()=>handleSort("price_low")}>Price: Low to High</button></li>
                            <li><button className="sort-btn" onClick={()=>handleSort("price_high")}>Price: High to Low</button></li>
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
                        <p>No products found in <strong>{slug}</strong> {searchQuery && `for "${searchQuery}"`}.</p>
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
                          <div key={product.id} className="custom-product-card">
                            <div className="product-card-inner" onClick={() => navigate(`/product/${product.slug}`)}>
                              <div className="product-image-box">
                                {isSale && savePercent > 0 && (
                                  <div className="badge-wrap">
                                    <span className="ribbon-offered">{savePercent}% Off</span>
                                    <span className="ribbon-save">Offered items</span>
                                  </div>
                                )}
                                <img alt={product.name} src={product.images[0]?.src || ""} />
                                {isOutOfStock && <span className="ribbon-out-stock">Out of Stock</span>}
                              </div>
                              <div className="product-item-details">
                                <h3 className="product-title product-title-desktop">
                                  {product.name.length > 42 ? product.name.substring(0, 42) + "..." : product.name}
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
                                    e.stopPropagation();
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
                    <nav className="filter-row-box navigation pagination pull-left bottom-pagination">
                      <div className="nav-links">
                        {currentPage > 1 && <span className="page-numbers" onClick={() => setCurrentPage(currentPage - 1)}>« Prev</span>}
                        <span className="page-numbers current">{currentPage}</span>
                        {currentPage < totalPages && <span className="page-numbers" onClick={() => setCurrentPage(currentPage + 1)}>Next »</span>}
                      </div>
                    </nav>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>

      <QuickViewModal isOpen={isQuickViewOpen} onClose={() => { setIsQuickViewOpen(false); setSelectedProduct(null); }} product={selectedProduct} />
      <SalesPopup />
    </>
  );
};

export default CategoryProducts;



