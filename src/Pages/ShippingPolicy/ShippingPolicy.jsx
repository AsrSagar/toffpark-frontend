import React from "react";
import { Link } from "react-router-dom";

const ShippingPolicy = () => {
    return (
        <>
        <div id="custom-header">
            <div className="custom-header-content">
                <div className="container">
                    <div id="breadcrumb">
                        <div className="breadcrumbs breadcrumb-trail">
                            <ul className="trail-items">
                                <li className="trail-item trail-begin">
                                    <Link to="/">
                                        <span>Home</span>
                                    </Link>
                                </li>
                                <li className="trail-item trail-end">
                                    <span>Delivery Policy</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <aside className="section no-padding">
            <div className="container">
                <div className="content-block">
                    <div className="shipping-policy">
                        <h2>Shipping & Delivery Policy</h2>
                        <p>
                            We arrange <strong>home delivery in all areas within Bangladesh</strong>.
                        </p>
                        <p>
                            Our goal is to offer you the best shipping options, no matter where you
                            live inside Bangladesh. We provide the very highest levels of
                            responsiveness to you at all times.
                        </p>
                        <h3>Delivery Charge</h3>
                        <ul>
                            <li>
                            <strong>Dhaka City:</strong> 80 TK
                            </li>
                            <li>
                            <strong>Outside Dhaka City:</strong> 150 TK (Delivery charge must be
                            paid in advance for outside Dhaka city orders)
                            </li>
                        </ul>
                        <h3>Delivery Methods</h3>
                        <p>
                            We process orders within <strong>4 – 12 hours</strong> by confirming over
                            the phone after the order is placed for in-stock items.
                        </p>
                        <ul>
                            <li>
                            <strong>Inside Dhaka City:</strong> 24 – 48 hours delivery time.
                            </li>
                            <li>
                            <strong>Outside Dhaka City:</strong> 2 – 5 days delivery time.
                            </li>
                        </ul>
                        <p>
                            We also take <strong>pre-orders</strong> for upcoming and out-of-stock
                            items.
                        </p>
                        <ul>
                            <li>
                            Pre-order items take <strong>15 – 30 working days</strong> to deliver
                            from the order confirmation date.
                            </li>
                            <li>
                            <strong>10% advance payment</strong> is required for pre-order
                            products.
                            </li>
                        </ul>
                        <h3>Wrong Address</h3>
                        <p>
                            It is the responsibility of the buyer to make sure that the delivery
                            address entered is correct. We do our best to speed up processing and
                            delivery time, so there is always a small window to correct an incorrect
                            delivery address.
                        </p>
                        <p>
                            Please contact us immediately if you believe you have provided the wrong
                            shipping address.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
        </>
    );
};

export default ShippingPolicy;