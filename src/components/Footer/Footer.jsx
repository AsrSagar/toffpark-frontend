import React from "react";

const Footer = () => {
    return (
        <div className="footer-container">
            <div id="footer-widgets">
                <div className="container">
                    <div className="inner-wrapper">
                        <aside className="col-grid-3 footer-widget-area">
                            <h3 className="widget-title">CONTACT</h3>
                            <div className="widget-quick-contact">
                                <p><i className="far fa-map" aria-hidden="true"></i> Level 2, Rupayan Latifa Shamsuddin Square, Mirpur 1, Dhaka-1216</p>
                                <p><i className="fas fa-phone" aria-hidden="true"></i> +8801811877477</p>
                                <p><i className="fas fa-envelope" aria-hidden="true"></i> support@toffpark.com</p>
                                <p><i className="far fa-clock" aria-hidden="true"></i> 7 Days / 10:00 AM - 10:00 PM</p>
                            </div>
                        </aside>
                        <aside className="col-grid-3 footer-widget-area">
                            <h3 className="widget-title">MY ACCOUNT</h3>
                            <ul>
                                <li><a href="/">My Account</a></li>
                                <li><a href="/">Shopping cart</a></li>
                                <li><a href="/">Wishlist</a></li>
                                <li><a href="/">Checkout</a></li>
                                <li><a href="/">Contact</a></li>
                            </ul>
                        </aside>
                        <aside className="col-grid-3 footer-widget-area">
                            <h3 className="widget-title">INFORMATION</h3>
                            <ul>
                                <li><a href="/">About us</a></li>
                                <li><a href="/">Order History</a></li>
                                <li><a href="/">Returns</a></li>
                                <li><a href="/">Custom Service</a></li>
                                <li><a href="/">Terms &amp; Condition</a></li>
                            </ul>
                        </aside>
                        <aside className="col-grid-3 footer-widget-area">
                            <h3 className="widget-title">QUICK LINKS</h3>
                            <ul>
                                <li><a href="/">About us</a></li>
                                <li><a href="/">Delivery Information</a></li>
                                <li><a href="/">Terms &amp; Conditions</a></li>
                                <li><a href="/">FAQ'S</a></li>
                                <li><a href="/">Services</a></li>
                            </ul>
                        </aside>
                    </div>
                </div>
            </div>
            <footer id="colophon" className="site-footer">
                <div className="colophon-bottom">
                    <div className="container">
                        <div className="inner-wrapper">
                            <div className="col-grid-6 copyright text-alignleft">
                                <p>Copyright © 2025 Toffpark. All rights reserved.</p>
                            </div>
                            <div className="col-grid-6 copyright text-alignright">
                                <p><span>We Accept: </span> <img src="/images/payment-getway.png" alt="payment" /></p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};   

export default Footer;