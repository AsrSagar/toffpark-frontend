import React from "react";

const Footer = () => {
    return (
        <div className="footer-container">
            <div id="footer-widgets">
                <div className="container">
                    <div className="inner-wrapper">
                        <aside className="col-grid-3 footer-widget-area">
                            <h3 className="widget-title">ABOUT US</h3>
                            <div className="widget-quick-contact">
                                <p><i className="fas fa-phone" aria-hidden="true"></i> (800) 123 45 67</p>
                                <p><i className="fas fa-envelope" aria-hidden="true"></i> info@anilbasnet.net</p>
                                <p><i className="far fa-map"></i> 121 King Street, Australia</p>
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
                            <div className="col-grid-4 copyright text-alignleft">
                                <p>Copyright © 2018 <a href="/">Byapar</a>. All rights reserved.</p>
                            </div>
                            <div className="col-grid-4 copyright">
                                <p><span>We Accept: </span> <img src="/images/payment-getway.png" alt="payment" /></p>
                            </div>
                            <div className="col-grid-4 site-info text-alignright">
                                <p>Byapar by <a href="/anilbasnet.html" target="_blank" rel="noopener noreferrer">Anil Basnet</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};   

export default Footer;