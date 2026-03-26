import React from "react";
import { Link } from "react-router-dom";

const AboutPage = () => {
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
                            <span>About Us</span>
                        </li>
                        </ul>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            <aside className="section">
                <div className="container">
                    <div className="content-block">
                        <h2>ABOUT US</h2>
                        <h3>Toffpark - The Quality You Desire</h3>
                        <p>
                            Toffpark strives to provide the largest variety of footwear, clothing, and accessories at the best possible prices. Our mission is to take you on a journey to discover the quality you desire.
                        </p>
                        <p>
                            We maintain a high standard of the products that we offer to our customers. Our pledge to offering quality products at the best prices is achieved as we source items from only reputable companies and foster good relationships directly with the manufacturers.
                        </p>
                        <p>
                            Having served thousands of customers nationally, we’re committed to providing you with a 5-star experience: fresh, quality products paired with consistently professional customer service.At Toffpark, we believe that fashion is an expression of individuality, and we are here to help you find pieces that resonate with your personal style. Join us on this exciting journey as we continue to bring you the best in footwear, clothing, and accessories.
                        </p>
                        <p>
                            <strong>Trade License No. : </strong> TRAD/DNCC/029981/2022
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
};  

export default AboutPage;