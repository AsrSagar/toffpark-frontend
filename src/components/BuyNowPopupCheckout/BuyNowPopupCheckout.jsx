import React, { useState } from "react";
import axios from "axios";
import ThankYouPopup from "../../Pages/ThankYouPopup/ThankYouPopup";
import "./BuyNowPopupCheckout.css";
import { Link } from "react-router-dom";

// 🛠️ Web Crypto API ব্যবহার করে SHA-256 হ্যাশ জেনারেট করার হেল্পার ফাংশন
const generateSHA256Hash = async (string) => {
  const msgBuffer = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

// 🛠️ বাংলাদেশর ৬৪টি জেলা ও প্রধান শহরের ডিকশনারি (City Extract করার জন্য)
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

const BuyNowPopupCheckout = ({
  product,
  selectedVariation,
  API_URL,
  fbtProducts = [],
  fbtSelected = {},
  fbtSelectedSize = {}
}) => {
  const [showModal, setShowModal] = useState(false);
  const [qty] = useState(product.qty || 1);

  // FBT products quantity state
  const [fbtQtys] = useState(
    fbtProducts.reduce((acc, p) => {
      acc[p.id] = 1;
      return acc;
    }, {})
  );

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const [hasBegunCheckout, setHasBegunCheckout] = useState(false);
  const [hasAddedPaymentInfo, setHasAddedPaymentInfo] = useState(false);

  const [billing, setBilling] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  const [shipping, setShipping] = useState({
    method: "inside_dhaka",
    cost: 80,
  });

  const shippingRates = {
    inside_dhaka: 80,
    outside_dhaka: 150,
  };

  const finalPrice = selectedVariation?.price ? Number(selectedVariation.price) : product.price;
  const checkprice = (selectedVariation?.prices?.price || 0) / 100 || product.price;
  const regularPrice = selectedVariation?.regular_price ? Number(selectedVariation.regular_price) : product.regular_price;
  

  const subtotal =
    (Number(finalPrice) || checkprice) * qty +
    fbtProducts.reduce((acc, p) => {
      if (fbtSelected[p.id]) {
        return acc + (p.price || 0) * (fbtQtys[p.id] || 1);
      }
      return acc;
    }, 0);

  const total = subtotal - discountAmount + shipping.cost;

  const handleBillingChange = (e) => {
    setBilling({ ...billing, [e.target.name]: e.target.value });

    if (!hasBegunCheckout) {
      window.dataLayer = window.dataLayer || [];

      const mainProduct = selectedVariation || product;

      const items = [
        {
          item_id: product.id.toString(),
          item_name: product.name,
          item_category: product.categories?.[0]?.name || "",
          item_variant: size || undefined,
          price: parseFloat(mainProduct.price || product.price || 0),
          quantity: qty || 1,
        },
      ];

      window.dataLayer.push({
        ecommerce: null,
      });

      window.dataLayer.push({
        event: "begin_checkout",
        ecommerce: {
          currency: "BDT",
          value: parseFloat(total.toFixed(2)),
          items: items,
        },
      });

      setHasBegunCheckout(true);
    }
  };

  const handleShippingChange = (e) =>
    setShipping({ method: e.target.value, cost: shippingRates[e.target.value] });

  const variationId = selectedVariation?.id || null;
  const size =
    selectedVariation?.attributes?.find(
      (attr) =>
        attr.name.toLowerCase() === "size" || attr.slug === "pa_size"
    )?.option || null;

  const getCartItemsForTracking = () => {
    const items = [];
    const mainProduct = selectedVariation || product;

    items.push({
      item_id: mainProduct.id.toString(),
      item_name: product.name,
      price: parseFloat(mainProduct.price || product.price || 0),
      quantity: qty,
      item_variant: size || undefined
    });

    fbtProducts.forEach((p) => {
      if (fbtSelected[p.id]) {
        items.push({
          item_id: p.id.toString(),
          item_name: p.name,
          price: parseFloat(p.price || 0),
          quantity: fbtQtys[p.id] || 1,
          item_variant: fbtSelectedSize[p.id] || undefined
        });
      }
    });

    return items;
  };

  const handlePaymentMethodChange = (e) => {
    const selectedMethod = e.target.value;
    setPaymentMethod(selectedMethod);

    if (selectedMethod !== "cod" && !hasAddedPaymentInfo) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "add_payment_info",
        ecommerce: {
          items: getCartItemsForTracking()
        },
        value: parseFloat(total.toFixed(2)),
        currency: "BDT"
      });
      setHasAddedPaymentInfo(true); 
    }
  };

  const handleBuyNowClick = async () => {
    if (!product || product.stock_status === "outofstock") {
      alert("Product is currently out of stock.");
      return;
    }

    if (product.type === "variable" && !selectedVariation) {
      alert("Please select a size before continuing.");
      return;
    }

    const mainProduct = selectedVariation || product;
    setLoading(true);

    try {
      const dataLayerItems = [];

      dataLayerItems.push({
        item_id: product.id.toString(),
        item_name: product.name,
        item_category: product.categories?.[0]?.name || "",
        item_variant: size || undefined,
        price: parseFloat(mainProduct.price || product.price || 0),
        quantity: qty,
      });

      for (const p of fbtProducts) {
        if (!fbtSelected[p.id]) continue;

        if (p.type !== "variable") {
          dataLayerItems.push({
            item_id: p.id.toString(),
            item_name: p.name,
            item_category: p.categories?.[0]?.name || "",
            price: parseFloat(p.price || 0),
            quantity: fbtQtys[p.id] || 1,
          });
          continue;
        }

        const selectedSize = fbtSelectedSize[p.id];

        if (!selectedSize) {
          alert(`Please select size for ${p.name}`);
          setLoading(false);
          return;
        }

        let cleanBaseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
        if (cleanBaseUrl.endsWith("/wp-json")) {
          cleanBaseUrl = cleanBaseUrl.slice(0, -8);
        }

        const variationRes = await axios.get(
          `${cleanBaseUrl}/wp-json/wc/v3/products/${p.id}/variations`,
          {
            auth: {
              username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
              password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
            },
          }
        );

        const matchedVariation = variationRes.data.find((v) =>
          v.attributes.some((attr) => attr.option.toLowerCase() === selectedSize.toLowerCase())
        );

        if (!matchedVariation) {
          alert(`Selected size not available for ${p.name}`);
          setLoading(false);
          return;
        }

        dataLayerItems.push({
          item_id: p.id.toString(),
          item_name: p.name,
          item_category: p.categories?.[0]?.name || "",
          item_variant: selectedSize,
          price: parseFloat(matchedVariation.price || p.price || 0),
          quantity: fbtQtys[p.id] || 1,
        });
      }

      const totalValue = dataLayerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({
        event: "begin_checkout",
        ecommerce: {
          currency: "BDT",
          value: totalValue,
          items: dataLayerItems,
        },
      });

      setShowModal(true);
    } catch (error) {
      console.error("Buy now tracking error:", error);
      alert("Something went wrong while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode) return;
    setPromoLoading(true);
    setPromoMessage("");

    try {
      let cleanBaseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      if (cleanBaseUrl.endsWith('/wp-json')) {
        cleanBaseUrl = cleanBaseUrl.slice(0, -8);
      }

      const res = await axios.get(`${cleanBaseUrl}/wp-json/wc/v3/coupons?code=${promoCode}`, {
        auth: {
          username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
          password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
        },
      });

      if (res.data.length > 0) {
        const coupon = res.data[0];
        let discount = 0;

        if (coupon.discount_type === "percent") {
          discount = (subtotal * parseFloat(coupon.amount)) / 100;
          setPromoMessage(`Promo code applied! ${coupon.amount}% discount: ৳${discount.toFixed(2)}`);
        } else if (coupon.discount_type === "fixed_cart") {
          discount = parseFloat(coupon.amount);
          setPromoMessage(`Promo code applied! Fixed discount: ৳${discount.toFixed(2)}`);
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

  const clearPromoCode = () => {
    setPromoCode("");
    setDiscountAmount(0);
    setPromoMessage("");
  };

  // ==========================
  // PLACE ORDER
  // ==========================
  const placeOrder = async () => {
    if (!billing.name || !billing.phone || !billing.address) {
      alert("Please fill Name, Phone, and Address!");
      return;
    }
    setLoading(true);
    setOrderStatus("");

    let cleanBaseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    if (cleanBaseUrl.endsWith('/wp-json')) {
      cleanBaseUrl = cleanBaseUrl.slice(0, -8);
    }

    try {
      const lineItems = [
        variationId ? { product_id: product.id, variation_id: variationId, quantity: qty } : { product_id: product.id, quantity: qty }
      ];

      for (const p of fbtProducts) {
        if (!fbtSelected[p.id]) continue;

        if (p.type !== "variable") {
          lineItems.push({ product_id: p.id, quantity: fbtQtys[p.id] || 1 });
          continue;
        }

        const selectedSize = fbtSelectedSize[p.id];
        if (!selectedSize) {
          alert(`Please select size for ${p.name}`);
          setLoading(false);
          return;
        }

        const variationRes = await axios.get(`${cleanBaseUrl}/wp-json/wc/v3/products/${p.id}/variations`, {
          auth: {
            username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
            password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
          },
        });

        const matchedVariation = variationRes.data.find((v) =>
          v.attributes.some((attr) => attr.option.toLowerCase() === selectedSize.toLowerCase())
        );

        if (!matchedVariation) {
          alert(`Selected size not available for ${p.name}`);
          setLoading(false);
          return;
        }

        lineItems.push({ product_id: p.id, variation_id: matchedVariation.id, quantity: fbtQtys[p.id] || 1 });
      }

      // 🛠️ রিকোয়ারমেন্ট ১: ইমেইল অটো জেনারেশন লজিক
      const cleanPhone = billing.phone ? billing.phone.trim() : "";
      const phoneSuffix = cleanPhone.slice(-4);
      const uniqueSuffix = Date.now().toString().slice(-4);
      let finalEmail = billing.email ? billing.email.trim() : "";
      
      if (!finalEmail) {
        const cleanName = billing.name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
        finalEmail = cleanName 
          ? `${cleanName}_${phoneSuffix || uniqueSuffix}@temporary.com` 
          : `guest_${uniqueSuffix}@temporary.com`;
      }

      // 🛠️ রিকোয়ারমেন্ট ২: Full Name থেকে First & Last Name স্প্লিট করা
      const fullName = billing.name.trim();
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // 🛠️ রিকোয়ারমেন্ট ৩: Full Address থেকে City এক্সট্র্যাক্ট করা
      const detectedCity = extractCityFromAddress(billing.address);

      // 🛠️ রিকোয়ারমেন্ট ৪: সব ডেটা কম্বাইন করে SHA-256 Hash external_id জেনারেট করা
      const rawCombineString = `${fullName.toLowerCase()}_${cleanPhone}_${finalEmail}`;
      let hashedExternalId = "";
      try {
        hashedExternalId = await generateSHA256Hash(rawCombineString);
      } catch (hashError) {
        console.error("Hash generation failed, fallback string used", hashError);
        hashedExternalId = `fallback_${uniqueSuffix}_${phoneSuffix}`;
      }

      // WooCommerce Billing ও Shipping অবজেক্ট ফরমেটিং
      const formattedBilling = {
        first_name: firstName,
        last_name: lastName,
        phone: billing.phone,
        email: finalEmail,
        address_1: billing.address,
        city: detectedCity,
        state: detectedCity,
        country: "BD"
      };

      const orderData = {
        payment_method: paymentMethod,
        payment_method_title: paymentMethod === "cod" ? "Cash on Delivery" : "Card/Online Payment (SSLCommerz)",
        set_paid: false,
        billing: formattedBilling,
        shipping: formattedBilling,
        line_items: lineItems,
        shipping_lines: [
          {
            method_id: "flat_rate",
            method_title: shipping.method === "inside_dhaka" ? "Inside Dhaka City" : "Outside Dhaka City",
            total: shipping.cost.toString(),
          },
        ],
        coupon_lines: discountAmount > 0 ? [{ code: promoCode }] : [],
        customer_note: billing.note,
        meta_data: [
          { key: "external_id", value: hashedExternalId } // 👈 ডেটাবেজে সাবমিট হবে
        ]
      };

      const response = await axios.post(`${cleanBaseUrl}/wp-json/wc/v3/orders`, orderData, {
        auth: {
          username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
          password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
        },
      });

      const order = response.data;

      // GTM Purchase Event এ হ্যাশড আইডি পাস করা
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "purchase",
        user_data: {
          external_id: hashedExternalId
        },
        transaction_id: order.id.toString(),
        value: parseFloat(order.total),      
        currency: "BDT"
      });

      if (paymentMethod === "cod") {
        setOrderId(order.id);
        setShowThankYou(true);
        setShowModal(false);
        setOrderStatus(`Order placed successfully! Order ID: ${order.id}`);
      } else if (paymentMethod === "sslcommerz") {
        setOrderStatus("Redirecting to SSLCommerz Payment Gateway...");
        
        // SSL সাকসেস ট্র্যাকিং এর জন্য sessionStorage-এ ব্যাকআপ রাখা
        sessionStorage.setItem("pending_pur_ext_id", hashedExternalId);

        const sslPayload = {
          order_id: parseInt(order.id),
          amount: parseFloat(order.total),
          name: fullName,
          email: finalEmail,
          phone: billing.phone,
          address: billing.address
        };

        const sslResponse = await axios.post(
          `${cleanBaseUrl}/wp-json/sslcommerz/v1/create-payment`, 
          sslPayload,
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        
        if (sslResponse.data && sslResponse.data.GatewayPageURL) {
          window.location.href = sslResponse.data.GatewayPageURL;
        } else {
          alert("Failed to initiate SSLCommerz payment. Please try again or choose Cash on Delivery.");
        }
      }

    } catch (error) {
      console.error("Order processing full error:", error.response?.data || error.message);
      alert("Failed to process your order request.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setHasBegunCheckout(false); 
    setHasAddedPaymentInfo(false);
  };

  return (
    <>
      <button 
        type="button" 
        className="custom-button button-small single-buy-now-btn" 
        onClick={handleBuyNowClick}
        disabled={loading && !showModal}
      >
        {loading && !showModal ? "Processing..." : "Buy Now"}
      </button>

      {showModal && (
        <div className="fixed-place-order">
          <div className="popup-checkout-content">
            <div className="popup-form">
              <span className="popup-close" onClick={handleCloseModal}>×</span>
              <div className="popt-title">
                <h3>Contact & Shipping Details:</h3>
              </div>
              <div className="form-control">
                <label>Full Name *</label>
                <div className="input-wrapper">
                  <input type="text" name="name" placeholder="Your full name" value={billing.name} onChange={handleBillingChange} />
                </div>
              </div>
              <div className="form-control">
                <label>Phone Number *</label>
                <div className="input-wrapper">
                  <input type="tel" name="phone" placeholder="Your phone number" value={billing.phone} onChange={handleBillingChange} />
                </div>
              </div>
              <div className="form-control">
                <label>Email Address (optional)</label>
                <div className="input-wrapper">
                  <input type="email" name="email" placeholder="Your email address" value={billing.email || ""} onChange={handleBillingChange} />
                </div>
              </div>
              <div className="form-control">
                <label>Full Delivery Address*</label>
                <div className="input-wrapper">
                  <input type="text" name="address" placeholder="House/Flat, Road, Area, Thana/Upazila, District" value={billing.address} onChange={handleBillingChange} />
                </div>
              </div>
              <div className="form-control">
                <label>Order Note (optional)</label>
                <div className="input-wrapper">
                  <input type="text" name="note" placeholder="Special notes for order & delivery" value={billing.note} onChange={handleBillingChange} />
                </div>
              </div>

              {/* Cart Table */}
              <table className="popup-cart-table">
                <thead>
                  <tr>
                    <th style={{ width: "20%" }}>Image</th>
                    <th style={{ width: "45%" }}>Product</th>
                    <th style={{ width: "15%" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><img src={product.images?.[0]?.src} alt={product.name} width="70" /></td>
                    <td>{product.name}{size && ` (Size: ${size})`} × {qty}</td>
                    <td>
                      ৳{(Number(finalPrice) || checkprice) * qty} 
                      {regularPrice > (Number(finalPrice) || checkprice) && (
                        <del style={{ marginLeft: '8px' }}>৳{regularPrice * qty}</del>
                      )}
                    </td>
                  </tr>
                  {fbtProducts.map((p) => {
                    if (!fbtSelected[p.id]) return null;
                    return (
                      <tr key={p.id}>
                        <td><img src={p.images?.[0]?.src} width="70" alt={p.name} /></td>
                        <td>{p.name}{fbtSelectedSize[p.id] && ` (Size: ${fbtSelectedSize[p.id]})`}</td>
                        <td>৳{(p.price || 0) * fbtQtys[p.id]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="promo-code">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />

                <button
                  type="button"
                  onClick={applyPromoCode}
                  disabled={promoLoading}
                >
                  {promoLoading ? "Applying..." : "Apply"}
                </button>

                {discountAmount > 0 && (
                  <button
                    type="button"
                    className="clear-promo-btn"
                    onClick={clearPromoCode}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="promo-message">
                {promoMessage && <p>{promoMessage}</p>}
              </div>
              <div className="shipping-methods">
                <h3>Delivery Area</h3>
                <label className={shipping.method === "inside_dhaka" ? "active" : ""}>
                  <input 
                    type="radio" 
                    name="shipping" 
                    value="inside_dhaka" 
                    checked={shipping.method === "inside_dhaka"} 
                    onChange={handleShippingChange} 
                  />
                  <span>Inside Dhaka City – ৳80</span>
                </label>
                
                <label className={shipping.method === "outside_dhaka" ? "active" : ""}>
                  <input 
                    type="radio" 
                    name="shipping" 
                    value="outside_dhaka" 
                    checked={shipping.method === "outside_dhaka"} 
                    onChange={handleShippingChange} 
                  />
                  <span>Outside Dhaka City – ৳150</span>
                </label>
              </div>

              {/* Order Summary */}
              <div className="checkout-order-review">
                <h3>Order Summary</h3>
                <table className="shop_table">
                  <tbody>
                    {discountAmount > 0 && (
                      <tr>
                        <td>Discount</td>
                        <td>-৳{discountAmount.toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr><th>Subtotal</th><td>৳{subtotal}</td></tr>
                    <tr><th>Shipping</th><td>৳{shipping.cost}</td></tr>
                    <tr className="order-total"><th>Total</th><td><strong>৳{total.toFixed(2)}</strong></td></tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment Method */}
              <div className="payment">
                <h3>Payment Method</h3>
                {["cod", "sslcommerz"].map((method) => (
                  <label key={method} className={paymentMethod === method ? "active" : ""}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value={method} 
                      checked={paymentMethod === method} 
                      onChange={handlePaymentMethodChange}
                    />
                    <span>
                      {method === "cod" ? "Cash On Delivery" : "Online Payment ( Bkash, Nagad etc. )"}
                    </span>
                    {method === "sslcommerz" && <img src="/images/sslcz-verified.png" alt="sslcommerz" />}
                  </label>
                ))}
              </div>
              <div className="terms-container">
                <div className="terms-wrapper">
                  <label htmlFor="terms" className="terms-label">
                    By clicking Confirm Order, you agree to our <Link to="/delivery-policy" className="link">delivery policy</Link> and <Link to="/returns-refunds" className="link">returns & refunds policy</Link>.
                  </label>
                </div>
              </div>
              <button type="button" className="place-order-btn" onClick={placeOrder} disabled={loading}>
                {loading && showModal ? (orderStatus ? orderStatus : "Placing Order...") : "Confirm Order - ৳" + total.toFixed(0)}
              </button>
              {orderStatus && <p className="payment-status-msg">{orderStatus}</p>}
            </div>
          </div>
        </div>
      )}

      <ThankYouPopup
        show={showThankYou}
        orderId={orderId}
        onClose={() => {
          setShowThankYou(false);
          window.location.href = "/";
        }}
      />
    </>
  );
};

export default BuyNowPopupCheckout;