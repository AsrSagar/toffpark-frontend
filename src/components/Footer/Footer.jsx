import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <div className="footer-container">
            <div id="footer-widgets">
                <div className="container">
                    <div className="inner-wrapper">
                        <aside className="col-grid-3 footer-widget-area">
                            <img src="/images/Toffpark-Logo-White.png" alt="Footer Logo" />
                            <p>Toffpark strives to provide the largest variety of footwear, clothing, and accessories at the best possible prices.</p>
                        </aside>
                        <aside className="col-grid-3 footer-widget-area">
                            <h3 className="widget-title">QUICK LINKS</h3>
                            <ul>
                                <li><Link to="/shop">Shop</Link></li>
                                <li><Link to="/blog">Blog</Link></li>
                                <li><Link to="/about-us">About Us</Link></li>
                                <li><a href="/">My Account</a></li>
                            </ul>
                        </aside>
                        <aside className="col-grid-3 footer-widget-area">
                            <h3 className="widget-title">SUPPORT</h3>
                            <ul>
                                <li><Link to="/offers">Offers</Link></li>
                                <li><Link to="/contact/">Contact Us</Link></li>
                                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                                <li><Link to="/returns-refunds">Returns & Refunds</Link></li>
                                <li><Link to="/delivery-policy">Delivery Policy</Link></li>
                            </ul>
                        </aside>
                        <aside className="col-grid-3 footer-widget-area">
                            <h3 className="widget-title">CONTACT</h3>
                            <div className="widget-quick-contact">
                                <p><i className="far fa-map" aria-hidden="true"></i> Level 2, Rupayan Latifa Shamsuddin Square, Mirpur 1, Dhaka-1216</p>
                                <p><i className="fas fa-phone" aria-hidden="true"></i> +8801811877477</p>
                                <p><i className="fas fa-envelope" aria-hidden="true"></i> support@toffpark.com</p>
                                <p><i className="far fa-clock" aria-hidden="true"></i> 7 Days / 10:00 AM - 10:00 PM</p>
                            </div>
                        </aside>
                        <aside className="col-grid-12">
                            <img src="/images/Payment-Banner_Jul24_V1-02-2048x229.png" alt="Footer Logo" />
                        </aside>
                    </div>
                </div>
            </div>
            <footer id="colophon" className="site-footer">
                <div className="colophon-bottom">
                    <div className="container">
                        <div className="inner-wrapper">
                            <div className="col-grid-12 copyright text-aligncenter">
                                <p>Copyright © 2025 Toffpark. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};   

export default Footer;