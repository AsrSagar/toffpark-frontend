import React from "react";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";
import "./MiniCart.css";

const MiniCart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartOpen, setCartOpen } = useCart();

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.qty, 0);

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${cartOpen ? "active" : ""}`}
        onClick={() => setCartOpen(false)}
      ></div>

      {/* Drawer */}
      <div className={`mini-cart ${cartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h4>Shopping cart</h4>
          <button className="close-btn" onClick={() => setCartOpen(false)}>
            Close
          </button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            cartItems.map((item) => (
              <div className="product-mini-cart-item" key={item.id}>
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <h6>{item.name}</h6>

                  <div className="price-qty">
                    <span>
                      {item.qty} × ৳ {item.price} {item.unit || "/each"}
                    </span>
                  </div>

                  <div className="qty-controls">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.qty - 1 > 0 ? item.qty - 1 : 1)
                      }
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQuantity(item.id, item.qty + 1)}>
                      +
                    </button>
                  </div>
                </div>

                <button
                  className="mini-remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  <i className="fa fa-trash-alt"></i>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="subtotal">
            <span>Subtotal:</span>
            <span>৳ {subtotal}</span>
          </div>
          <Link to="/cart" className="btn btn-light w-100 mb-2">
            View Cart
          </Link>
          <Link to="/checkout" className="btn btn-success w-100">
            Checkout
          </Link>
        </div>
      </div>
    </>
  );
};

export default MiniCart;
