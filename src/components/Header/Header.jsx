import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import axios from "axios";
import config from "../../config";

const Header = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null); // top-level open
  const [activeSubMenu, setActiveSubMenu] = useState(null); // nested submenu open

  // Toggle mobile menu
  const toggleMenu = () => setMobileMenu(!mobileMenu);
  const closeMenu = () => setMobileMenu(false);

  // Toggle submenu accordion
  const toggleSubMenu = (id, level = "top") => {
    if (level === "top") {
      setActiveMenu(activeMenu === id ? null : id);
    } else {
      setActiveSubMenu(activeSubMenu === id ? null : id);
    }
  };

  // Fetch menu items from API
  useEffect(() => {
    axios
      .get(`${config.API_URL}/reactpress/v1/menu/main-menu`)
      .then((res) => setMenuItems(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".mobile-menu") &&
        !e.target.closest("#mobile-trigger")
      ) {
        setMobileMenu(false);
      }
    };
    if (mobileMenu) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [mobileMenu]);

  // Map WP URL to React route
  const mapWpUrlToReact = (url) => url.replace(config.SITE_URL, "/");

  // Recursive render for dynamic mobile submenu
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

  return (
    <header className="site-header">
      {/* Overlay */}
      {mobileMenu && <div className="mobile-overlay" onClick={closeMenu}></div>}

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileMenu ? "open" : ""}`}>
        <div className="site-branding pull-left">
          <div id="site-identity">
            <h1 className="site-title">
              <Link to="/" rel="home">
                <img
                  src="https://toffpark.com/wp-content/uploads/2021/08/Toffpark-Logo-Black-1.png"
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

        {/* Render Dynamic Mobile Menu */}
        {renderMobileSubMenu(menuItems)}
      </div>

      {/* Top Header with Mobile Trigger */}
      <div className="top-header">
        <div className="container flex-between">
          <div className="mobile-trigger-wrapper">
            <button
              id="mobile-trigger"
              onClick={toggleMenu}
              className={`toggle-menu ${mobileMenu ? "open" : ""}`}
            >
              <i className={`fa ${mobileMenu ? "fa-times" : "fa-bars"}`}></i>
            </button>
          </div>
          <div className="contact-info">
            <a href="tel:+8801811877477">Call Us +8801811877477</a>
          </div>
          <div className="header-icons">
            <a href="/" className="icon"><i className="fas fa-phone"></i></a>
            <a href="/" className="icon"><i className="fas fa-th-large"></i></a>
            <a href="/" className="icon"><i className="fa fa-user"></i></a>
          </div>
        </div>
      </div>

      {/* Desktop NavBar */}
      <NavBar menuItems={menuItems} />
    </header>
  );
};

export default Header;