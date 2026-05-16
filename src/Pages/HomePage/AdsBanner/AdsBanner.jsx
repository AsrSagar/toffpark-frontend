import React from "react";
import "./AdsBanner.css";

const AdsBanner = () => {
    return (
        <aside className="section no-padding">
            <div className="ads-banner mb-5">
                <div className="container">
                    <div className="inner-wrapper">
                        <div className="col-grid-6 ads-banner-image zoom-effect-hover-container">
                            <div className="zoom-effect">
                                <a href="/">
                                <img
                                    alt="banner"
                                    src="https://dev.toffpark.com/wp-content/uploads/2026/04/1.png"
                                    style={{ width: "100%", height: "auto" }}
                                />
                                </a>
                            </div>
                        </div>
                        <div className="col-grid-6 ads-banner-image zoom-effect-hover-container">
                            <div className="zoom-effect">
                                <a href="/">
                                <img
                                    alt="banner"
                                    src="https://dev.toffpark.com/wp-content/uploads/2026/04/2.png"
                                    style={{ width: "100%", height: "auto" }}
                                />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};  

export default AdsBanner;