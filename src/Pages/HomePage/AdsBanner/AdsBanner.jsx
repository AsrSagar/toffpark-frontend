import React from "react";

const AdsBanner = () => {
    return (
        <aside className="section no-padding">
            <div className="ads-banner">
                <div className="container">
                <div className="inner-wrapper">
                    <div className="col-grid-8 zoom-effect-hover-container">
                    <div className="zoom-effect">
                        <a href="/">
                        <img
                            alt="banner"
                            src="/images/shop/ad-banner3.jpg"
                        />
                        </a>
                    </div>
                    </div>

                    <div className="col-grid-4 zoom-effect-hover-container">
                    <div className="zoom-effect">
                        <a href="/">
                        <img
                            alt="banner"
                            src="/images/shop/ad-banner4.jpg"
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