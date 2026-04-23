import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import config from "../../../config";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./PopularCategory.css";

const PopularCategory = () => {
    const API_URL = config.API_URL;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

    // Window resize track kora jate slider dynamic width pay
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_URL}/wc/store/v1/products/categories?per_page=20`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setCategories(data);
                }
                setLoading(false);
            } catch (error) {
                console.error("Fetch Error:", error);
                setLoading(false);
            }
        };

        fetchCategories();
        return () => window.removeEventListener("resize", handleResize);
    }, [API_URL]);

    // Responsive settings alada variable e
    const settings = {
        dots: false,
        arrows: true,
        infinite: categories.length > 2,
        speed: 500,
        slidesToShow: windowWidth <= 480 ? 2 : windowWidth <= 768 ? 2 : windowWidth <= 1024 ? 3 : 6,
        slidesToScroll: 1,
    };
    // const settings = {
    //     infinite: true,
    //     slidesToShow: windowWidth <= 480 ? 2 : windowWidth <= 768 ? 2 : windowWidth <= 1024 ? 3 : 6,
    //     slidesToScroll: 1,
    //     autoplay: true,
    //     speed: 5000, // Continuous motion er jonno speed besi hobe
    //     autoplaySpeed: 0,
    //     cssEase: "linear", // Smooth continuous movement
    //     pauseOnHover: false,
    // };

    if (loading) return <div className="loading-shimmer">Loading Categories...</div>;

    return (
        <section className="popular-category-section">
            <div className="container">
                <div className="section-header">
                    <h2>Explore By Categories</h2>
                </div>
                <div className="category-slider-wrapper">
                    {categories.length > 0 ? (
                        <Slider key={`${windowWidth}-${categories.length}`} {...settings}>
                            {categories.map((cat) => (
                                <div key={cat.id} className="category-slide-item">
                                    <div className="category-card">
                                        <div className="category-image">
                                            <img 
                                                src={cat.image?.src || "/images/shop/cat1.jpg"} 
                                                alt={cat.name} 
                                            />
                                        </div>
                                        <div className="category-label-overlay">
                                            <span className="label-text">{cat.name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    ) : (
                        <p>No categories found.</p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default PopularCategory;