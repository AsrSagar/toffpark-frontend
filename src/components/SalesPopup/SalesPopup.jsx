import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './SalesPopup.css';
import config from '../../config';

const SalesPopup = () => {
    const [sales, setSales] = useState([]);
    const [currentSale, setCurrentSale] = useState(null);
    const [show, setShow] = useState(false);
    const API_URL = config.API_URL;

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
            } catch (err) { console.error(err); }
        };
        fetchSales();
    }, [API_URL]);

    const showNextSale = useCallback(() => {
        if (sales.length === 0) return;
        setShow(true);
        setTimeout(() => {
            setShow(false);
            setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * sales.length);
                setCurrentSale(sales[randomIndex]);
                showNextSale();
            }, 3000); 
        }, 6000);
    }, [sales]);

    useEffect(() => {
        if (sales.length > 0) {
            const timer = setTimeout(showNextSale, 5000);
            return () => clearTimeout(timer);
        }
    }, [sales, showNextSale]);

    if (sales.length === 0 || !currentSale) return null;

    const getSlug = (url) => {
        if (!url) return "";
        
        const baseUrl = url.split("?")[0];
        
        const slug = baseUrl.split("/").filter(Boolean).pop();
        
        return slug;
    };

    const slug = getSlug(currentSale.permalink);

    return (
        <div className={`sales-popup-wrapper ${show ? 'show' : 'hide'}`}>
            <div className="sales-popup-container">
                <Link to={`/product/${slug}`} className="sales-popup-image">
                    <img src={currentSale.product_image} alt={currentSale.product_name} />
                </Link>
                
                <div className="sales-popup-content">
                    <p className="status-text">Someone liked and purchased</p>
                    <h4 className="product-name">
                        <Link to={`/product/${slug}`}>{currentSale.product_name}</Link>
                    </h4>
                    <p className="location-time">{currentSale.time} From {currentSale.location}</p>
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