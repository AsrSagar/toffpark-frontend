import React, { useState } from "react";
import axios from "axios";
import ThankYouPopup from "../../Pages/ThankYouPopup/ThankYouPopup";

const BuyNowPopupCheckout = ({ product, API_URL, consumerKey, consumerSecret }) => {
  const [showModal, setShowModal] = useState(false);
  const [qty, setQty] = useState(product.qty || 1);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [checkoutInitiated, setCheckoutInitiated] = useState(false);

  const handleBuyNowClick = () => {
    // ===== Facebook Pixel AddToCart Tracking =====
    if (window.fbq) {
      window.fbq("track", "AddToCart", {
        value: product.price,
        currency: "BDT",
        content_ids: [product.id],
        content_name: product.name,
        content_type: "product",
      });

      console.log("FB Pixel AddToCart event sent:", product.name);
    }

    setShowModal(true);
  };

  const [billing, setBilling] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const [shipping, setShipping] = useState({
    method: "inside_dhaka",
    cost: 70,
  });



  const shippingRates = {
    inside_dhaka: 70,
    outside_dhaka: 120,
  };

  const increaseQty = () => setQty(qty + 1);
  const decreaseQty = () => setQty(qty > 1 ? qty - 1 : 1);

  const handleBillingChange = (e) => {
    setBilling({ ...billing, [e.target.name]: e.target.value });

    // ===== Facebook Pixel InitiateCheckout Tracking =====
    if (!checkoutInitiated && window.fbq) {
      window.fbq("track", "InitiateCheckout", {
        value: subtotal,
        currency: "BDT",
        content_ids: [product.id],
        content_name: product.name,
        content_type: "product",
      });

      console.log("FB Pixel InitiateCheckout event sent:", product.name);
      setCheckoutInitiated(true); // so it fires only once
    }
  };

  const handleShippingChange = (e) => {
    const method = e.target.value;
    setShipping({ method, cost: shippingRates[method] });
  };

  const subtotal = product.price * qty;
  const total = subtotal - discountAmount + shipping.cost;

  // Apply Promo Code
  const applyPromoCode = async () => {
    if (!promoCode) return;

    setPromoLoading(true);
    setPromoMessage("");

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
          const discount = (subtotal * parseFloat(coupon.amount)) / 100; // only product total
          setDiscountAmount(discount);
          setPromoMessage(`Promo code applied! ${coupon.amount}% discount: ৳${discount.toFixed(2)}`);
        } else if (coupon.discount_type === "fixed_cart") {
          const discount = parseFloat(coupon.amount);
          setDiscountAmount(discount);
          setPromoMessage(`Promo code applied! Fixed discount: ৳${discount.toFixed(2)}`);
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

  const placeOrder = async () => {
    if (!billing.name || !billing.phone || !billing.address) {
      alert("Please fill Name, Phone, and Address!");
      return;
    }

    setLoading(true);
    setOrderStatus("");

    const orderData = {
      payment_method: "cod",
      payment_method_title: "Cash on Delivery",
      set_paid: false,
      billing: {
        first_name: billing.name,
        phone: billing.phone,
        address_1: billing.address,
      },
      shipping: {
        first_name: billing.name,
        address_1: billing.address,
      },
      line_items: [
        {
          product_id: product.id,
          quantity: qty,
        },
      ],
      shipping_lines: [
        {
          method_id: "flat_rate",
          method_title: shipping.method === "inside_dhaka" ? "ঢাকার ভিতরে" : "ঢাকার বাহিরে",
          total: shipping.cost.toString(),
        },
      ],
      coupon_lines:
        discountAmount > 0
          ? [
              {
                code: promoCode,
              },
            ]
          : [],
      customer_note: billing.note,
    };

    try {
      const response = await axios.post(`${API_URL}/wc/v3/orders`, orderData, {
        auth: {
          username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
          password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
        },
      });

      const orderId = response.data.id;
      setOrderId(orderId);
      setShowThankYou(true);
      setShowModal(false);
      setOrderStatus(`Order placed successfully! Order ID: ${response.data.id}`);
      // ===== Facebook Pixel Purchase Tracking =====
      if (window.fbq) {
        window.fbq("track", "Purchase", {
          value: total.toFixed(2),      // total amount
          currency: "BDT",              // currency
          content_ids: [product.id],    // array of product ids
          content_name: product.name,   // product name
          content_type: "product",
        });
        console.log("FB Pixel Purchase event sent:", product.name, total.toFixed(2));
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      setOrderStatus("Failed to place order. Check console.");
      alert("Failed to place order. Check console.");
    }

    setLoading(false);
  };

  return (
    <>
      <button
        type="button"
        className="custom-button button-small"
        onClick={handleBuyNowClick}
      >
        Buy Now
      </button>

      {/* Checkout Modal */}
      {showModal && (
        <div className="fixed-place-order">
          <div className="popup-checkout-content">
            <span className="popup-close" onClick={() => setShowModal(false)}>×</span>

            {/* Product Info */}
            <table className="popup-cart-table">
              <thead>
                <tr>
                  <th style={{ width: "20%" }}>Image</th>
                  <th style={{ width: "45%" }}>Product</th>
                  <th style={{ width: "15%" }}>Qty</th>
                  <th style={{ width: "15%" }}>Total</th>
                  <th style={{ width: "5%" }}></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><img src={product.images[0]?.src} width="40" height="40" alt={product.name} /></td>
                  <td>{product.name}</td>
                  <td>
                    <div className="popup-qty-wrap">
                      <button type="button" onClick={decreaseQty}>-</button>
                      <span>{qty}</span>
                      <button type="button" onClick={increaseQty}>+</button>
                    </div>
                  </td>
                  <td>৳ {subtotal}</td>
                  <td><button type="button" onClick={() => setShowModal(false)}>×</button></td>
                </tr>
              </tbody>
            </table>

            {/* Billing Form */}
            <div className="customer-details">
              <h3>Billing Details</h3>
              <input type="text" name="name" placeholder="Full Name *" value={billing.name} onChange={handleBillingChange} />
              <input type="tel" name="phone" placeholder="Phone *" value={billing.phone} onChange={handleBillingChange} />
              <input type="text" name="address" placeholder="Address *" value={billing.address} onChange={handleBillingChange} />
              <textarea name="note" placeholder="Order Note" rows={2} value={billing.note} onChange={handleBillingChange}></textarea>
            </div>

            {/* Promo Code */}
            <div className="promo-code">
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

            {/* Shipping */}
            <div className="shipping-methods">
              <h3>Shipping Method</h3>
              <label>
                <input type="radio" name="shipping" value="inside_dhaka" checked={shipping.method === "inside_dhaka"} onChange={handleShippingChange} />
                ঢাকার ভিতরে – ৳ 70
              </label>
              <label>
                <input type="radio" name="shipping" value="outside_dhaka" checked={shipping.method === "outside_dhaka"} onChange={handleShippingChange} />
                ঢাকার বাহিরে – ৳ 120
              </label>
            </div>

            {/* Order Summary */}
            <div className="checkout-order-review">
              <h3>Your Order</h3>
              <table className="shop_table">
                <tbody>
                  <tr>
                    <td>{product.name} × {qty}</td>
                    <td>৳ {subtotal}</td>
                  </tr>
                  {discountAmount > 0 && (
                    <tr>
                      <td>Discount</td>
                      <td>-৳ {discountAmount.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <th>Subtotal</th>
                    <td>৳ {subtotal}</td>
                  </tr>
                  <tr>
                    <th>Shipping</th>
                    <td>৳ {shipping.cost}</td>
                  </tr>
                  <tr className="order-total">
                    <th>Total</th>
                    <td><strong>৳ {total.toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payment */}
            <div className="payment">
              <label>
                <input type="radio" name="payment_method" checked readOnly />
                Cash on delivery
              </label>
              <p className="payment-desc">Pay with cash upon delivery.</p>
            </div>

            <button type="button" className="place-order-btn" onClick={placeOrder} disabled={loading}>
              {loading ? "Placing Order..." : "Place Order"}
            </button>

            {orderStatus && <p>{orderStatus}</p>}
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
