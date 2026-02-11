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
  };

  const handleShippingChange = (e) => {
    const method = e.target.value;
    setShipping({ method, cost: shippingRates[method] });
  };

  const subtotal = product.price * qty;
  const total = subtotal + shipping.cost;

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
      customer_note: billing.note,
    };

    try {
      const response = await axios.post(`${API_URL}/wc/v3/orders`, orderData, {
        auth: {
          username: consumerKey,
          password: consumerSecret,
        },
      });

      // Success: show Thank You popup
      setOrderId(response.data.id);
      setShowThankYou(true);
      setShowModal(false);
      setOrderStatus(`Order placed successfully! Order ID: ${response.data.id}`);
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
        onClick={() => setShowModal(true)}
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
                    <td><strong>৳ {total}</strong></td>
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
