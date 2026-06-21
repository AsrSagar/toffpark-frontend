import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // ১. Link ইম্পোর্ট করা হয়েছে
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

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_URL}/wc/store/v1/products/categories?per_page=20`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    const excludedSlugs = ["sale", "mega-deal", "new-arrival", "top-selling", "best-selling", "free-delivery", "new-arrivals"];
          
                    const filteredData = data.filter(cat => !excludedSlugs.includes(cat.slug));
                    setCategories(filteredData);
                } else {
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

    const settings = {
        dots: false,
        arrows: true,
        infinite: categories.length > 2,
        speed: 500,
        slidesToShow: windowWidth <= 480 ? 2 : windowWidth <= 768 ? 2 : windowWidth <= 1024 ? 3 : 6,
        slidesToScroll: 1,
    };

    return (
        <section className="popular-category-section">
            <div className="container">
                <div className="section-header">
                    <h2>Explore By Categories</h2>
                </div>
                <div className="category-slider-wrapper">
                    {loading ? (
                        <div className="full-page-loader">
                            <div className="spinner"></div>
                            <p>Loading...</p>
                        </div>
                    ) : categories.length > 0 ? (
                        <Slider key={`${windowWidth}-${categories.length}`} {...settings}>
                            {categories.map((cat) => (
                                <div key={cat.id} className="category-slide-item">
                                    <Link to={`/product-category/${cat.slug}`} className="category-card-link">
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
                                    </Link>
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