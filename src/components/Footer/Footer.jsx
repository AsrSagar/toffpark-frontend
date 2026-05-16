import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
    return (
        <div className="footer-container">
            <div id="footer-widgets">
                <div className="container">
                    <div className="inner-wrapper">
                        <aside className="col-grid-3 footer-widget-area">
                            <img className="footer-logo" src="/images/logo-white.png" alt="Footer Logo" />
                            <p>Orlazz, a sub-brand of TOFFPARK, brings stylish and comfortable footwear for kids and women.</p>
                            <div className="footer-icons">
                                <a href="https://www.facebook.com/orlazzofficial/" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
                                <a href="https://www.instagram.com/orlazzofficial/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
                                <a href="https://api.whatsapp.com/send/?phone=8801811877477" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp"></i></a>
                                <a href="https://www.youtube.com/@orlazzofficial/" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
                                <a href="https://www.tiktok.com/@orlazzofficial/" target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok"></i></a>
                            </div>
                        </aside>
                        <aside className="col-grid-3 footer-widget-area">
                            <h3 className="widget-title">QUICK LINKS</h3>
                            <ul>
                                <li><Link to="/shop">Shop</Link></li>
                                <li><Link to="/offers">Offers</Link></li>
                                <li><Link to="/about-us">About Us</Link></li>
                                <li><a href="/">My Account</a></li>
                                <li><Link to="/product-category/84">Top Selling Items</Link></li>
                            </ul>
                        </aside>
                        <aside className="col-grid-3 footer-widget-area">
                            <h3 className="widget-title">SUPPORT</h3>
                            <ul>
                                <li><Link to="/contact/">Contact Us</Link></li>
                                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                                <li><Link to="/returns-refunds">Returns & Refunds</Link></li>
                                <li><Link to="/delivery-policy">Delivery Policy</Link></li>
                                <li><Link to="/terms-conditions">Terms & Conditions</Link></li>
                            </ul>
                        </aside>
                        <aside className="col-grid-3 footer-widget-area">
                            <h3 className="widget-title">CONTACT</h3>
                            <div className="widget-quick-contact">
                                <p><i className="fa fa-map-marker-alt" aria-hidden="true"></i> Level 2, Rupayan Latifa Shamsuddin Square, Mirpur 1, Dhaka-1216 (Toffpark Showroom)</p>
                                <p><i className="fas fa-phone" aria-hidden="true"></i> <a href="tel:+8801811877477">+8801811877477</a></p>
                                <p><i className="fas fa-envelope" aria-hidden="true"></i> <a href="mailto:support@orlazz.com">support@orlazz.com</a></p>
                                <p><i className="far fa-clock" aria-hidden="true"></i> 7 Days / 10:00 AM - 10:00 PM</p>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
            <footer id="colophon" className="site-footer">
                <div className="colophon-bottom">
                    <div className="container">
                        <div className="inner-wrapper bottom-fotter-widget-area">
                            <div className="col-grid-6 copyright text-alignleft">
                                <p>Copyright © 2026 Orlazz</p>
                            </div>
                            <div className="col-grid-6 payment-images text-alignright">
                                <img src="/images/faysy1756641916.png" alt="Footer Logo" />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <footer id="colophon" className="mobile-footer">
                <div className="container">
                    <div className="inner-wrapper bottom-fotter-widget-area">
                        <div className="col-grid-6 payment-images">
                            <img src="/images/faysy1756641916.png" alt="Footer Logo" />
                        </div>
                        <div className="col-grid-6 copyright">
                            <p>Copyright © 2026 Orlazz</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};   

export default Footer;