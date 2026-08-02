import React, { useState, useEffect } from "react";
import { useThemeOptions } from "../../context/ThemeOptionsContext";
import NavBar from "./NavBar";
import config from "../../config";
import "./Topbar.css";

const Header = () => {
  const { options } = useThemeOptions();
  const [menuItems, setMenuItems] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);

  // Fetch menu items from API
  useEffect(() => {
    const controller = new AbortController();

    const loadMenu = async () => {
      try {
        const res = await fetch(
          `${config.API_URL}/reactpress/v1/menu/main-menu`,
          {
            signal: controller.signal,
            cache: "force-cache",
          }
        );

        const data = await res.json();
        setMenuItems(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      }
    };

    loadMenu();

    return () => controller.abort();
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
            <a href={`tel:${options.phone_number}`} style={{ color: '#000', textDecoration: 'none' }}>
              Call Us {options.phone_number}
            </a>
          </div>

          {/* Center: Marquee Notice */}
          <div className="notic-item">
            <p>{options.top_bar_text}</p>
          </div>

          {/* Right: Social Icons */}
          <div className="header-icons">
            <a href="https://www.facebook.com/orlazzofficial/" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
            <a href="https://www.instagram.com/orlazzofficial/ " target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
            <a href="https://api.whatsapp.com/send/?phone=8801811877477" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp"></i></a>
          </div>

        </div>
      </div>
      <NavBar menuItems={menuItems} />
    </header>
  );
};

export default Header;