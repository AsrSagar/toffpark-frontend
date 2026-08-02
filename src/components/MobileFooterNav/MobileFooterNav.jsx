import React, {  useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './MobileFooterNav.css';
import { useCart } from '../../context/CartContext';
import config from '../../config';
import axios from 'axios';

const MobileFooterNav = () => {
  const API_URL = config.API_URL;
  const { cartItems, setCartOpen } = useCart();
  const cartItemCount = cartItems.length; 
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const toggleMiniCart = (e) => {
    e.preventDefault();
    setCartOpen(true); 
  };

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

  return (
    <div className="mobile-bottom-nav">
      <Link to="/" className="nav-item">
        <i className="fas fa-home"></i>
        <span>Home</span>
      </Link>
      
      <Link to="/shop" className="nav-item">
        <i className="fas fa-th-large"></i>
        <span>Category</span>
      </Link>
      
      <Link to="/" className="nav-item active mobile-cart-btn" onClick={toggleMiniCart}>
        <div className="cart-wrapper" id='cart-icon'>
          <i className="fas fa-shopping-cart"></i>
          <span className="cart-badge">{cartItemCount}</span>
        </div>
        <span className='cart-text'>Cart</span>
      </Link>
      
      <Link 
      className="nav-item" 
      rel="noopener noreferrer"
      onClick={() => setShowSearch(!showSearch)}
      >
        <i className="fas fa-search"></i>
        <span>Search</span>
      </Link>
      <Link to="/my-account" className="nav-item">
        <i className="far fa-user"></i>
        <span>Login</span>
      </Link>
      {showSearch && (
        <div className="mobile-search-box">
          <div class="search-header">
            <p><strong>Search Products</strong></p>
            <span class="close-btn-mobile" onclick="toggleSearchModal()"> x</span>
          </div>
          <input
            type="text"
            placeholder="Search Products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button class="search-btn-mobile"><i class="fas fa-search"></i></button>
          {searchTerm && (
            <div className="search-dropdown">

              {searchLoading && <p>Searching...</p>}

              {!searchLoading && searchResults.length === 0 && (
                <p>No products found</p>
              )}

              {searchResults.map((product) => {
                const regularPrice = product.custom_price_data.regular_price ? parseInt(product.custom_price_data.regular_price) : 0;
                const salePrice = product.custom_price_data.sale_price ? parseInt(product.custom_price_data.sale_price) : 0;
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
                      <div className="product-price-container mobile-search-price">
                        {isSale && <span className="sale-price">৳{salePrice.toFixed(0)}</span>}
                        {isSale && <del className="regular-price">৳{regularPrice.toFixed(0)}</del>}
                        {isSale && <span className="save-amount"> Save ৳{((regularPrice - salePrice)).toFixed(0)}</span>}
                        {!isSale && <span className="regular-price sale-price">৳{regularPrice.toFixed(0)}</span>}
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
  );
};

export default MobileFooterNav;