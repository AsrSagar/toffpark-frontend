import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import config from "../../config";
import './ProductCategoryPage.css';
import QuickViewModal from "../../components/QuickViewModal/QuickViewModal";
import { getProductById } from "../../api/products";
import SalesPopup from "../../components/SalesPopup/SalesPopup";
import debounce from "lodash.debounce";
import axios from "axios";

const CategoryProducts = () => {
  const API_URL = config.API_URL;
  const location = useLocation();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [SpecialCategories, setSpecialCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(true); 
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickLoading, setQuickLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const PER_PAGE = 32;

  // ক্যাটাগরি স্ল্যাগ বের করা
  const categoryPath = location.pathname.replace("/product-category/", "").replace(/\/$/, "");
  const slug = categoryPath.split("/").pop();

  // নতুন পেজে বা অন্য কোনো ক্যাটাগরিতে ক্লিক করলে স্ক্রিন একদম টপ থেকে লোড হবে
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, currentPage]);

  // যখনই ক্যাটাগরি (slug) চেঞ্জ হবে, পেজ নাম্বার ১-এ রিসেট হবে
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

  // 1. Fetch All Categories Tree (Filtering out exclusive/special categories)
  useEffect(() => {
    fetch(`${API_URL}/wc/store/v1/products/categories?per_page=32`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const excludedSlugs = ["sale", "mega-deal", "new-arrival", "top-selling", "best-selling", "free-delivery", "new-arrivals"];
          const filteredData = data.filter(cat => !excludedSlugs.includes(cat.slug));
          const tree = buildCategoryTree(filteredData);
          setAllCategories(tree);
        }
      })
      .catch(err => console.error("Categories Fetch Error:", err));
  }, [API_URL]);

  // 2. Fetch Special Categories (Using config keys for safety)
  useEffect(() => {
    const fetchSpecialCategories = async () => {
      setCatsLoading(true);
      try {
        const targetSlugs = ["sale", "mega-deal", "top-selling", "new-arrivals"];
        
        const requests = targetSlugs.map(slug => 
          axios.get(`${API_URL}/wc/v3/products/categories`, {
            params: { slug, per_page: 1 },
            auth: {
              username: config.WC_CONSUMER_KEY || "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
              password: config.WC_CONSUMER_SECRET || "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
            },
          })
        );

        const responses = await Promise.all(requests);
        const fetchedCategories = responses
          .map(res => res.data[0]) 
          .filter(Boolean); 

        const slugOrder = ["sale", "mega-deal", "top-selling", "new-arrivals"];
        const sortedCategories = fetchedCategories.sort(
          (a, b) => slugOrder.indexOf(a.slug) - slugOrder.indexOf(b.slug)
        );

        setSpecialCategories(sortedCategories);
      } catch (error) {
        console.error("Error fetching special categories:", error);
      } finally {
        setCatsLoading(false);
      }
    };

    fetchSpecialCategories();
  }, [API_URL]);

  // ডাইনামিক ক্যাটাগরি এবং সাব-ক্যাটাগরি খোঁজার লজিক (useMemo দিয়ে অপ্টিমাইজড)
  const { currentParent, subCategories } = useMemo(() => {
    const findDetails = (categories, currentSlug) => {
      for (let cat of categories) {
        if (cat.slug === currentSlug) return { currentParent: cat, subCategories: cat.children || [] };
        if (cat.children && cat.children.length > 0) {
          const childMatch = cat.children.find(c => c.slug === currentSlug);
          if (childMatch) return { currentParent: cat, subCategories: cat.children };
        }
      }
      return { currentParent: null, subCategories: [] };
    };
    return findDetails(allCategories, slug);
  }, [allCategories, slug]);

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

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "view_content",
        ecommerce: {
          currency: "BDT",
          items: [{
            item_id: product.id?.toString(),
            item_name: product.name,
            price: parseFloat(product.price || 0)
          }]
        }
      });

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
      default: setSortBy("title"); setSortOrder("asc");
    }
  };

  // 3. Fetch Products Based on Current Category Slug / Special Slug
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

  // ডাইনামিক রিবন টেক্সট লজিক ফিক্স
  const getRibbonText = (productCategories, currentSlug) => {
    if (!Array.isArray(productCategories) || productCategories.length === 0) {
      return null;
    }

    const productSlugs = productCategories.map(c => c.slug);

    if (productSlugs.includes("best-selling") && currentSlug !== "best-selling") {
      return "Best Selling";
    }
    if (productSlugs.includes("free-delivery") && currentSlug !== "free-delivery") {
      return "Free Delivery";
    }
    if (productSlugs.includes("new-arrival") && currentSlug !== "new-arrival") {
      return "New Arrival";
    }
    return null;
  };

  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  // কাস্টম কঙ্কাল বা স্কেলিটন লোডার কম্পোনেন্ট (৮টি প্রোডাক্টের ডামি কার্ড গ্রিড)
  const renderProductSkeletons = () => {
    const skeletonCount = 8; // লোডিং অবস্থায় ৮টি কার্ড দেখাবে
    return (
      <div className="products-grid-container category-products-wrapper">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={`skeleton-${index}`} className="custom-product-card skeleton-card">
            <div className="product-card-inner">
              <div className="product-image-box skeleton-shimmer"></div>
              <div className="product-item-details">
                <div className="skeleton-line skeleton-title skeleton-shimmer"></div>
                <div className="skeleton-line skeleton-title-short skeleton-shimmer"></div>
                <div className="skeleton-line skeleton-price skeleton-shimmer"></div>
                <div className="skeleton-button-group">
                  <div className="skeleton-btn skeleton-shimmer"></div>
                  <div className="skeleton-btn skeleton-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
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
                  {categoryPath.split("/").filter(Boolean).map((item, index, array) => {
                    const isLast = index === array.length - 1;
                    return (
                      <li key={index} className={`trail-item ${isLast ? 'trail-end' : ''}`}>
                        {isLast ? (
                          <span className="last-menu-text">
                            {item.replace(/-/g, " ")}
                          </span>
                        ) : (
                          <Link to={`/product-category/${array.slice(0, index + 1).join("/")}`}>
                            <span className="mid-menu-text">
                              {item.replace(/-/g, " ")}
                            </span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
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
                <h2 className="widget-title">Exclusive Offers</h2>
                <ul className="special-categories-list">
                  {catsLoading ? (
                    <li key="loading-offers">Loading offers...</li>
                  ) : SpecialCategories.length > 0 ? (
                    SpecialCategories.map((cat) => (
                      <li key={cat.id}>
                        <Link to={`/product-category/${cat.slug}/`} className={slug === cat.slug ? "active" : ""}>
                          {cat.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <>
                      <li key="def-sale"><Link to="/product-category/sale/">60% Off</Link></li>
                      <li key="def-mega"><Link to="/product-category/mega-deal/">Mega Deal</Link></li>
                      <li key="def-new"><Link to="/product-category/new-arrivals/">New Arrivals</Link></li>
                      <li key="def-top"><Link to="/product-category/top-selling/">Top Selling</Link></li>
                    </>
                  )}
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
                      placeholder={`Search in ${slug ? slug.replace(/-/g, " ") : "category"}...`} 
                      value={searchInput}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                <div className="section-products">
                  <div className="pruduct-filter-row clear-fix">
                    <div className="top-category-list">
                      <div className="category-filter-container">
                        <div className="parent-category-tabs special-tabs">
                          {catsLoading ? (
                            <span key="loading-tabs">Loading offers...</span>
                          ) : SpecialCategories.length > 0 ? (
                            SpecialCategories.map((cat) => (
                              <button key={cat.id} className={`tab-btn ${slug === cat.slug ? "active" : ""}`} onClick={() => navigate(`/product-category/${cat.slug}/`)}>
                                {cat.name}
                              </button>
                            ))
                          ) : (
                            <>
                              <button key="tab-sale" className={`tab-btn ${slug === "sale" ? "active" : ""}`} onClick={() => navigate("/product-category/sale/")}>60% Off</button>
                              <button key="tab-mega" className={`tab-btn ${slug === "mega-deal" ? "active" : ""}`} onClick={() => navigate("/product-category/mega-deal/")}>Mega Deal</button>
                              <button key="tab-new" className={`tab-btn ${slug === "new-arrivals" ? "active" : ""}`} onClick={() => navigate("/product-category/new-arrivals/")}>New Arrivals</button>
                              <button key="tab-top" className={`tab-btn ${slug === "top-selling" ? "active" : ""}`} onClick={() => navigate("/product-category/top-selling/")}>Top Selling</button>
                            </>
                          )}
                        </div>
                        <div className="divider"></div>
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
                        {subCategories && subCategories.length > 0 && (
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
                            {slug ? slug.replace(/-/g, " ") : ""} <i className="fas fa-times" onClick={() => navigate('/shop')}></i>
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
                            <li><button className="sort-btn" onClick={()=>handleSort("default")}>Default (A-Z)</button></li>
                            <li><button className="sort-btn" onClick={()=>handleSort("popularity")}>Popularity</button></li>
                            <li><button className="sort-btn" onClick={()=>handleSort("price_low")}>Price: Low to High</button></li>
                            <li><button className="sort-btn" onClick={()=>handleSort("price_high")}>Price: High to Low</button></li>
                          </ul>
                        </div>
                      </div>
                      <div className="filter-row-box navigation pagination pull-right">
                        <div className="nav-links">
                          {currentPage > 1 && <span className="page-numbers" style={{cursor: 'pointer'}} onClick={() => setCurrentPage(currentPage - 1)}>« Prev</span>}
                          <span className="page-numbers current">{currentPage}</span>
                          {currentPage < totalPages && <span className="page-numbers" style={{cursor: 'pointer'}} onClick={() => setCurrentPage(currentPage + 1)}>Next »</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="products-inner-wrapper clear-fix">
                    {/* লোডিং ট্রু থাকলে কাস্টম স্কেলিটন রেন্ডার হবে */}
                    {loading ? (
                      renderProductSkeletons()
                    ) : products.length === 0 ? (
                      <div className="grid-message">
                        <p>No products found in <strong>{slug}</strong> {searchQuery && `for "${searchQuery}"`}.</p>
                      </div>
                    ) : (
                      <div className="products-grid-container category-products-wrapper">
                        {products.map((product) => {
                          const regularPrice = parseFloat(product.prices?.regular_price || 0);
                          const salePrice = parseFloat(product.prices?.sale_price || 0);
                          const isSale = product.on_sale && salePrice > 0 && regularPrice > salePrice;
                          const savePercent = isSale ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;
                          const isOutOfStock = product.stock_status === "outofstock";
                          
                          const dynamicRibbonText = getRibbonText(product.categories, slug);

                          return(
                            <div key={product.id} className="custom-product-card">
                              <Link 
                              to={`/product/${product.slug}`}
                              className="product-card-inner">
                                <div className="product-image-box">
                                  {isSale && savePercent > 0 && (
                                    <div className="badge-wrap">
                                      <span className="ribbon-offered">{savePercent}% Off</span>
                                      {dynamicRibbonText && (
                                        <span className="ribbon-save">{dynamicRibbonText}</span>
                                      )}
                                    </div>
                                  )}
                                  <img alt={product.name} src={product.images?.[0]?.src || ""} />
                                  {isOutOfStock && <span className="ribbon-out-stock">Out of Stock</span>}
                                </div>
                                <div className="product-item-details">
                                  <h3 className="product-title product-title-desktop">
                                    {decodeHtml(product.name.length > 100 ? product.name.substring(0, 100) + "..." : product.name)}
                                  </h3>
                                  <h3 className="product-title product-title-mobile">
                                    {decodeHtml(product.name.length > 35 ? product.name.substring(0, 35) + "..." : product.name)}
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
                                        e.preventDefault();
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
                                      className="btn-buy-now" 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        goToProduct(product.permalink); 
                                      }}
                                    >
                                      Buy Now
                                    </button>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <div className="filter-row-box navigation pagination pull-left bottom-pagination">
                      <div className="nav-links">
                        {currentPage > 1 && <span className="page-numbers" style={{cursor: 'pointer'}} onClick={() => setCurrentPage(currentPage - 1)}>« Prev</span>}
                        <span className="page-numbers current">{currentPage}</span>
                        {currentPage < totalPages && <span className="page-numbers" style={{cursor: 'pointer'}} onClick={() => setCurrentPage(currentPage + 1)}>Next »</span>}
                      </div>
                    </div>
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