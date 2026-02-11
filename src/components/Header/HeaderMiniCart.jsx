import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const HeaderMiniCart = () => {
  const {
    cartItems,
    cartTotal,
    removeFromCart,
    updateQuantity,
  } = useCart();

  const miniCartRef = useRef(null);
  const [showMiniCart, setShowMiniCart] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (miniCartRef.current && !miniCartRef.current.contains(e.target)) {
        setShowMiniCart(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMiniCart = (e) => {
    e.preventDefault();
    setShowMiniCart((prev) => !prev);
  };

  return (
    <div id="header-right" className="pull-right">
      <div className="hearder-min-cart">
        <ul>
          <li className="cart-button mini-cart-wrap" ref={miniCartRef}>
            <a href="/" onClick={toggleMiniCart}>
              <i className="icon-basket"></i>
              <span>{cartItems.length}</span>
            </a>

            {showMiniCart && (
              <ul className="cart-list">
                {cartItems.length === 0 && (
                  <li style={{ padding: "10px" }}>Cart is empty</li>
                )}

                {cartItems.map((item) => (
                  <li key={item.id}>
                    <div className="cart-img">
                      <img src={item.image} alt={item.name} />
                    </div>

                    <div className="cart-info">
                      <h4>{item.name}</h4>

                      {/* Quantity controls */}
                      <div className="mini-cart-qty">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.qty - 1)
                          }
                          disabled={item.qty <= 1}
                        >
                          −
                        </button>

                        <span>{item.qty}</span>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.qty + 1)
                          }
                        >
                          +
                        </button>
                      </div>

                      <span className="mini-cart-price">
                        ৳{(item.qty * item.price).toFixed(2)}
                      </span>
                    </div>

                    <div className="del-icon">
                      <i
                        className="fa fa-times"
                        onClick={() => removeFromCart(item.id)}
                      ></i>
                    </div>
                  </li>
                ))}

                {cartItems.length > 0 && (
                  <>
                    <li className="mini-cart-price">
                      <span className="subtotal">Subtotal:</span>
                      <span className="subtotal-price ml-auto">
                        ৳{cartTotal.toFixed(2)}
                      </span>
                    </li>

                    <li>
                      <div className="mini-cart-button">
                        <Link
                          className="custom-button button-small pull-left"
                          to="/cart/"
                        >
                          View Cart
                        </Link>
                        <Link
                          className="custom-button custom-secondary-button button-small pull-right"
                          to="/checkout/"
                        >
                          Checkout
                        </Link>
                      </div>
                    </li>
                  </>
                )}
              </ul>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HeaderMiniCart;
