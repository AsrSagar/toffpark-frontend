import React, { useEffect, useState } from "react";
import config from "../../config"; // আপনার Config ফাইলের পাথ ঠিক রাখুন

import HeroSection from "./HeroSection/HeroSection";
import AdsBanner from "./AdsBanner/AdsBanner";
import AdsBanner2 from "./AdsBanner/AdsBanner2";
import CustomerFeedback from "./CustomerFeedback/CustomerFeedback";
import CategoryProduct from "./CategoryProduct/CategoryProduct";
import SalesPopup from "../../components/SalesPopup/SalesPopup";
import PopularCategory from "./PopularCategory/PopularCategory";

const Home = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);

        // WordPress API থেকে ড্র্যাগ অ্যান্ড ড্রপ লেআউট ডেটা আনা
        const fetchLayout = async () => {
            try {
                const res = await fetch(`${config.API_URL}/custom/v1/home-layout`);
                const data = await res.json();
                
                if (Array.isArray(data)) {
                    setSections(data);
                }
            } catch (err) {
                console.error("Error fetching homepage layout:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLayout();
    }, []);

    // ACF Flexible Content এর acf_fc_layout নাম ধরে Dynamic Component Mapper
    const renderSection = (section, index) => {
        switch (section.acf_fc_layout) {
            case "hero_section":
                return <HeroSection key={index} />;
            case "popular_category":
                return <PopularCategory key={index} />;
            case "ads_banner_1":
                return <AdsBanner key={index} />;
            case "ads_banner_2":
                return <AdsBanner2 key={index} />;
            case "customer_feedback":
                return <CustomerFeedback key={index} />;
            case "category_product":
                return (
                    <CategoryProduct 
                        key={index} 
                        categorySlug={section.category_slug} 
                        categoryTitle={section.category_title} 
                    />
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="full-page-loader" style={{ textAlign: "center", padding: "100px 0" }}>
                <div className="spinner"></div>
                <p>Loading Home Layout...</p>
            </div>
        );
    }

    const hasSalesPopup = sections.some(s => s.acf_fc_layout === "sales_popup");

    return (
        <>
            <div id="content" className="site-content global-layout-no-sidebar">
                <div className="container">
                    <div className="inner-wrapper">
                        <div id="primary" className="content-area">
                            <main id="main" className="site-main">
                                {sections.map((section, index) => renderSection(section, index))}
                            </main>
                        </div>
                    </div>
                </div>
            </div>
            {hasSalesPopup && <SalesPopup />}
        </>
    );
};

export default Home;