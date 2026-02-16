import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import config from "../../config";
import HeaderMiniCart from "./HeaderMiniCart";

const NavBar = () => {
    const API_URL = config.API_URL; 
    const SITE_URL = config.SITE_URL;
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        axios
        .get(`${API_URL}/reactpress/v1/menu/main-menu`)
        .then((res) => setMenuItems(res.data))
        .catch((err) => console.error(err));
    }, [API_URL]);

      // Render normal submenu recursively
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
                <Link to={item.url}>{item.title}</Link>
                {renderSubMenu(item.children)}
            </li>
            ))}
        </ul>
        );
    };

    // Render mega menu columns
    const renderMegaMenu = (items) => {
        if (!items || items.length === 0) return null;

        return (
        <div className="flat-mega-memu">
            {items.map((item) => (
            <div key={item.id} className="mega-menu-box col-grid-3">
                <div className="menu-container">
                {item.title && <h3 className="megamenu-title">{item.title}</h3>}

                {item.children?.length > 0 && (
                    <ul className="mega-menu-sub">
                    {item.children.map((sub) => (
                        <li key={sub.id}>
                        <Link to={mapWpUrlToReact(sub.url)}>{sub.title}</Link>
                        </li>
                    ))}
                    </ul>
                )}

                {item.image && (
                    <Link href={mapWpUrlToReact(item.url)}>
                    <img src={item.image} alt={item.title} />
                    </Link>
                )}
                </div>
            </div>
            ))}
        </div>
        );
    };

    const mapWpUrlToReact = (url) => {
        return url.replace(SITE_URL, "/");
    };

    return (
        <header id="masthead" className="site-header sticky-enabled">
            <div className="container">
                <div class="site-branding pull-left">
                    <div id="site-identity">
                        <h1 class="site-title">
                            <Link to="/"  rel="home">
                                <img
                                    src="https://toffpark.com/wp-content/uploads/2021/08/Toffpark-Logo-Black-1.png"
                                    alt="logo"
                                    className="site-logo"
                                />
                            </Link>
                        </h1>
                    </div>
                </div>
                <Link
                to="/contact"
                className="custom-button custom-secondary-button pull-right quick-link-button button-small"
                >
                Quick Contact
                </Link>
                <HeaderMiniCart />
                <nav className="main-navigation pull-right">
                    <ul>
                        {menuItems.map((item) => (
                        <li
                            key={item.id}
                            className={`menu-item menu-item-${item.id} ${item.classes?.join(" ")} ${
                            item.children?.length ? "menu-item-has-children" : ""
                            }`}
                        >
                            <Link to={mapWpUrlToReact(item.url)}>{item.title}</Link>
                            {item.mega && item.children
                            ? renderMegaMenu(item.children)
                            : renderSubMenu(item.children)}
                        </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
};  
export default NavBar;