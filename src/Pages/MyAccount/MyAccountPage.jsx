import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import config from "../../config";
import AuthForm from "../AuthForm/AuthForm";
import "./MyAccountPage.css";
import CustomerDashboard from "./CustomerDashboard/CustomerDashboard";

const MyAccountPage = () => {
    const API_URL = config.API_URL;
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // 🔐 চেক করা হচ্ছে ব্রাউজারে টোকেন আছে কি না (লগইন স্টেট ট্র্যাকিং)
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);

        // পেজ লোড হওয়ার সময় টোকেন চেক করা
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }

        fetch(`${API_URL}/wp/v2/pages?slug=my-account`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    setPageData(data[0]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching page:", err);
                setLoading(false);
            });
    }, [ API_URL ]);

    if (loading) {
        return (
            <div className="mad-loading-container" style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px' }}>
                Loading account details...
            </div>
        );
    }

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
                                    <span>My Account</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <aside className="section no-padding static-page-section">
            <div className="container">
                {/* 🔄 ডাইনামিক কন্ডিশনাল রেন্ডারিং */}
                {isLoggedIn ? (
                    <CustomerDashboard />
                ) : (
                    <AuthForm />
                )}
            </div>
        </aside>
        </>
    );
};

export default MyAccountPage;