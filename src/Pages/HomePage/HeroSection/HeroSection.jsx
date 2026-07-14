import React from "react";
import { useThemeOptions } from "../../../context/ThemeOptionsContext";

const HeroSection = () => {
    const { options } = useThemeOptions();

    if (!options) return null;

    return (
        <aside className="section no-padding">
            <div className="section-featured-slider">
                <img
                    src={options.hero_banner || "/images/slider/Orlazz-Website-Cover-New-2.jpeg"}
                    alt="Slider"
                />
            </div>
        </aside>
    );
};

export default HeroSection;