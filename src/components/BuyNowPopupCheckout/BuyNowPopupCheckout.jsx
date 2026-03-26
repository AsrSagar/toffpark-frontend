import React, { useState } from "react";
import axios from "axios";
import ThankYouPopup from "../../Pages/ThankYouPopup/ThankYouPopup";
import "./BuyNowPopupCheckout.css";

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

  const handleBillingChange = (e) =>
    setBilling({ ...billing, [e.target.name]: e.target.value });

  const handleShippingChange = (e) =>
    setShipping({ method: e.target.value, cost: shippingRates[e.target.value] });

  const variationId = selectedVariation?.id || null;
  const size =
    selectedVariation?.attributes?.find(
      (attr) =>
        attr.name.toLowerCase() === "size" || attr.slug === "pa_size"
    )?.option || null;

  const finalPrice = selectedVariation?.price ? Number(selectedVariation.price) : product.price;
  const checkprice = (selectedVariation?.prices?.price || 0) / 100 || product.price;

  // Subtotal = main product + fbt products
  const subtotal =
    (Number(finalPrice) || checkprice) * qty +
    fbtProducts.reduce((acc, p) => {
      if (fbtSelected[p.id]) {
        return acc + (p.price || 0) * (fbtQtys[p.id] || 1);
      }
      return acc;
    }, 0);

  const total = subtotal - discountAmount + shipping.cost;

  // Open popup on Buy Now
  const handleBuyNowClick = () => {
    if (product.type === "variable" && !selectedVariation) {
      alert("Please select a size before continuing.");
      return;
    }
    setShowModal(true);
  };

  // Apply promo code
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

  // Place order
  const placeOrder = async () => {
    if (!billing.name || !billing.phone || !billing.address) {
      alert("Please fill Name, Phone, and Address!");
      return;
    }
    setLoading(true);
    setOrderStatus("");

    try {
      const lineItems = [
        variationId ? { product_id: product.id, variation_id: variationId, quantity: qty } : { product_id: product.id, quantity: qty }
      ];

      // Add FBT products to line items
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

        const variationRes = await axios.get(`${API_URL}/wc/v3/products/${p.id}/variations`, {
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

      // Order data
      const orderData = {
        payment_method: paymentMethod,
        payment_method_title: paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "bkash" ? "bKash" : paymentMethod === "nagad" ? "Nagad" : "Card Payment",
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
        line_items: lineItems,
        shipping_lines: [
          {
            method_id: "flat_rate",
            method_title: shipping.method === "inside_dhaka" ? "ঢাকার ভিতরে" : "ঢাকার বাহিরে",
            total: shipping.cost.toString(),
          },
        ],
        coupon_lines: discountAmount > 0 ? [{ code: promoCode }] : [],
        customer_note: billing.note,
      };

      const response = await axios.post(`${API_URL}/wc/v3/orders`, orderData, {
        auth: {
          username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
          password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
        },
      });

      setOrderId(response.data.id);
      setShowThankYou(true);
      setShowModal(false);
      setOrderStatus(`Order placed successfully! Order ID: ${response.data.id}`);
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Failed to place order.");
    }

    setLoading(false);
  };

  return (
    <>
      <button type="button" className="custom-button button-small" onClick={handleBuyNowClick}>
        Buy Now
      </button>

      {showModal && (
        <div className="fixed-place-order">
          <div className="popup-checkout-content">
            <div className="popup-form">
              <span className="popup-close" onClick={() => setShowModal(false)}>×</span>

              {/* Billing Form */}
              <div className="form-control">
                <label>Name *</label>
                <div className="input-wrapper">
                  <span className="icon">👤</span>
                  <input type="text" name="name" placeholder="Name" value={billing.name} onChange={handleBillingChange} />
                </div>
              </div>
              <div className="form-control">
                <label>Phone *</label>
                <div className="input-wrapper">
                  <span className="icon">📞</span>
                  <input type="tel" name="phone" placeholder="Phone" value={billing.phone} onChange={handleBillingChange} />
                </div>
              </div>
              <div className="form-control">
                <label>Address</label>
                <div className="input-wrapper">
                  <span className="icon">📍</span>
                  <input type="text" name="address" placeholder="Address" value={billing.address} onChange={handleBillingChange} />
                </div>
              </div>
              <div className="form-control">
                <label>Note (optional)</label>
                <div className="input-wrapper">
                  <span className="icon">📝</span>
                  <input type="text" name="note" placeholder="Note" value={billing.note} onChange={handleBillingChange} />
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
                    <td><img src={product.images[0]?.src} alt={product.name} width="70" /></td>
                    <td>{product.name}{size && ` (Size: ${size})`} × {qty}</td>
                    <td>৳{(Number(finalPrice) || checkprice) * qty}</td>
                  </tr>
                  {fbtProducts.map((p) => {
                    if (!fbtSelected[p.id]) return null;
                    return (
                      <tr key={p.id}>
                        <td><img src={p.images[0]?.src} width="70" alt={p.name} /></td>
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
                  placeholder="Promo Code"
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
                <h3>Shipping Method</h3>
                <label className={shipping.method === "inside_dhaka" ? "active" : ""}>
                  <input 
                    type="radio" 
                    name="shipping" 
                    value="inside_dhaka" 
                    checked={shipping.method === "inside_dhaka"} 
                    onChange={handleShippingChange} 
                  />
                  <span>ঢাকার ভিতরে – ৳70</span>
                </label>
                
                <label className={shipping.method === "outside_dhaka" ? "active" : ""}>
                  <input 
                    type="radio" 
                    name="shipping" 
                    value="outside_dhaka" 
                    checked={shipping.method === "outside_dhaka"} 
                    onChange={handleShippingChange} 
                  />
                  <span>ঢাকার বাহিরে – ৳120</span>
                </label>
              </div>

              {/* Order Summary */}
              <div className="checkout-order-review">
                <h3>Your Order</h3>
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
                {["cod", "bkash", "nagad", "sslcommerz"].map((method) => (
                  <label key={method} className={paymentMethod === method ? "active" : ""}>
                    <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span>
                      {method === "cod" ? "Cash On Delivery" :
                      method === "bkash" ? "bKash" :
                      method === "nagad" ? "Nagad" :
                      "Card Payment"}
                    </span>
                    {method === "bkash" && <img src="/images/bkash.png" alt="bkash" />}
                    {method === "nagad" && <img src="/images/nagad.png" alt="nagad" />}
                    {method === "sslcommerz" && <img src="/images/sslcz-verified.png" alt="sslcommerz" />}
                  </label>
                ))}
              </div>

              <button type="button" className="place-order-btn" onClick={placeOrder} disabled={loading}>
                {loading ? "Placing Order..." : "Place Order"}
              </button>
              {orderStatus && <p>{orderStatus}</p>}
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