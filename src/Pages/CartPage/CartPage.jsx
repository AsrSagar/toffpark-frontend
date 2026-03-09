import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const CartPage = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();

  const formatPrice = (price) => {
    return Number(price).toFixed(2);
  };

  return (
    <>
      <div id="custom-header">
        <div className="custom-header-content">
          <div className="container">
            <div id="breadcrumb">
              <div className="breadcrumbs breadcrumb-trail">
                <ul className="trail-items">
                  <li className="trail-item trail-begin">
                    <Link to="/"><span>Home</span></Link>
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

      <div id="content" className="site-content default-full-width">
        <div className="container">
          <div className="inner-wrapper">
            <div id="primary" className="content-area">
              <main id="main" className="site-main">
                <div className="section-cart">

                  <form className="product-cart-form">
                    <table className="cart shop-table shop-table-responsive">
                      <thead>
                        <tr>
                          <th>Product Detail</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                          <th></th>
                        </tr>
                      </thead>

                      <tbody>
                        {cartItems.map((item) => {
                          const subtotal = item.price * item.qty;

                          return (
                            <tr key={item.cartId} className="cart-item">
                              <td className="product-name">
                                <Link to="/" className="cart-product-thumb">
                                  <img src={item.image} alt={item.name} />
                                </Link>

                                <div className="product-info">
                                  <h3>{item.name}</h3>

                                  {/* ✅ Show Variation Info */}
                                  {item.size && (
                                    <p className="variation-info">
                                      <strong>Size:</strong> {item.size}
                                    </p>
                                  )}
                                </div>
                              </td>

                              <td>
                                ৳{formatPrice(item.price)}
                              </td>

                              <td>
                                <div className="quantity">
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.qty}
                                    onChange={(e) =>
                                      updateQuantity(
                                        item.cartId,
                                        Number(e.target.value)
                                      )
                                    }
                                  />
                                </div>
                              </td>

                              <td>
                                ৳{formatPrice(subtotal)}
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="remove"
                                  onClick={() =>
                                    removeFromCart(item.cartId)
                                  }
                                >
                                  <i className="fa fa-times"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        {cartItems.length === 0 && (
                          <tr>
                            <td colSpan="5" style={{ textAlign: "center" }}>
                              Your cart is empty
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </form>

                  <div className="cart-collaterals">
                    <div className="cart-totals calculated-shipping">
                      <h2>Cart Totals</h2>

                      <table className="shop-table">
                        <tbody>
                          <tr>
                            <th>Subtotal</th>
                            <td>৳{formatPrice(cartTotal)}</td>
                          </tr>

                          <tr>
                            <th>Total</th>
                            <td>
                              <strong>
                                ৳{formatPrice(cartTotal)}
                              </strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="wc-proceed-to-checkout">
                        <Link
                          className="checkout-button custom-button"
                          to="/checkout"
                        >
                          Proceed to checkout
                        </Link>
                      </div>
                    </div>
                  </div>

                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;