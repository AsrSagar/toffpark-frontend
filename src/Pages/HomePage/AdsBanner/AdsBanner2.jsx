import React from "react";
import "./AdsBanner.css";
import { useThemeOptions } from "../../../context/ThemeOptionsContext";

const AdsBanner2 = () => {
    const { options } = useThemeOptions();
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
                                    src={options.category_middle_banner_3 || "/images/ads-banner-1.jpg"}
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
                                    src={options.category_middle_banner_4 || "/images/ads-banner-2.jpg"}
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

export default AdsBanner2;