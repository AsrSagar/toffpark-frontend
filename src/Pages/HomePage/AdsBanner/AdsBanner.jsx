import React from "react";
import "./AdsBanner.css";

const AdsBanner = () => {
    return (
        <aside className="section no-padding">
            <div className="ads-banner mb-5">
                <div className="container">
                <div className="inner-wrapper">
                    <div className="col-grid-12 zoom-effect-hover-container">
                        <div className="zoom-effect">
                            <a href="/">
                            <img
                                alt="banner"
                                src="https://dev.toffpark.com/wp-content/uploads/2026/03/Website-Category-Desktop-1500-wide-x-250-Toffpark-Eid-Campaign-2026.jpg"
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