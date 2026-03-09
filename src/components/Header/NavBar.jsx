import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import config from "../../config";
import HeaderMiniCart from "./HeaderMiniCart";
import './header.css';

const NavBar = () => {
    const API_URL = config.API_URL; 
    const SITE_URL = config.SITE_URL;
    const [menuItems, setMenuItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        axios
        .get(`${API_URL}/reactpress/v1/menu/main-menu`)
        .then((res) => setMenuItems(res.data))
        .catch((err) => console.error(err));
    }, [API_URL]);

    useEffect(() => {
        if (!searchTerm) {
            setSearchResults([]);
            return;
        }
        const delayDebounce = setTimeout(() => {
            setSearchLoading(true);

            axios
            .get(`${API_URL}/wc/store/v1/products`, {
                params: {
                    search: searchTerm,
                    per_page: 5,
                },
                auth: {
                    username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
                    password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
                },
            })
            .then((res) => {
                setSearchResults(res.data);
            })
            .catch((err) => console.error(err))
            .finally(() => setSearchLoading(false));
        }, 500); // debounce 500ms

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, API_URL]);

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
                <div className="site-branding pull-left">
                    <div id="site-identity">
                        <h1 className="site-title">
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
                <HeaderMiniCart />
                <div className="searchForm pull-right">
                    <div className="product-search-wrapper">
                        <input
                        type="text"
                        placeholder="Search Products"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button>
                        <i className="fas fa-search"></i>
                        </button>

                        {/* 🔥 Search Dropdown */}
                        {searchTerm && (
                        <div className="search-dropdown">
                            {searchLoading && <p>Searching...</p>}

                            {!searchLoading && searchResults.length === 0 && (
                            <p>No products found</p>
                            )}

                            {searchResults.map((product) => (
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
                                    <div dangerouslySetInnerHTML={{ __html: product.price_html }} />
                                </div>
                            </Link>
                            ))}
                        </div>
                        )}
                    </div>
                </div>
                <nav className="main-navigation text-center">
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