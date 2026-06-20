import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import ThankYouPopup from "../ThankYouPopup/ThankYouPopup";
import config from "../../config";
import "./CheckoutPage.css";
import { Link, useLocation } from "react-router-dom";

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

const generateSHA256Hash = async (string) => {
  if (!string) return "";
  const msgBuffer = new TextEncoder().encode(string.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

const BD_CITIES = [
  "Dhaka", "Chattogram", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Barisal", "Rangpur", "Mymensingh",
  "Gazipur", "Narayanganj", "Cumilla", "Comilla", "Feni", "Noakhali", "Cox's Bazar", "Coxs Bazar", "Brahmanbaria", 
  "Chandpur", "Lakshmipur", "Laxmipur", "Rangamati", "Khagrachhari", "Bandarban", "Narsingdi", "Manikganj", 
  "Munshiganj", "Narail", "Gopalganj", "Shariatpur", "Madaripur", "Rajbari", "Faridpur", "Tangail", "Kishoreganj", 
  "Netrokona", "Sherpur", "Jamalpur", "Sunamganj", "Habiganj", "Moulvibazar", "Jessore", "Jashore", "Satkhira", 
  "Meherpur", "Chuadanga", "Kushtia", "Magura", "Bagerhat", "Jhenaidah", "Pirojpur", "Jhalokathi", "Jhalakati", 
  "Barguna", "Bhola", "Patuakhali", "Pabna", "Sirajganj", "Bogra", "Bogura", "Joypurhat", "Naogaon", "Natore", 
  "Chapai Nawabganj", "Chapainawabganj", "Nawabganj", "Gaibandha", "Dinajpur", "Panchagarh", "Thakurgaon", 
  "Nilphamari", "Kurigram", "Lalmonirhat", "Savar", "Uttara", "Mirpur", "Banani", "Gulshan"
];

const extractCityFromAddress = (address) => {
  if (!address) return "Dhaka";
  const cleanAddress = address.toLowerCase();
  
  for (const city of BD_CITIES) {
    if (cleanAddress.includes(city.toLowerCase())) {
      if (city.toLowerCase() === "chittagong") return "Chattogram";
      if (city.toLowerCase() === "comilla") return "Cumilla";
      if (city.toLowerCase() === "barisal") return "Barishal";
      if (city.toLowerCase() === "jessore") return "Jashore";
      if (city.toLowerCase() === "bogra") return "Bogura";
      return city; 
    }
  }
  return "Dhaka";
};

const CheckoutPage = () => {
  const API_URL = config.API_URL;
  const { cartItems, cartTotal, clearCart } = useCart();
  const location = useLocation();
  const processedRef = useRef(false);
  const checkoutTrackedRef = useRef(false); 
  const purchaseTrackedRef = useRef(false); 
  const paymentInfoTrackedRef = useRef({}); 

  const user = JSON.parse(localStorage.getItem("user")) || null;
  const currentCustomerId = user && user.id ? parseInt(user.id, 10) : 0;

  const [billing, setBilling] = useState({
    first_name: "", 
    address_1: "",
    phone: "",
    email: "",
    order_note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [deliveryMethod, setDeliveryMethod] = useState("inside_dhaka");
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // GA4/GTM: begin_checkout
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) return;
    if (checkoutTrackedRef.current) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
      event: "begin_checkout",
      ecommerce: {
        currency: "BDT",
        value: Number(cartTotal || 0),
        items: cartItems.map((item) => ({
          item_id: item.productId?.toString(),
          item_name: item.name,
          price: Number(item.price || 0),
          quantity: Number(item.qty || 1),
          item_variant: item.size || undefined,
        })),
      },
    });

    checkoutTrackedRef.current = true;
  }, [cartItems, cartTotal]);

  // GA4/GTM: add_payment_info
  useEffect(() => {
    if (cartItems.length > 0 && paymentMethod && !paymentInfoTrackedRef.current[paymentMethod]) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "add_payment_info",
        ecommerce: {
          currency: "BDT",
          value: parseFloat(finalTotal || 0),
          payment_type: paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment",
          items: cartItems.map((item) => ({
            item_id: item.productId?.toString(),
            item_name: item.name,
            price: parseFloat(item.price || 0),
            quantity: parseInt(item.qty || 1, 10),
            item_variant: item.size || undefined
          }))
        }
      });
      paymentInfoTrackedRef.current[paymentMethod] = true;
    }
  }, [paymentMethod, cartItems, finalTotal]);

  // 🎯 GA4/GTM & Facebook Pixel/CAPI: Purchase Event
  const trackPurchaseEvent = useCallback(async (orderId, totalValue, itemsList, couponUsed, extId, billingData) => {
    if (purchaseTrackedRef.current) return;

    let hashedEmail = "";
    let hashedPhone = "";
    let hashedFirstName = "";
    let hashedLastName = "";
    let hashedCity = "";
    let hashedCountry = "";
    let hashedCountryCode = "";

    if (billingData) {
      const fullName = (billingData.first_name || "").trim();
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const cityVal = billingData.city || "Dhaka";

      try {
        if (billingData.email) hashedEmail = await generateSHA256Hash(billingData.email);
        if (billingData.phone) hashedPhone = await generateSHA256Hash(billingData.phone);
        if (firstName) hashedFirstName = await generateSHA256Hash(firstName);
        if (lastName) hashedLastName = await generateSHA256Hash(lastName);
        if (cityVal) hashedCity = await generateSHA256Hash(cityVal);
        hashedCountry = await generateSHA256Hash("Bangladesh");
        hashedCountryCode = await generateSHA256Hash("BD");
      } catch (hashError) {
        console.error("Facebook tracking data hashing failed:", hashError);
      }
    }
    
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null }); 
    window.dataLayer.push({
      event: "purchase",
      customer_information: billingData ? {
        first_name: billingData.first_name?.split(" ")[0] || "",
        last_name: billingData.first_name?.split(" ").slice(1).join(" ") || "",
        phone: billingData.phone || "",
        address_1: billingData.address_1 || "",
        city: billingData.city || "Dhaka",
        country: "Bangladesh",
        country_code: "BD"
      } : undefined,

      user_data: {
        external_id: extId || undefined,
        em: hashedEmail || undefined,
        ph: hashedPhone || undefined,
        fn: hashedFirstName || undefined,
        ln: hashedLastName || undefined,
        ct: hashedCity || undefined,
        country: hashedCountry || undefined,
        country_code: hashedCountryCode || undefined
      },

      ecommerce: {
        transaction_id: orderId?.toString(),
        value: parseFloat(totalValue || 0),
        currency: "BDT",
        coupon: couponUsed || undefined,
        shipping: parseFloat(deliveryFee),
        items: itemsList.map((item) => ({
          item_id: item.productId?.toString() || item.product_id?.toString(),
          item_name: item.name || "Product", 
          price: parseFloat(item.price || 0),
          quantity: parseInt(item.qty || item.quantity || 1, 10),
          item_variant: item.size || undefined
        }))
      }
    });

    purchaseTrackedRef.current = true; 
  }, [deliveryFee]);

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

  const removePromoCode = () => {
    setPromoCode("");
    setDiscountAmount(0);
    setPromoMessage("");
  };

  // ==========================
  // PLACE ORDER
  // ==========================
  const placeOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert("Cart is empty or invalid product data");

    setLoading(true);

    const line_items = cartItems.map(item => ({
      product_id: item.productId,
      variation_id: item.variationId || undefined,
      quantity: item.qty,
    }));

    const orderCustomerId = currentCustomerId > 0 ? currentCustomerId : 0;

    const fullName = billing.first_name.trim();
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const detectedCity = extractCityFromAddress(billing.address_1);

    const cleanPhone = billing.phone ? billing.phone.trim() : "";
    const phoneSuffix = cleanPhone.slice(-2);
    const uniqueSuffix = Date.now().toString().slice(-2);

    let finalEmail = billing.email.trim();
    if (!finalEmail) {
      const cleanName = fullName.toLowerCase().replace(/[^a-z0-9]/g, "");
      finalEmail = cleanName 
        ? `${cleanName}_${phoneSuffix || uniqueSuffix}@gmail.com` 
        : `guest_${uniqueSuffix}@gmail.com`;
    }

    let hashedExternalId = "";
    try {
      hashedExternalId = await generateSHA256Hash(cleanPhone || `guest_${uniqueSuffix}`);
    } catch (hashError) {
      console.error("Hash generation failed, using fallback string", hashError);
      hashedExternalId = `fallback_${uniqueSuffix}_${phoneSuffix}`;
    }

    const customTrackingBilling = {
      first_name: fullName,
      phone: cleanPhone,
      email: finalEmail,
      address_1: billing.address_1,
      city: detectedCity
    };

    const formattedBilling = {
      first_name: firstName,
      last_name: lastName,
      company: "",
      address_1: billing.address_1,
      address_2: "",
      city: detectedCity, 
      state: detectedCity, 
      postcode: "",
      country: "BD",
      email: finalEmail, 
      phone: billing.phone
    };

    try {
      // --------------------------
      // 1. SSLCommerz Payment
      // --------------------------
      if (paymentMethod === "sslcommerz") {
        const orderResponse = await axios.post(
          `${API_URL}/wc/v3/orders`,
          {
            payment_method: "sslcommerz",
            payment_method_title: "SSLCommerz",
            set_paid: false,
            customer_id: orderCustomerId,
            billing: formattedBilling,   
            shipping: formattedBilling,  
            line_items,
            shipping_lines: [
              {
                method_id: deliveryMethod,
                method_title: deliveryMethod === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka",
                total: deliveryFee.toString(),
              },
            ],
            coupon_lines: discountAmount > 0 ? [{ code: promoCode }] : [],
            meta_data: [
              { key: "external_id", value: hashedExternalId }
            ]
          },
          {
            auth: {
              username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
              password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
            },
          }
        );

        const orderID = orderResponse.data.id;

        sessionStorage.setItem("pending_pur_items", JSON.stringify(cartItems));
        sessionStorage.setItem("pending_pur_total", finalTotal.toString());
        sessionStorage.setItem("pending_pur_coupon", discountAmount > 0 ? promoCode : "");
        sessionStorage.setItem("pending_pur_ext_id", hashedExternalId); 
        sessionStorage.setItem("pending_pur_billing", JSON.stringify(customTrackingBilling)); 

        const sslResponse = await axios.post(
          "https://backend.orlass.com/wp-json/sslcommerz/v1/create-payment",
          {
            order_id: orderID,
            amount: finalTotal,
            name: fullName, 
            email: finalEmail, 
            phone: billing.phone,
            address: billing.address_1,
          }
        );

        if (sslResponse.data?.GatewayPageURL) {
          window.location.href = sslResponse.data.GatewayPageURL;
        } else {
          alert("SSL Payment initiation failed");
        }

        setLoading(false);
        return;
      }
      
      // --------------------------
      // 3. COD (Cash on Delivery)
      // --------------------------
      if (paymentMethod === "cod") {
        const orderData = {
          payment_method: "cod",
          payment_method_title: "Cash on Delivery",
          set_paid: false,
          customer_id: orderCustomerId,
          billing: formattedBilling,   
          shipping: formattedBilling,  
          customer_note: billing.order_note,
          line_items,
          shipping_lines: [
            {
              key: "shipping_method_line",
              method_id: deliveryMethod,
              method_title: deliveryMethod === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka",
              total: deliveryFee.toString(),
            },
          ],
          coupon_lines: discountAmount > 0 ? [{ code: promoCode }] : [],
          meta_data: [
            { key: "external_id", value: hashedExternalId }, 
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

        await trackPurchaseEvent(
          response.data.id, 
          finalTotal, 
          cartItems, 
          discountAmount > 0 ? promoCode : "", 
          hashedExternalId,
          customTrackingBilling
        );

        setOrderId(response.data.id);
        clearCart();
        setShowThankYou(true);
      }
    } catch (error) {
      console.error("ORDER ERROR:", error.response?.data || error.message);
      alert("Order failed. Check console for details.");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (processedRef.current) return;

    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("payment");
    const order = params.get("order_id");

    if (paymentStatus === "success" && order) {
      processedRef.current = true;
      setOrderId(order);
      setShowThankYou(true);

      const savedItems = JSON.parse(sessionStorage.getItem("pending_pur_items")) || [];
      const savedTotal = sessionStorage.getItem("pending_pur_total") || cartTotal;
      const savedCoupon = sessionStorage.getItem("pending_pur_coupon") || "";
      const savedExtId = sessionStorage.getItem("pending_pur_ext_id") || ""; 
      
      // সেশন থেকে পেমেন্ট করা ইউজারের কাস্টমার ট্র্যাকিং ডেটা রিকভারি
      const savedBilling = JSON.parse(sessionStorage.getItem("pending_pur_billing")) || {
        first_name: "Guest Customer",
        phone: "",
        email: "",
        address_1: "",
        city: "Dhaka"
      };

      // ✅ SSLCommerz এ পেমেন্ট সাকসেসফুল হয়ে পেজে ব্যাক করলে পারচেজ ইভেন্ট ফায়ার হবে
      trackPurchaseEvent(order, savedTotal, savedItems, savedCoupon, savedExtId, savedBilling);

      // ক্লিনআপ সেশন স্টোরেজ
      sessionStorage.removeItem("pending_pur_items");
      sessionStorage.removeItem("pending_pur_total");
      sessionStorage.removeItem("pending_pur_coupon");
      sessionStorage.removeItem("pending_pur_ext_id");
      sessionStorage.removeItem("pending_pur_billing");

      clearCart();
      // URL থেকে কুয়েরি প্যারামিটার ক্লিন করা যাতে রিফ্রেশ দিলে ডুপ্লিকেট হিট না হয়
      window.history.replaceState({}, document.title, "/checkout");
    }
    
    if (paymentStatus === "fail") {
      alert("Payment Failed");
      processedRef.current = true;
      window.history.replaceState({}, document.title, "/checkout");
    }
  }, [location.search, clearCart, cartTotal, trackPurchaseEvent]);

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
                      <div className="col-1 checkout-billing">
                        <div className="product-billing-fields_field-wrapper">
                          <h3>Contact & Shipping Details</h3>
                          <div className="form-row">
                            <label>Full Name *</label>
                            <input
                              type="text"
                              name="first_name"
                              value={billing.first_name}
                              placeholder="Your full name"
                              onChange={handleBillingChange}
                              required
                            />
                          </div>
                          <div className="form-row">
                            <label>Phone Number *</label>
                            <input
                              type="text"
                              name="phone"
                              placeholder="Your phone number"
                              value={billing.phone}
                              onChange={handleBillingChange}
                              required
                            />
                          </div>

                          <div className="form-row">
                            <label>Email Address (optional)</label>
                            <input
                              type="email"
                              name="email"
                              value={billing.email}
                              placeholder="Your email address"
                              onChange={handleBillingChange}
                            />
                          </div>

                          <div className="form-row">
                            <label>Full Delivery Address*</label>
                            <input
                              type="text"
                              name="address_1"
                              value={billing.address_1}
                              placeholder="House/Flat, Road, Area, Thana/Upazila, District/City"
                              onChange={handleBillingChange}
                              required
                            />
                          </div>
                          <div className="form-row">
                            <label>Order Note (optional)</label>
                            <textarea
                              name="order_note"
                              value={billing.order_note}
                              placeholder="Special notes for order & delivery"
                              onChange={handleBillingChange}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Order Review & Payment */}
                      <div className="col-2 checkout-review">
                        <div className="order-summary-card">
                          <div className="summary-header">
                            <h3>Order Summary</h3>
                            <Link to="/cart" className="mobile-edit-link">Edit</Link>
                          </div>

                          <div className="order-items">
                            {cartItems.map((item) => (
                              <div key={item.productId} className="item-row">
                                <div className="item-thumb">
                                  <img src={item.image} alt={item.name} />
                                </div>
                                <div className="item-info">
                                  <h4>{item.name}</h4>
                                  <p>Size: {item.size} • Qty: {item.qty}</p>
                                </div>
                                <div className="item-pricing">
                                  <span className="new-price">৳{(item.price * item.qty).toFixed(0)}</span>
                                  <del className="old-price">৳{(item.regularPrice * item.qty).toFixed(0)}</del>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pricing-details">
                            <div className="calc-row">
                              <span>Subtotal</span>
                              <span>৳{cartTotal.toFixed(0)}</span>
                            </div>
                            
                            {discountAmount > 0 && (
                              <div className="calc-row discount-row">
                                <span>Discount ({promoCode})</span>
                                <span className="discount-text">- ৳{discountAmount.toFixed(0)}</span>
                              </div>
                            )}

                            <div className="calc-row">
                              <span>Shipping ({deliveryMethod === "inside_dhaka" ? "Dhaka" : "Outside Dhaka"})</span>
                              <span>৳{deliveryFee.toFixed(0)}</span>
                            </div>
                            <div className="total-row">
                              <strong>Total</strong>
                              <strong>৳{finalTotal.toFixed(0)}</strong>
                            </div>
                          </div>

                          {/* Promo Section */}
                          <div className="promo-section">
                            <input 
                              type="text" 
                              placeholder="Enter coupon code" 
                              value={promoCode} 
                              disabled={discountAmount > 0} 
                              onChange={(e) => setPromoCode(e.target.value)} 
                            />
                            {discountAmount > 0 ? (
                              <button type="button" className="remove-promo-btn" onClick={removePromoCode}>Remove</button>
                            ) : (
                              <button type="button" onClick={applyPromoCode} disabled={promoLoading}>
                                {promoLoading ? "..." : "Apply"}
                              </button>
                            )}
                          </div>
                          {promoMessage && (
                            <p className={`promo-note ${discountAmount > 0 ? "success-msg" : "error-msg"}`}>
                              {promoMessage}
                            </p>
                          )}
                        </div>
                        
                        {/* Delivery Method Section */}
                        <div className="payment-method-section">
                          <h3>Delivery Area</h3>
                          <div className="payment-options">
                            <label className={`payment-card ${deliveryMethod === 'inside_dhaka' ? 'selected' : ''}`}>
                              <input 
                                type="radio" 
                                name="delivery_method"
                                value="inside_dhaka" 
                                checked={deliveryMethod === 'inside_dhaka'} 
                                onChange={(e) => setDeliveryMethod(e.target.value)} 
                              />
                              <div className="payment-content">
                                <div className="payment-main">
                                  <span className="radio-circle"></span>
                                  <div className="text-group">
                                    <span className="method-title">Inside Dhaka City</span>
                                  </div>
                                </div>
                                <span className="price-tag">Tk 60</span>
                              </div>
                            </label>

                            <label className={`payment-card ${deliveryMethod === 'outside_dhaka' ? 'selected' : ''}`}>
                              <input 
                                type="radio" 
                                name="delivery_method"
                                value="outside_dhaka" 
                                checked={deliveryMethod === 'outside_dhaka'} 
                                onChange={(e) => setDeliveryMethod(e.target.value)} 
                              />
                              <div className="payment-content">
                                <div className="payment-main">
                                  <span className="radio-circle"></span>
                                  <div className="text-group">
                                    <span className="method-title">Outside Dhaka City</span>
                                  </div>
                                </div>
                                <span className="price-tag">Tk 120</span>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Payment Method Section */}
                        <div className="payment-method-section">
                          <h3>Payment Method</h3>
                          <div className="payment-options">
                            <label className={`payment-card ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                              <input type="radio" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                              <div className="payment-content">
                                <div className="payment-main">
                                  <span className="radio-circle"></span>
                                  <div className="text-group">
                                    <span className="method-title">Cash on Delivery</span>
                                    <span className="method-subtitle">Pay when you receive your order</span>
                                  </div>
                                </div>
                              </div>
                            </label>
                            
                            <label className={`payment-card ${paymentMethod === 'sslcommerz' ? 'selected' : ''}`}>
                              <input type="radio" value="sslcommerz" checked={paymentMethod === 'sslcommerz'} onChange={(e) => setPaymentMethod(e.target.value)} />
                              <div className="payment-content">
                                <div className="payment-main">
                                  <span className="radio-circle"></span>
                                  <div className="text-group">
                                    <span className="method-title">Online Payment</span>
                                    <span className="method-subtitle">Visa, Mastercard, Amex, bkash, Nagad</span>
                                  </div>
                                </div>
                                <img src="/images/sslcz-verified.png" alt="SSLCommerz" className="provider-logo" />
                              </div>
                            </label>
                          </div>
                        </div>
                        
                        <div className="checkout-footer">
                          <div className="terms-container">
                            <div className="terms-wrapper">
                              <label htmlFor="terms" className="terms-label">
                                By clicking Confirm Order, you agree to our <Link to="/delivery-policy" className="link">delivery policy</Link> and <Link to="/returns-refunds" className="link">returns & refunds policy</Link>.
                              </label>
                            </div>
                          </div>
                          <button type="submit" className="confirm-btn" disabled={loading}>
                            {loading ? "Processing..." : `Confirm Order - ৳${finalTotal}`}
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