import React, { useState } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import ThankYouPopup from "../ThankYouPopup/ThankYouPopup";
import config from "../../config";

const CheckoutPage = () => {
  const API_URL = config.API_URL;

  const { cartItems, cartTotal, clearCart } = useCart();

  const [billing, setBilling] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
    phone: "",
  });

  const [orderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Format price with 2 decimals
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(price));
  };

  // Handle billing input changes
  const handleBillingChange = (e) => {
    setBilling({ ...billing, [e.target.name]: e.target.value });
  };

  // Place order
  const placeOrder = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      alert("Please accept the terms & conditions");
      return;
    }

    setLoading(true);

    // Prepare line items with correct quantity and price
    const line_items = cartItems.map((item) => ({
      product_id: item.id,
      quantity: item.qty,
      subtotal: item.price.toFixed(2),
      total: (item.price * item.qty).toFixed(2),
    }));

    const orderData = {
      payment_method: paymentMethod,
      payment_method_title:
        paymentMethod === "cod" ? "Cash on Delivery" : "Other",
      set_paid: false,
      billing,
      shipping: billing,
      line_items,
      customer_note: orderNotes,
    };

    try {
      const response = await axios.post(`${API_URL}/wc/v3/orders`, orderData, {
        auth: {
          username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
          password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
        },
      });

      setOrderStatus(`Order placed successfully! Order ID: ${response.data.id}`);
      setOrderId(response.data.id);
      clearCart();
      setShowThankYou(true);
      setOrderStatus("");
    } catch (error) {
      console.error(error.response?.data || error.message);
      setOrderStatus("Failed to place order. Check console for details.");
    }

    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div id="custom-header">
        <div className="custom-header-content">
          <div className="container">
            <h1 className="page-title">Checkout</h1>
            <div id="breadcrumb">
              <div aria-label="Breadcrumbs" className="breadcrumbs breadcrumb-trail">
                <ul className="trail-items">
                  <li className="trail-item trail-begin">
                    <a href="/" rel="home"><span>Home</span></a>
                  </li>
                  <li className="trail-item trail-end"><span>Checkout</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div id="content" className="site-content default-full-width">
        <div className="container">
          <div className="inner-wrapper">
            <div id="primary" className="content-area">
              <main id="main" className="site-main">
                <div className="section-checkout">
                  <form className="checkout product-checkout" onSubmit={placeOrder}>
                    <div className="col2-set" id="customer_details">
                      {/* Billing */}
                      <div className="col-1">
                        <div className="product-billing-fields">
                          <h3>Billing Details</h3>
                          <div className="product-billing-fields_field-wrapper">
                            {/* Example: First Name */}
                            <div className="form-row form-row-first">
                              <label>First Name<abbr className="required">*</abbr></label>
                              <input
                                type="text"
                                name="first_name"
                                placeholder="First Name"
                                value={billing.first_name}
                                onChange={handleBillingChange}
                                required
                              />
                            </div>
                            {/* Last Name */}
                            <div className="form-row form-row-last">
                              <label>Last Name<abbr className="required">*</abbr></label>
                              <input
                                type="text"
                                name="last_name"
                                placeholder="Last Name"
                                value={billing.last_name}
                                onChange={handleBillingChange}
                                required
                              />
                            </div>
                            {/* Email */}
                            <div className="form-row form-row-wide">
                              <label>Email Address<abbr className="required">*</abbr></label>
                              <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={billing.email}
                                onChange={handleBillingChange}
                                required
                              />
                            </div>
                            {/* Country */}
                            <div className="form-row form-row-wide">
                              <label>Country<abbr className="required">*</abbr></label>
                              <select
                                name="country"
                                value={billing.country}
                                onChange={handleBillingChange}
                                required
                              >
                                <option value="">Choose a country</option>
                                <option value="AI">Aland Islands</option>
                                <option value="AFG">Afganistan</option>
                                <option value="ALB">Albania</option>
                                <option value="ALG">Algeria</option>
                                <option value="AMS">America Samoa</option>
                                <option value="AND">Andorra</option>
                              </select>
                            </div>
                            {/* Address */}
                            <div className="form-row form-row-wide">
                              <label>Address<abbr className="required">*</abbr></label>
                              <input
                                type="text"
                                name="address_1"
                                placeholder="Street Address"
                                value={billing.address_1}
                                onChange={handleBillingChange}
                                required
                              />
                              <input
                                type="text"
                                name="address_2"
                                placeholder="Apartment, Suite, Unit etc"
                                value={billing.address_2}
                                onChange={handleBillingChange}
                              />
                            </div>
                            {/* City / State / Postcode / Phone */}
                            <div className="form-row form-row-first">
                              <label>Town / City<abbr className="required">*</abbr></label>
                              <input
                                type="text"
                                name="city"
                                placeholder="Town / City"
                                value={billing.city}
                                onChange={handleBillingChange}
                                required
                              />
                            </div>
                            <div className="form-row form-row-last">
                              <label>State / Province<abbr className="required">*</abbr></label>
                              <input
                                type="text"
                                name="state"
                                placeholder="State / Province"
                                value={billing.state}
                                onChange={handleBillingChange}
                                required
                              />
                            </div>
                            <div className="form-row form-row-first">
                              <label>Postcode / Zip<abbr className="required">*</abbr></label>
                              <input
                                type="text"
                                name="postcode"
                                placeholder="Postcode / Zip"
                                value={billing.postcode}
                                onChange={handleBillingChange}
                                required
                              />
                            </div>
                            <div className="form-row form-row-last">
                              <label>Phone Number<abbr className="required">*</abbr></label>
                              <input
                                type="text"
                                name="phone"
                                placeholder="Phone Number"
                                value={billing.phone}
                                onChange={handleBillingChange}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Review & Payment */}
                      <div className="col-2">
                        <h3 id="order-review-heading">Your Order</h3>
                        <table className="shop-table product-checkout-review-order-table">
                          <thead>
                            <tr>
                              <th className="product-name">Product Details</th>
                              <th className="product-total">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cartItems.map((item) => {
                              const subtotal = item.price * item.qty;
                              return (
                                <tr key={item.id} className="cart-item">
                                  <td className="product-name">
                                    {item.name} <span className="product-quantity">x {item.qty}</span>
                                  </td>
                                  <td className="product-total">৳{formatPrice(subtotal)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="cart-subtotal">
                              <td>Cart Sub-total</td>
                              <td>৳{formatPrice(cartTotal)}</td>
                            </tr>
                            <tr className="order-total">
                              <th>Order Total</th>
                              <th>৳{formatPrice(cartTotal)}</th>
                            </tr>
                          </tfoot>
                        </table>

                        {/* Payment Methods */}
                        <div id="payment" className="product-checkout-payment">
                          <h3>Payment Methods</h3>
                          <ul className="wc-payment-methods payment-methods methods">
                            <li className="wc-payment-method">
                              <input
                                type="radio"
                                name="payment-method"
                                value="cod"
                                checked={paymentMethod === "cod"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                              />
                              <label>Cash on Delivery</label>
                            </li>
                            <li className="wc-payment-method">
                              <input
                                type="radio"
                                name="payment-method"
                                value="bacs"
                                checked={paymentMethod === "bacs"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                              />
                              <label>Direct Bank Transfer</label>
                            </li>
                            <li className="wc-payment-method">
                              <input
                                type="radio"
                                name="payment-method"
                                value="cheque"
                                checked={paymentMethod === "cheque"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                              />
                              <label>Cheque Payments</label>
                            </li>
                          </ul>

                          <div className="form-row form-row-wide create-account product-validated">
                            <div className="checkbox-wrap">
                              <input
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                              />
                              <label className="checkbox">
                                I’ve read and accept the terms & conditions *
                              </label>
                            </div>
                          </div>

                          <div className="form-row place-order">
                            <button type="submit" className="button alt" disabled={loading}>
                              {loading ? "Placing Order..." : "Place Order"}
                            </button>
                          </div>

                          {orderStatus && <p>{orderStatus}</p>}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>

      {/* Thank You Popup */}
      <ThankYouPopup
        show={showThankYou}
        orderId={orderId}
        onClose={() => {
          setShowThankYou(false);
          window.location.href = "/"; 
        }}
      />
    </div>
  );
};

export default CheckoutPage;
