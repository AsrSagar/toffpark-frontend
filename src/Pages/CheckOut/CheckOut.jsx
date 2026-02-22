import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import ThankYouPopup from "../ThankYouPopup/ThankYouPopup";
import config from "../../config";

// Function to get device type, UTM params, and session page views
const getTrackingData = () => {
  const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop";

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source") || "direct";
  const utmMedium = urlParams.get("utm_medium") || "none";
  const utmCampaign = urlParams.get("utm_campaign") || "none";

  let pageViews = sessionStorage.getItem("page_views");
  pageViews = pageViews ? parseInt(pageViews, 10) + 1 : 1;
  sessionStorage.setItem("page_views", pageViews);

  return {
    deviceType,
    utmSource,
    utmMedium,
    utmCampaign,
    pageViews,
  };
};

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

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [deliveryMethod, setDeliveryMethod] = useState("inside_dhaka");
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Delivery Charges
  const deliveryCharges = {
    inside_dhaka: 60,
    outside_dhaka: 120,
  };
  const deliveryFee = deliveryCharges[deliveryMethod] || 0;

  // Final total (discount only applies to product total)
  const finalTotal = Number(cartTotal - discountAmount) + deliveryFee;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(price));
  };

  const handleBillingChange = (e) => {
    setBilling({ ...billing, [e.target.name]: e.target.value });
  };

  // Apply Promo Code
  const applyPromoCode = async () => {
    if (!promoCode) return;

    setPromoLoading(true);

    try {
      const res = await axios.get(`${API_URL}/wc/v3/coupons?code=${promoCode}`, {
        auth: {
          username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
          password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
        },
      });

      if (res.data.length > 0) {
        const coupon = res.data[0];

        if (coupon.discount_type === "percent") {
          const discount = (cartTotal * parseFloat(coupon.amount)) / 100;
          setDiscountAmount(discount);
          setPromoMessage(`Promo code applied! ${coupon.amount}% discount: ৳${formatPrice(discount)}`);
        } else if (coupon.discount_type === "fixed_cart") {
          const discount = parseFloat(coupon.amount);
          setDiscountAmount(discount);
          setPromoMessage(`Promo code applied! Fixed discount: ৳${formatPrice(discount)}`);
        } else {
          setDiscountAmount(0);
          setPromoMessage("This promo code cannot be applied.");
        }
      } else {
        setDiscountAmount(0);
        setPromoMessage("Invalid promo code");
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      setDiscountAmount(0);
      setPromoMessage("Error validating promo code");
    }

    setPromoLoading(false);
  };

  // 🔥 META PIXEL - INITIATE CHECKOUT
  const checkoutFired = useRef(false);
  useEffect(() => {
    if (window.fbq && cartItems.length > 0 && !checkoutFired.current) {

      checkoutFired.current = true;

      // window.fbq("track", "InitiateCheckout", {
      //   value: Number(cartTotal),
      //   currency: "BDT",
      //   content_ids: cartItems.map(item => item.id),
      //   content_type: "product"
      // });
    }
  }, [cartItems, cartTotal]);

  // Place Order
  const placeOrder = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      alert("Please accept the terms & conditions");
      return;
    }

    setLoading(true);

    const line_items = cartItems.map((item) => {
      return {
        product_id: item.parent_id ? item.parent_id : item.id,
        variation_id: item.variation_id ? item.variation_id : 0,
        quantity: item.qty,
      };
    });

    const orderData = {
      payment_method: paymentMethod,
      payment_method_title:
        paymentMethod === "cod"
          ? "Cash on Delivery"
          : paymentMethod === "bacs"
          ? "Direct Bank Transfer"
          : "Cheque Payment",
      set_paid: false,
      billing,
      shipping: billing,
      line_items,
      shipping_lines: [
        {
          method_id: deliveryMethod,
          method_title: deliveryMethod === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka",
          total: deliveryFee.toString(),
        },
      ],
      coupon_lines:
        discountAmount > 0
          ? [{ code: promoCode }]
          : [],
    };

    // Add tracking data
    const trackingData = getTrackingData();
    orderData.meta_data = [
      ...(orderData.meta_data || []),
      { key: "device_type", value: trackingData.deviceType },
      { key: "utm_source", value: trackingData.utmSource },
      { key: "utm_medium", value: trackingData.utmMedium },
      { key: "utm_campaign", value: trackingData.utmCampaign },
      { key: "page_views", value: trackingData.pageViews },
    ];

    try {
      const response = await axios.post(`${API_URL}/wc/v3/orders`, orderData, {
        auth: {
          username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
          password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
        },
      });

      const orderID = response.data.id;
      setOrderId(orderID);
      try {
        if (window.fbq) {
          window.fbq(
            "track",
            "Purchase",
            {
              value: Number(finalTotal),
              currency: "BDT",
              content_ids: cartItems.map(item => item.id),
              content_type: "product"
            },
            { eventID: orderID }
          );
        }
      } catch (pixelError) {
        console.error("FB Pixel error:", pixelError);
      }
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
            <div id="breadcrumb">
              <div aria-label="Breadcrumbs" className="breadcrumbs breadcrumb-trail">
                <ul className="trail-items">
                  <li className="trail-item trail-begin">
                    <a href="/" rel="home"><span>Home</span></a>
                  </li>
                  <li className="trail-item trail-end">
                    <span>Checkout</span>
                  </li>
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
                            <div className="form-row form-row-first">
                              <label>First Name *</label>
                              <input type="text" name="first_name" value={billing.first_name} onChange={handleBillingChange} required />
                            </div>
                            <div className="form-row form-row-last">
                              <label>Last Name *</label>
                              <input type="text" name="last_name" value={billing.last_name} onChange={handleBillingChange} required />
                            </div>
                            <div className="form-row form-row-wide">
                              <label>Email *</label>
                              <input type="email" name="email" value={billing.email} onChange={handleBillingChange} required />
                            </div>
                            <div className="form-row form-row-wide">
                              <label>Address *</label>
                              <input type="text" name="address_1" value={billing.address_1} onChange={handleBillingChange} required />
                            </div>
                            <div className="form-row form-row-first">
                              <label>City *</label>
                              <input type="text" name="city" value={billing.city} onChange={handleBillingChange} required />
                            </div>
                            <div className="form-row form-row-last">
                              <label>State *</label>
                              <input type="text" name="state" value={billing.state} onChange={handleBillingChange} required />
                            </div>
                            <div className="form-row form-row-first">
                              <label>Postcode *</label>
                              <input type="text" name="postcode" value={billing.postcode} onChange={handleBillingChange} required />
                            </div>
                            <div className="form-row form-row-last">
                              <label>Phone *</label>
                              <input type="text" name="phone" value={billing.phone} onChange={handleBillingChange} required />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Review */}
                      <div className="col-2">
                        <h3>Your Order</h3>
                        <table className="shop-table product-checkout-review-order-table">
                          <tbody>
                            {cartItems.map((item) => (
                              <tr key={item.id}>
                                <td>{item.name} × {item.qty}</td>
                                <td>৳{formatPrice(item.price * item.qty)}</td>
                              </tr>
                            ))}
                            <tr>
                              <td>Cart Sub-total</td>
                              <td>৳{formatPrice(cartTotal)}</td>
                            </tr>
                            {discountAmount > 0 && (
                              <tr>
                                <td>Discount</td>
                                <td>-৳{formatPrice(discountAmount)}</td>
                              </tr>
                            )}
                            <tr>
                              <td>Delivery Charge</td>
                              <td>৳{formatPrice(deliveryFee)}</td>
                            </tr>
                            <tr>
                              <th>Order Total</th>
                              <th>৳{formatPrice(finalTotal)}</th>
                            </tr>
                          </tbody>
                        </table>

                        {/* Promo Code */}
                        <div className="form-row">
                          <input
                            type="text"
                            placeholder="Promo Code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                          />
                          <button type="button" onClick={applyPromoCode} disabled={promoLoading}>
                            {promoLoading ? "Applying..." : "Apply"}
                          </button>
                          {promoMessage && <p>{promoMessage}</p>}
                        </div>

                        {/* Delivery Method */}
                        <div className="product-checkout-payment">
                          <h3>Delivery Method</h3>
                          <ul className="wc-payment-methods methods">
                            <li>
                              <input
                                type="radio"
                                value="inside_dhaka"
                                checked={deliveryMethod === "inside_dhaka"}
                                onChange={(e) => setDeliveryMethod(e.target.value)}
                              />
                              <label>Inside Dhaka (৳60)</label>
                            </li>
                            <li>
                              <input
                                type="radio"
                                value="outside_dhaka"
                                checked={deliveryMethod === "outside_dhaka"}
                                onChange={(e) => setDeliveryMethod(e.target.value)}
                              />
                              <label>Outside Dhaka (৳120)</label>
                            </li>
                          </ul>
                        </div>

                        {/* Payment Methods */}
                        <div id="payment" className="product-checkout-payment">
                          <h3>Payment Methods</h3>
                          <label>
                            <input type="radio" value="cod" checked={paymentMethod === "cod"} onChange={(e) => setPaymentMethod(e.target.value)} />
                            Cash on Delivery
                          </label>

                          <div className="form-row">
                            <input
                              type="checkbox"
                              checked={termsAccepted}
                              onChange={(e) => setTermsAccepted(e.target.checked)}
                            />
                            <label>I accept terms & conditions *</label>
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
