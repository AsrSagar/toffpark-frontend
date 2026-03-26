import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import ThankYouPopup from "../ThankYouPopup/ThankYouPopup";
import config from "../../config";
import "./CheckoutPage.css";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const processedRef = useRef(false); // prevents infinite useEffect loop

  const [billing, setBilling] = useState({
    first_name: "",
    address_1: "",
    phone: "",
    order_note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [deliveryMethod, setDeliveryMethod] = useState("inside_dhaka");
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const deliveryCharges = { inside_dhaka: 60, outside_dhaka: 120 };
  const deliveryFee = deliveryCharges[deliveryMethod] || 0;
  const finalTotal = Number(cartTotal - discountAmount) + deliveryFee;

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(price));

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
        let discount = 0;
        if (coupon.discount_type === "percent") {
          discount = (cartTotal * parseFloat(coupon.amount)) / 100;
          setPromoMessage(`Promo code applied! ${coupon.amount}% discount: ৳${formatPrice(discount)}`);
        } else if (coupon.discount_type === "fixed_cart") {
          discount = parseFloat(coupon.amount);
          setPromoMessage(`Promo code applied! Fixed discount: ৳${formatPrice(discount)}`);
        } else {
          setPromoMessage("This promo code cannot be applied.");
        }
        setDiscountAmount(discount);
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
  // ==========================
  // PLACE ORDER
  // ==========================
  const placeOrder = async (e) => {
    e.preventDefault();

    if (!termsAccepted) return alert("Please accept the terms & conditions");
    if (cartItems.length === 0) return alert("Cart is empty or invalid product data");

    setLoading(true);

    const line_items = cartItems.map(item => ({
      product_id: item.productId,
      variation_id: item.variationId || undefined, // undefined instead of 0 to avoid WC error
      quantity: item.qty,
    }));

    try {
      // --------------------------
      // SSLCommerz Payment
      // --------------------------
      if (paymentMethod === "sslcommerz") {
        // Create WooCommerce Order
        const orderResponse = await axios.post(
          `${API_URL}/wc/v3/orders`,
          {
            payment_method: "sslcommerz",
            payment_method_title: "SSLCommerz",
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
            coupon_lines: discountAmount > 0 ? [{ code: promoCode }] : [],
          },
          {
            auth: {
              username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
              password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
            },
          }
        );

        const orderID = orderResponse.data.id;

        // Call SSL Sandbox API
        const sslResponse = await axios.post(
          "https://dev.toffpark.com/wp-json/sslcommerz/v1/create-payment",
          {
            order_id: orderID,
            amount: finalTotal,
            name: `${billing.first_name} ${billing.last_name}`,
            email: billing.email,
            phone: billing.phone,
            address: billing.address_1,
          }
        );

        if (sslResponse.data?.GatewayPageURL) {
          window.location.href = sslResponse.data.GatewayPageURL;
        } else {
          console.log("SSL ERROR:", sslResponse.data);
          alert("SSL Payment initiation failed");
        }

        setLoading(false);
        return;
      }
      // --------------------------
      // --------------------------
      // --------------------------
      // bKash Payment Logic
      // --------------------------
      if (paymentMethod === "bkash") {
        setLoading(true);
        try {
          const orderResponse = await axios.post(
            `${API_URL}/wc/v3/orders`,
            {
              payment_method: "bkash-for-woocommerce", 
              payment_method_title: "bKash",
              set_paid: false,
              billing: {
                ...billing,
                last_name: "", 
              },
              shipping: billing,
              line_items: cartItems.map((item) => ({
                product_id: item.productId,
                variation_id: item.variationId || undefined,
                quantity: item.qty,
              })),
              shipping_lines: [
                {
                  method_id: deliveryMethod,
                  method_title: deliveryMethod === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka",
                  total: deliveryFee.toString(),
                },
              ],
              coupon_lines: discountAmount > 0 ? [{ code: promoCode }] : [],
            },
            {
              auth: {
                username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
                password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
              },
            }
          );

          const orderID = orderResponse.data.id;

          const bkashRes = await axios.post(
            "https://dev.toffpark.com/wp-json/bkash/v1/create-payment",
            {
              order_id: orderID,
            }
          );

          if (bkashRes.data?.status === "success" && bkashRes.data?.bkashURL) {
            window.location.href = bkashRes.data.bkashURL;
          } else {
            console.log("bKash Error Details:", bkashRes.data);
            alert("bKash Error: " + (bkashRes.data?.message || "Payment URL generation failed."));
          }
        } catch (error) {
          console.error("BKASH FULL ERROR:", error.response?.data || error.message);
          alert("System Error: bKash পেমেন্ট শুরু করা যাচ্ছে না। দয়া করে আবার চেষ্টা করুন।");
        }
        setLoading(false);
        return;
      }
      // --------------------------
      // COD / BANK TRANSFER
      // --------------------------
      const orderData = {
        payment_method: paymentMethod,
        payment_method_title:
          paymentMethod === "cod"
            ? "Cash on Delivery"
            : paymentMethod === "bkash"
            ? "bKash"
            : "Card Payment",
        set_paid: false,
        billing: {
          first_name: billing.first_name,
          last_name: "", // optional
          phone: billing.phone,
          address_1: billing.address_1,
          address_2: "",
          city: "",
          state: "",
          postcode: "",
          country: "",
        },
        shipping: {
          first_name: billing.first_name,
          last_name: "",
          address_1: billing.address_1,
          address_2: "",
          city: "",
          state: "",
          postcode: "",
          country: "",
        },
        customer_note: billing.order_note,
        line_items: cartItems.map((item) => ({
          product_id: item.productId,
          variation_id: item.variationId || undefined,
          quantity: item.qty,
        })),
        shipping_lines: [
          {
            method_id: deliveryMethod,
            method_title: deliveryMethod === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka",
            total: deliveryFee.toString(),
          },
        ],
        coupon_lines: discountAmount > 0 ? [{ code: promoCode }] : [],
        meta_data: [
          { key: "device_type", value: getTrackingData().deviceType },
          { key: "utm_source", value: getTrackingData().utmSource },
          { key: "utm_medium", value: getTrackingData().utmMedium },
          { key: "utm_campaign", value: getTrackingData().utmCampaign },
          { key: "page_views", value: getTrackingData().pageViews },
        ],
      };

      const response = await axios.post(`${API_URL}/wc/v3/orders`, orderData, {
        auth: {
          username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
          password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
        },
      });

      const orderID = response.data.id;
      setOrderId(orderID);

      clearCart();
      setShowThankYou(true);
    } catch (error) {
      console.error("ORDER ERROR:", error.response?.data || error.message);
      alert("Order failed. Check console for details.");
    }

    setLoading(false);
  };

  // Payment success query params handling
  useEffect(() => {
    if (processedRef.current) return; // prevent re-run

    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("payment");
    const order = params.get("order_id");

    if (paymentStatus === "success") {
      processedRef.current = true;
      setOrderId(order);
      setShowThankYou(true);
      clearCart();
      window.history.replaceState({}, document.title, "/checkout");
    }
    if (paymentStatus === "fail") {
      alert("Payment Failed");
      processedRef.current = true;
      window.history.replaceState({}, document.title, "/checkout");
    }
  }, [location.search, clearCart]);

  return (
    <div>
      {/* Header */}
      <div id="custom-header">
        <div className="custom-header-content">
          <div className="container">
            <div id="breadcrumb">
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

      {/* Content */}
      <div id="content" className="site-content default-full-width">
        <div className="container">
          <div className="inner-wrapper">
            <div id="primary" className="content-area">
              <main id="main" className="site-main">
                <div className="section-checkout">
                  <form className="checkout product-checkout" onSubmit={placeOrder}>
                    <div className="col2-set" id="customer_details">
                      <div className="col-1">
                        <h3>Billing Details</h3>
                        <div className="product-billing-fields_field-wrapper">
                          <div className="form-row">
                            <label>Name *</label>
                            <input
                              type="text"
                              name="first_name"
                              value={billing.first_name}
                              onChange={handleBillingChange}
                              required
                            />
                          </div>

                          <div className="form-row">
                            <label>Phone *</label>
                            <input
                              type="text"
                              name="phone"
                              value={billing.phone}
                              onChange={handleBillingChange}
                              required
                            />
                          </div>

                          <div className="form-row">
                            <label>Address *</label>
                            <input
                              type="text"
                              name="address_1"
                              value={billing.address_1}
                              onChange={handleBillingChange}
                              required
                            />
                          </div>

                          <div className="form-row">
                            <label>Order Note</label>
                            <textarea
                              name="order_note"
                              value={billing.order_note}
                              onChange={handleBillingChange}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Order Review & Payment */}
                      <div className="col-2">
                        <h3>Your Order</h3>
                        <table className="shop-table product-checkout-review-order-table">
                          <tbody>
                            {cartItems.map((item) => (
                              <tr key={item.productId}>
                                <td>{item.name} × {item.qty}</td>
                                <td>৳{formatPrice(item.price * item.qty)}</td>
                              </tr>
                            ))}
                            <tr><td>Cart Sub-total</td><td>৳{formatPrice(cartTotal)}</td></tr>
                            {discountAmount > 0 && <tr><td>Discount</td><td>-৳{formatPrice(discountAmount)}</td></tr>}
                            <tr><td>Delivery Charge</td><td>৳{formatPrice(deliveryFee)}</td></tr>
                            <tr><th>Order Total</th><th>৳{formatPrice(finalTotal)}</th></tr>
                          </tbody>
                        </table>

                        {/* Promo Code */}
                        <div className="form-row">
                          <input type="text" placeholder="Promo Code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                          <button type="button" onClick={applyPromoCode} disabled={promoLoading}>
                            {promoLoading ? "Applying..." : "Apply"}
                          </button>
                          {promoMessage && <p>{promoMessage}</p>}
                        </div>

                        {/* Delivery Method */}
                        <div className="product-checkout-payment">
                          <h3>Delivery Method</h3>
                          <ul>
                            <li>
                              <input type="radio" value="inside_dhaka" checked={deliveryMethod === "inside_dhaka"} onChange={(e) => setDeliveryMethod(e.target.value)} />
                              <label>Inside Dhaka (৳60)</label>
                            </li>
                            <li>
                              <input type="radio" value="outside_dhaka" checked={deliveryMethod === "outside_dhaka"} onChange={(e) => setDeliveryMethod(e.target.value)} />
                              <label>Outside Dhaka (৳120)</label>
                            </li>
                          </ul>
                        </div>

                        {/* Payment Method */}
                        <div id="payment" className="custom-payment">
                          <h3>Payment Method</h3>
                          <div className="payment-box">
                            {["cod", "bkash", "nagad", "sslcommerz"].map((method) => (
                              <label key={method} className={`payment-row ${paymentMethod === method ? "active" : ""}`}>
                                <div className="left">
                                  <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} />
                                  <span>{method === "cod" ? "Cash On Delivery" : method === "bkash" ? "bKash" : method === "nagad" ? "Nagad" : "Card Payment"}</span>
                                  {method === "bkash" && <img src="/images/bkash.png" alt="bkash" />}
                                  {method === "nagad" && <img src="/images/nagad.png" alt="nagad" />}
                                  {method === "sslcommerz" && <img src="/images/sslcz-verified.png" alt="sslcommerz" />}
                                </div>
                              </label>
                            ))}
                          </div>
                          {
                            paymentMethod === "bkash" && (
                              <div className="payment-desc">
                                Pay securely by bKash through M-Commerce.
                              </div>
                            )
                          }
                          {
                            paymentMethod === "sslcommerz" && (
                              <div className="payment-desc">
                                Pay securely by Credit/Debit card, Internet banking or Mobile banking through SSLCommerz.
                              </div>
                            )
                          }
                          {
                            paymentMethod === "nagad" && (
                              <div className="payment-desc">
                                Pay securely by Nagad through M-Commerce.
                              </div>
                            )
                          }
                          <div className="terms">
                            <label>
                              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                              By clicking Place Order, you agree to our delivery policy and returns & refunds policy.
                            </label>
                          </div>
                          <button type="submit" className="place-order-btn" disabled={loading}>
                            {loading ? "Placing Order..." : "Place Order"}
                          </button>
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
        onClose={() => setShowThankYou(false)}
      />
    </div>
  );
};

export default CheckoutPage;