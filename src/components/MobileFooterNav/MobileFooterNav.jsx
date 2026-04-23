import React from 'react';
import { Link } from 'react-router-dom';
import './MobileFooterNav.css';
import { useCart } from '../../context/CartContext';

const MobileFooterNav = () => {
  const { cartItems, setCartOpen } = useCart();
  const cartItemCount = cartItems.length; 
  const toggleMiniCart = (e) => {
    e.preventDefault();
    setCartOpen(true); 
  };
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
      
      <Link to="/" className="nav-item active" onClick={toggleMiniCart}>
        <div className="cart-wrapper">
          <i className="fas fa-shopping-cart"></i>
          <span className="cart-badge">{cartItemCount}</span>
        </div>
        <span>Cart</span>
      </Link>
      <Link to="/login" className="nav-item">
        <i className="far fa-user"></i>
        <span>Login</span>
      </Link>
      <Link to="https://api.whatsapp.com/send?phone=+8801811877477" className="nav-item" target="_blank" rel="noopener noreferrer">
        <i className="fab fa-whatsapp"></i>
        <span>Chat</span>
      </Link>
    </div>
  );
};

export default MobileFooterNav;