import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import config from "../../config";
import "./ShopPage.css";
import SalesPopup from "../../components/SalesPopup/SalesPopup";
import QuickViewModal from "../../components/QuickViewModal/QuickViewModal";
import { getProductById } from "../../api/products";
import axios from "axios";

const ShopPage = () => {
  const API_URL = config.API_URL;
  const location = useLocation();
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
  const [sortBy, setSortBy] = useState("popularity");
  const perPage = 20;
  const navigate = useNavigate();
  const categoryPath = location.pathname.replace("/product-category/", "").replace(/\/$/, "");
  const slug = categoryPath.split("/").pop() || "";

  useEffect(() => {
    setCurrentPage(1);
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

  // 1. Fetch All Categories Tree
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

  // 2. Fetch Special Categories
  useEffect(() => {
    const fetchSpecialCategories = async () => {
      setCatsLoading(true);
      try {
        const targetSlugs = ["sale","mega-deal","top-selling", "new-arrivals"];
        const requests = targetSlugs.map(slug => 
          axios.get(`${API_URL}/wc/v3/products/categories`, {
            params: { slug, per_page: 1 },
            auth: {
              username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
              password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
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

  const handleQuickView = async (id) => {
    setQuickLoading(id); 
    try {
      const [product] = await Promise.all([
        getProductById(id),
        new Promise((resolve) => setTimeout(resolve, 1000)) 
      ]);

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

  const getSlugFromPermalink = (permalink) => {
    if (!permalink) return "";
    return permalink.split("/").filter(Boolean).pop();
  };

  const goToProduct = (permalink) => {
    const slugName = getSlugFromPermalink(permalink);
    if (!slugName) return;
    navigate(`/product/${slugName}`);
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
    if (!currentSlug) return { parent: null, children: [] };
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

  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  // 🎯 SKELETON COMPONENTS
  const ExclusiveOffersSkeleton = () => (
    <>
      {[1, 2, 3, 4].map((n) => (
        <li key={`offer-sk-${n}`}>
          <div className="skeleton skeleton-text" style={{ width: "80%", height: "18px", margin: "8px 0" }}></div>
        </li>
      ))}
    </>
  );

  const CategoriesSkeleton = () => (
    <div className="skeleton-categories-tree" style={{ padding: "10px 0" }}>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={`cat-sk-${n}`} style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "15px" }}>
          <div className="skeleton skeleton-text" style={{ width: "65%", height: "16px" }}></div>
          <div className="skeleton skeleton-text" style={{ width: "15%", height: "16px" }}></div>
        </div>
      ))}
    </div>
  );

  // 🎯 এই স্কেলিটনটি প্রোডাক্ট গ্রিডের আসল স্ট্রাকচার বজায় রাখবে
  const ProductGridSkeleton = () => (
    <div className="products-grid-container category-products-wrapper">
      {[...Array(8)].map((_, idx) => (
        <div key={`prod-sk-${idx}`} className="custom-product-card skeleton-card">
          <div className="product-card-inner">
            <div className="product-image-box skeleton" style={{ height: "220px", width: "100%", borderRadius: "8px 8px 0 0" }}></div>
            <div className="product-item-details" style={{ padding: "15px" }}>
              {/* টাইটেল প্লেসহোল্ডার */}
              <div className="skeleton skeleton-text" style={{ width: "90%", height: "16px", marginBottom: "8px" }}></div>
              <div className="skeleton skeleton-text" style={{ width: "60%", height: "14px", marginBottom: "12px" }}></div>
              {/* প্রাইস প্লেসহোল্ডার */}
              <div className="skeleton skeleton-text" style={{ width: "45%", height: "20px", marginBottom: "15px" }}></div>
              {/* বাটন গ্রুপ প্লেসহোল্ডার */}
              <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                <div className="skeleton" style={{ flex: 1, height: "38px", borderRadius: "4px" }}></div>
                <div className="skeleton" style={{ flex: 1, height: "38px", borderRadius: "4px" }}></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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
                <h2 className="widget-title">Exclusive Offers</h2>
                <ul>
                  {catsLoading ? (
                    <ExclusiveOffersSkeleton />
                  ) : SpecialCategories.length > 0 ? (
                    SpecialCategories.map((cat) => (
                      <li key={cat.id}>
                        <Link to={`/product-category/${cat.slug}/`} className={slug === cat.slug ? "active-offer" : ""}>
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
                  {allCategories.length > 0 ? (
                    renderCategoryList(allCategories)
                  ) : (
                    <CategoriesSkeleton />
                  )}
                </div>
              </section>
            </aside>
            <div id="primary" className="content-area category-content-area">
              <main id="main" className="site-main">
                <div className="category-search-container">
                  <div className="search-box"></div>
                </div>

                <div className="section-products">
                  <div className="pruduct-filter-row clear-fix">
                    <div className="top-category-list">
                      <div className="category-filter-container">
                        <div className="parent-category-tabs special-tabs">
                          {catsLoading ? (
                            <span className="skeleton skeleton-text" style={{ width: "200px", height: "25px", display: "inline-block" }}></span>
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
                          {allCategories.length > 0 ? (
                            allCategories.map(cat => (
                              <button 
                                key={cat.id} 
                                className={`tab-btn ${currentParent?.slug === cat.slug ? 'active' : ''}`}
                                onClick={() => navigate(`/product-category/${cat.slug}`)}
                              >
                                {cat.name}
                              </button>
                            ))
                          ) : (
                            <span className="skeleton skeleton-text" style={{ width: "350px", height: "25px", display: "inline-block" }}></span>
                          )}
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

                        {slug && (
                          <div className="active-filter-row">
                            <div className="filter-tag">
                              {slug.replace(/-/g, " ")} <i className="fas fa-times" onClick={() => navigate('/shop')}></i>
                            </div>
                            <button className="clear-btn" onClick={() => navigate('/shop')}>Clear</button>
                          </div>
                        )}
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
                      <div className="filter-row-box navigation pagination pull-right">
                        <div className="nav-links">
                          {currentPage > 1 && <span className="page-numbers" onClick={() => setCurrentPage(currentPage - 1)}>« Prev</span>}
                          <span className="page-numbers current">{currentPage}</span>
                          {currentPage < totalPages && <span className="page-numbers" onClick={() => setCurrentPage(currentPage + 1)}>Next »</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="products-inner-wrapper clear-fix">
                    {/* 🎯 কন্ডিশনাল রেন্ডারিং: ডাটা লোড হওয়ার সময় স্কেলিটন গ্রিড দেখাবে */}
                    {loading ? (
                      <ProductGridSkeleton />
                    ) : products.length === 0 ? (
                      <div className="grid-message"><p>No products found.</p></div>
                    ) : (
                      <div className="products-grid-container category-products-wrapper">
                        {products.map((product) => {
                          const regularPrice = parseFloat(product.prices?.regular_price || 0);
                          const salePrice = parseFloat(product.prices?.sale_price || 0);
                          const isSale = product.on_sale && salePrice > 0 && regularPrice > salePrice;
                          const savePercent = isSale ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;
                          const isOutOfStock = product.stock_status === "outofstock";

                          const productCategories = product.categories?.map(c => c.slug) || [];
                          
                          let ribbonText = ""; 
                          if (productCategories.includes("best-selling")) {
                            ribbonText = "Best Selling";
                          } else if (productCategories.includes("free-delivery")) {
                            ribbonText = "Free Delivery";
                          } else if (productCategories.includes("new-arrival")) {
                            ribbonText = "New Arrival";
                          }

                          return(
                            <div key={product.id} className="custom-product-card">
                              <Link 
                                className="product-card-inner" 
                                to={`/product/${product.slug}`}
                              >
                                <div className="product-image-box">
                                  {((isSale && savePercent > 0) || ribbonText) && (
                                    <div className="badge-wrap">
                                      {isSale && savePercent > 0 && (
                                        <span className="ribbon-offered">{savePercent}% Off</span>
                                      )}
                                      {ribbonText && (
                                        <span className="ribbon-save">{ribbonText}</span>
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