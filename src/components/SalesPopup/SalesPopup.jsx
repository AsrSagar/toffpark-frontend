import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SalesPopup.css';
import config from '../../config';

const SalesPopup = () => {
    const [sales, setSales] = useState([]);
    const [currentSale, setCurrentSale] = useState(null);
    const [show, setShow] = useState(false);
    const API_URL = config.API_URL;

    // ১. ব্যাকএন্ড থেকে গত ২৪ ঘণ্টার সেলস ডাটা ফেচ করা
    useEffect(() => {
        const fetchSales = async () => {
            try {
                const response = await fetch(`${API_URL}/custom/v1/recent-sales/`);
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    setSales(data);
                    const randomIndex = Math.floor(Math.random() * data.length);
                    setCurrentSale(data[randomIndex]);
                }
            } catch (err) {
                console.error("Sales Fetch Error:", err);
            }
        };
        fetchSales();
    }, [API_URL]);

    // ২. নির্দিষ্ট সময় পর পর পপআপ ঘুরিয়ে ফিরিয়ে দেখানো
    useEffect(() => {
        if (sales.length === 0) return;

        const interval = setInterval(() => {
            // পপআপ ওপেন হবে
            setShow(true);

            // ৬ সেকেন্ড পর হাইড হবে
            setTimeout(() => {
                setShow(false);
                
                // হাইড হওয়ার ৩ সেকেন্ড পর নতুন র্যান্ডম ডাটা সেট হবে
                setTimeout(() => {
                    const randomIndex = Math.floor(Math.random() * sales.length);
                    setCurrentSale(sales[randomIndex]);
                }, 1000);

            }, 6000);

        }, 12000); // প্রতি ১২ সেকেন্ড পর পর লুপ চলবে

        return () => clearInterval(interval);
    }, [sales]);

    if (sales.length === 0 || !currentSale) return null;

    // Slug বের করার ফাংশন
    const getSlug = (url) => {
        if (!url) return "";
        const baseUrl = url.split("?")[0];
        return baseUrl.split("/").filter(Boolean).pop();
    };

    const slug = getSlug(currentSale.permalink);

    // প্রোডাক্টের নাম ক্লিন করার ফাংশন
    const getCleanProductName = (name) => {
        if (!name) return "";
        const nameParts = name.split(" - ");
        if (nameParts.length > 1) {
            return `${nameParts[0]} - ${nameParts[1]}`.trim();
        }
        return name.trim();
    };

    const displayProductName = getCleanProductName(currentSale.product_name);

    return (
        <div className={`sales-popup-wrapper ${show ? 'show' : 'hide'}`}>
            <div className="sales-popup-container">
                <Link to={`/product/${slug}`} className="sales-popup-image">
                    <img src={currentSale.product_image} alt={displayProductName} />
                </Link>
                
                <div className="sales-popup-content">
                    <p className="status-text">Someone liked and purchased</p>
                    <h4 className="product-name">
                        <Link to={`/product/${slug}`}>{displayProductName}</Link>
                    </h4>
                    <p className="location-time">{currentSale.time} from {currentSale.location}</p>
                </div>

                <button className="sales-popup-close" onClick={() => setShow(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default SalesPopup;