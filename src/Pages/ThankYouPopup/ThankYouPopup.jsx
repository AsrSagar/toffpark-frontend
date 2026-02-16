import React from "react";
import "./thankyou.scss";
import { useNavigate } from 'react-router-dom';

const ThankYouPopup = ({ show, orderId, onClose }) => {

    const navigate = useNavigate(); 

    if (!show) return null;

    const handleContinueShopping = () => {
        onClose();           
        navigate("/shop");
    };

    return (
        <div className="thankyou-overlay">
            <div className="thankyou-popup">
                <h2>🎉 Thank You!</h2>
                <p>Your order has been placed successfully.</p>
                {orderId && (
                <p className="order-id">
                    <strong>Order ID:</strong> #{orderId}
                </p>
                )}

                <button className="thankyou-btn" onClick={handleContinueShopping}>
                Continue Shopping
                </button>
            </div>
        </div>
    );
};

export default ThankYouPopup;