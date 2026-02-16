import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const CartPage = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();

  const formatPrice = (price) => {
    return Number(price).toFixed(2); // price already in correct format
  };

  return (
    <>
      <div id="custom-header">
        <div className="custom-header-content">
          <div className="container">
            <h1 className="page-title">Cart</h1>
            <div id="breadcrumb">
              <div aria-label="Breadcrumbs" className="breadcrumbs breadcrumb-trail">
                <ul className="trail-items">
                  <li className="trail-item trail-begin">
                    <a href="/" rel="home"><span>Home</span></a>
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
                          <th className="product-name">Product Detail</th>
                          <th className="product-price">Price</th>
                          <th className="product-quantity">Quantity</th>
                          <th className="product-subtotal">Total</th>
                          <th className="product-remove"></th>
                        </tr>
                      </thead>

                      <tbody>
                        {cartItems.map((item) => {
                          const subtotal = item.price * item.qty;
                          return (
                            <tr key={item.id} className="cart-item">
                              <td className="product-name" data-title="Product">
                                <a href="/" className="cart-product-thumb">
                                  <img src={item.image} alt={item.name} />
                                </a>
                                <div className="product-info">
                                  <h3>{item.name}</h3>
                                  {/* Categories / Size / Color can be optional */}
                                </div>
                              </td>

                              <td className="product-price" data-title="Price">
                                <span className="product-Price-amount amount">
                                  ৳{formatPrice(item.price)}
                                </span>
                              </td>

                              <td className="product-quantity" data-title="Quantity">
                                <div className="quantity">
                                  <input
                                    type="number"
                                    className="input-text"
                                    min="1"
                                    value={item.qty}
                                    onChange={(e) =>
                                      updateQuantity(item.id, Number(e.target.value))
                                    }
                                  />
                                </div>
                              </td>

                              <td className="product-subtotal" data-title="Total">
                                <span className="product-Price-amount amount">
                                  ৳{formatPrice(subtotal)}
                                </span>
                              </td>

                              <td className="product-remove" data-title="Remove">
                                <button
                                  type="button"
                                  className="remove"
                                  title="Remove this item"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <i className="fa fa-times"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        <tr>
                          <td colSpan="5" className="actions">
                            <div className="coupon">
                              <label>Coupon:</label>
                              <input type="text" name="coupon-code" placeholder="Coupon code" />
                              <input type="submit" className="button" name="apply-coupon" value="Apply coupon" />
                            </div>
                            <input type="submit" className="custom button" name="update-cart" value="Update Cart" disabled />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </form>

                  <div className="cart-collaterals">
                    <div className="cart-totals calculated-shipping">
                      <h2>Cart Totals</h2>
                      <table className="shop-table shop-table-responsive">
                        <tbody>
                          <tr className="cart-subtotal">
                            <th>Subtotal</th>
                            <td data-title="Subtotal">
                              <span className="product-Price-amount amount">৳{formatPrice(cartTotal)}</span>
                            </td>
                          </tr>
                          <tr className="order-total">
                            <th>Total</th>
                            <td data-title="Total">
                              <strong>
                                <span className="product-Price-amount amount">৳{formatPrice(cartTotal)}</span>
                              </strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="wc-proceed-to-checkout">
                        <Link className="checkout-button custom-button" to="/checkout">
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
