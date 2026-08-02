import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import config from "../../config";
import HeaderMiniCart from "./HeaderMiniCart";
import "./header.css";
import { useCart } from "../../context/CartContext";
import { useThemeOptions } from "../../context/ThemeOptionsContext";

const NavBar = () => {
  const API_URL = config.API_URL;
  const SITE_URL = config.SITE_URL;
  const { cartItems, setCartOpen } = useCart();
  const { options } = useThemeOptions();

  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null); // top-level open
  const [activeSubMenu, setActiveSubMenu] = useState(null); // nested submenu open

  // Desktop check state
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  const toggleMenu = () => setMobileMenu(!mobileMenu);
  const closeMenu = () => setMobileMenu(false);

  const toggleSubMenu = (id, level = "top") => {
    if (level === "top") {
      setActiveMenu(activeMenu === id ? null : id);
    } else {
      setActiveSubMenu(activeSubMenu === id ? null : id);
    }
  };

  // Logo button click scroll to top logic
  const handleLogoClick = () => {
    closeMenu(); // Mobile-er jonno menu open thakle ta auto close hobe
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Instant top-e jete smooth bad diye "auto" likhte paren
    });
  };

  // Resize Listener to update isDesktop state
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    axios
      .get(`${API_URL}/reactpress/v1/menu/main-menu`)
      .then((res) => setMenuItems(res.data))
      .catch((err) => console.error(err));
  }, [API_URL]);

  /* =============================
        SEARCH PRODUCTS
  ============================= */

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      setSearchLoading(true);

      axios
        .get(`${API_URL}/wc/v3/products`, {
          params: {
            search: searchTerm,
            per_page: 5,
          },
        })
        .then((res) => {
          setSearchResults(res.data);
        })
        .catch((err) => console.log(err))
        .finally(() => setSearchLoading(false));
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, API_URL]);

  /* =============================
        OUTSIDE CLICK CLOSE
  ============================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target)
      ) {
        setSearchTerm("");
        setSearchResults([]);
      }

      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target)
      ) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) { // ১০০ পিক্সেল স্ক্রল করার পর স্টিকি হবে
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const mapWpUrlToReact = (url) => {
    return url.replace(SITE_URL, "/");
  };

  const renderSubMenu = (items) => {
    if (!items || items.length === 0) return null;

    return (
      <ul className="sub-menu">
        {items.map((item) => (
          <li
            key={item.id}
            className={`menu-item ${item.classes?.join(" ")} ${
              item.children?.length ? "menu-item-has-children" : ""
            }`}
          >
            <Link to={mapWpUrlToReact(item.url)}>{item.title}</Link>
            {renderSubMenu(item.children)}
          </li>
        ))}
      </ul>
    );
  };

  const renderMegaMenu = (items) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="flat-mega-memu">
        {items.map((item) => (
          <div key={item.id} className="mega-menu-box col-grid-3">
            <div className="menu-container">
              {item.title && (
                <h3 className="megamenu-title">{item.title}</h3>
              )}

              {item.children?.length > 0 && (
                <ul className="mega-menu-sub">
                  {item.children.map((sub) => (
                    <li key={sub.id}>
                      <Link to={mapWpUrlToReact(sub.url)}>
                        {sub.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {item.image && (
                <Link to={mapWpUrlToReact(item.url)}>
                  <img src={item.image} alt={item.title} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMobileSubMenu = (items, level = "top") => {
    if (!items || items.length === 0) return null;

    return (
      <ul className={`sub-menu ${level === "top" ? "top-level" : ""}`}>
        {items.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isActive = level === "top" ? activeMenu === item.id : activeSubMenu === item.id;

          return (
            <li key={item.id} className={`menu-item ${hasChildren ? "menu-item-has-children" : ""}`}>
              {hasChildren ? (
                <div
                  className="menu-parent-title"
                  onClick={() => toggleSubMenu(item.id, level)}
                >
                  {item.title}
                  <span className="submenu-icon">{isActive ? "-" : "+"}</span>
                </div>
              ) : (
                <Link
                  to={mapWpUrlToReact(item.url)}
                  onClick={closeMenu}
                >
                  {item.title}
                </Link>
              )}

              {hasChildren && isActive && renderMobileSubMenu(item.children, "sub")}
            </li>
          );
        })}
      </ul>
    );
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const toggleMiniCart = (e) => {
    e.preventDefault();
    setCartOpen(true); 
  };

  return (
    <>
    <header 
      id="masthead" 
      className={`site-header ${isSticky ? "sticky-enabled" : ""}`}
      >
      <div className="container">
        
        <div className="mobile-trigger-wrapper pull-left">
          <button
            id="mobile-trigger"
            onClick={toggleMenu}
            className={`toggle-menu ${mobileMenu ? "open" : ""}`}
          >
            <i className={`fa ${mobileMenu ? "fa-times" : "fa-bars"}`}></i>
          </button>
        </div>
        <div className="site-branding pull-left">
          <div id="site-identity">
            <h1 className="site-title">
              {/* Desktop Logo Link Click Logic Added */}
              <Link to="/" rel="home" onClick={handleLogoClick}>
                <img
                  src={options.site_logo_dark || "/images/logo-black.png"}
                  alt="logo"
                  className="site-logo"
                />
              </Link>
            </h1>
          </div>
        </div>
        
        <HeaderMiniCart />
        <div className="searchForm pull-right">
          <div className="product-search-wrapper" ref={desktopSearchRef}>
            <input
              type="text"
              placeholder="Search Products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button>
              <i className="fas fa-search"></i>
            </button>
            {searchTerm && (
              <div className="search-dropdown">

                {searchLoading && <p>Searching...</p>}

                {!searchLoading && searchResults.length === 0 && (
                  <p>No products found</p>
                )}

                {searchResults.map((product) => {
                  const regularPrice = parseInt(product.custom_price_data.regular_price);
                  const salePrice = parseInt(product.custom_price_data.sale_price);
                  const isSale = salePrice < regularPrice;
                  return(
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      className="search-item"
                      onClick={() => {
                        setSearchTerm("");
                        setSearchResults([]);
                      }}
                    >
                      <img
                        src={product.images[0]?.src}
                        alt={product.name}
                        width="40"
                      />

                      <div className="search-product-info">
                        <p>{product.name}</p>
                        <div className="product-price-container">
                          {isSale && <span className="sale-price">৳{salePrice.toFixed(0)}</span>}
                          {isSale && <del className="regular-price">৳{regularPrice.toFixed(0)}</del>}
                          {isSale && <span className="save-amount"> Save ৳{(regularPrice - salePrice).toFixed(0)}</span>}
                          {!isSale && <span className="regular-price sale-price">৳{regularPrice.toFixed(0)}</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div
          className="mobile-product-search pull-right"
          ref={mobileSearchRef}
        >
          <button onClick={() => setShowSearch(!showSearch)}>
            <i className="fas fa-search"></i>
          </button>

          {showSearch && (
            <div className="mobile-search-box">
              <input
                type="text"
                placeholder="Search Products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && (
                <div className="search-dropdown">

                  {searchLoading && <p>Searching...</p>}

                  {!searchLoading && searchResults.length === 0 && (
                    <p>No products found</p>
                  )}

                  {searchResults.map((product) => {
                    const regularPrice = parseInt(product.custom_price_data.regular_price);
                    const salePrice = parseInt(product.custom_price_data.sale_price);
                    const isSale = salePrice < regularPrice;
                
                    return(
                      <Link
                        key={product.id}
                        to={`/product/${product.slug}`}
                        className="search-item"
                        onClick={() => {
                          setSearchTerm("");
                          setSearchResults([]);
                          setShowSearch(false);
                        }}
                      >
                        <img
                          src={product.images[0]?.src}
                          alt={product.name}
                          width="40"
                        />
                        <div className="search-product-info">
                          <p>{product.name} sad</p>
                          <div className="product-price-container">
                            {isSale && <span className="sale-price">৳{(salePrice / 100).toFixed(0)}</span>}
                            {isSale && <del className="regular-price">৳{(regularPrice / 100).toFixed(0)}</del>}
                            {isSale && <span className="save-amount"> Save ৳{((regularPrice - salePrice) / 100).toFixed(0)}</span>}
                            {!isSale && <span className="regular-price sale-price">৳{(regularPrice / 100).toFixed(0)}</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <nav className="main-navigation text-center">
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.id}
                className={`menu-item menu-item-${item.id} ${item.classes?.join(
                  " "
                )} ${
                  item.children?.length ? "menu-item-has-children" : ""
                }`}
              >
                <Link to={mapWpUrlToReact(item.url)}>
                  {item.title}
                </Link>

                {item.mega && item.children
                  ? renderMegaMenu(item.children)
                  : renderSubMenu(item.children)}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
    {mobileMenu && <div className="mobile-overlay" onClick={closeMenu}></div>}
    <div className={`mobile-menu ${mobileMenu ? "open" : ""}`}>
      <div className="site-branding pull-left">
        <div id="site-identity">
          <h1 className="site-title">
            {/* Mobile Logo Link Click Logic Added */}
            <Link to="/" rel="home" onClick={handleLogoClick}>
              <img
                src={options.site_logo_dark || "/images/logo-black.png"}
                alt="logo"
                className="site-logo"
              />
            </Link>
          </h1>
        </div>
      </div>
      <div className="mobile-menu-header">
        <button className="close-menu" onClick={closeMenu}>
          ✕
        </button>
      </div>
      <div className="mobile-drawer-menu">
        <h3 className="mobile-title">Special Offers</h3>
        <ul className="drawer-menu-list">
          <li className="drawer-menu-item">
            <Link to="/product-category/sale/" className="drawer-menu-link">
              <span className="drawer-icon green-icon"><i class="fa-solid fa-percent"></i></span>
              <span className="drawer-text">Up To 15% Sales</span>
            </Link>
          </li>
          <li className="drawer-menu-item">
            <Link to="/product-category/mega-deal/" className="drawer-menu-link">
              <span className="drawer-icon green-icon"><i className="fa-solid fa-star"></i></span>
              <span className="drawer-text">Mega Deal</span>
            </Link>
          </li>
          <li className="drawer-menu-item">
            <Link to="/product-category/top-selling/" className="drawer-menu-link">
              <span className="drawer-icon default-icon"><i className="fa-solid fa-fire"></i></span>
              <span className="drawer-text">Top Selling</span>
            </Link>
          </li>
          <li className="drawer-menu-item">
            <Link to="/product-category/new-arrivals/" className="drawer-menu-link active">
              <span className="drawer-icon blue-icon"><i class="fa-solid fa-plane"></i></span>
              <span className="drawer-text">New Arrivals</span>
            </Link>
          </li>
        </ul>
      </div>
      <h3 className="mobile-title">Categories</h3>
      {renderMobileSubMenu(menuItems)}
    </div>
    {isDesktop && (
      <div className="floating-cart" onClick={toggleMiniCart} id="cart-icon">
        <div className="cart-icon-box">
          <span className="cart-icon">🛒</span> 
          <span className="item-count">{cartItems.length} Items</span>
        </div>
        <div className="cart-price">
          ৳{subtotal.toFixed(0)}
        </div>
      </div>
    )}
    </>
  );
};

export default NavBar;