import React, { useState, useEffect } from "react";
import NavBar from "./NavBar";
import axios from "axios";
import config from "../../config";
import "./Topbar.css";

const Header = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);

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

  return (
    <header className="site-header">
      <div className="top-header">
        <div className="container flex-between">
          
          {/* Left: Contact */}
          <div className="contact-info">
            <a href="tel:+8801811877477" style={{ color: '#fff', textDecoration: 'none' }}>
              Call Us +8801811877477
            </a>
          </div>

          {/* Center: Marquee Notice */}
          <div className="notic-item">
            <p>🔥 Special Offer! Get 20% discount on all products. 10% Off on Online Payment.</p>
          </div>

          {/* Right: Social Icons */}
          <div className="header-icons">
            <a href="/"><i className="fab fa-facebook-f"></i></a>
            <a href="/"><i className="fab fa-instagram"></i></a>
            <a href="/"><i className="fab fa-whatsapp"></i></a>
          </div>

        </div>
      </div>
      <NavBar menuItems={menuItems} />
    </header>
  );
};

export default Header;