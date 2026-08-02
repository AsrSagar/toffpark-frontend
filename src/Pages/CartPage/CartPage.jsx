import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
// FontAwesome ba Lucide icons use korte paren trash icon er jonno
import { FaTrashAlt } from "react-icons/fa"; 
import "./CartPage.css";

const CartPage = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
    <div id="custom-header">
      <div className="custom-header-content">
        <div className="container">
          <div id="breadcrumb">
            <div
              aria-label="Breadcrumbs"
              className="breadcrumbs breadcrumb-trail"
            >
              <ul className="trail-items">
                <li className="trail-item trail-begin">
                  <a href="/" rel="home">
                    <span>Home</span>
                  </a>
                </li>
                <li className="trail-item trail-end">
                  <span>Cart</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="cart-page-wrapper">
      <div className="container">
        <h2 className="cart-title">Shopping Cart ({cartItems.length})</h2>
        <div className="cart-content-grid">
          {/* Left Side: Cart Items */}
          <div className="cart-items-list">
            <h3 className="summary-title">Cart Items</h3>
            <div className="cart-items-wrapper">
              {cartItems.map((item) => (
                <div key={item.cartId} className="cart-card">
                  <div className="cart-card-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-card-details">
                    <div className="details-header">
                      <h3 className="product-name">{item.name}</h3>
                      <button 
                        className="delete-btn"
                        onClick={() => removeFromCart(item.cartId)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>

                    <div className="cart-product-meta">
                      <span className="meta-tag">Size: {item.size || 'M-L 5 PC Packet'} x {item.qty}</span>
                    </div>

                    <div className="price-quantity-row">
                      <div className="quantity-selector cart-quantity-control">
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.cartId, item.qty - 1)}
                          className="qty-btn qty-minus"
                          >
                          −
                        </button>
                        
                        <input
                          type="number"
                          className="input-text"
                          min="1"
                          value={item.qty}
                          onChange={(e) => updateQuantity(item.cartId, e.target.value)}
                        />
                        
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.cartId, item.qty + 1)}
                          className="qty-btn qty-plus"
                        >
                        +
                        </button>
                      </div>
                      <span className="cart-product-price">
                        ৳{item.price * item.qty}
                        <del className="cart-product-regular-price">৳{item.regularPrice * item.qty}</del>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {cartItems.length === 0 && (
                <div className="empty-cart">Your cart is empty</div>
              )}
            </div>
          </div>

          <div className="summary-box">
            <h3 className="summary-title">Summary</h3>
            <div className="cart-summary-wrapper">
              <div className="summary-row">
                <span className="label">Subtotal</span>
                <span className="value">৳{cartTotal}</span>
              </div>
              <div className="summary-row">
                <span className="label">Delivery Charge</span>
                <span className="value cart-delivery-charge">Calculate at Checkout</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span className="label">Total</span>
                <span className="value">৳{cartTotal}</span>
              </div>
              <Link to="/checkout" className="cart-checkout-button">
                Proceed to checkout
              </Link>
              <Link to="/shop" className="cart-checkout-button continue-shopping-btn">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CartPage;