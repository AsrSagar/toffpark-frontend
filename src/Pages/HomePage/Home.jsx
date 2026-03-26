import React, { useEffect, useState } from "react";
import HeroSection from "./HeroSection/HeroSection";
import PormoSection from "./PormoSection/PormoSection";
import AdsBanner from "./AdsBanner/AdsBanner";
import CustomerFeedback from "./CustomerFeedback/CustomerFeedback";
import CategoryProduct from "./CategoryProduct/CategoryProduct";
import HomeContent from "./HomeContent/HomeContent";
import SalesPopup from "../../components/SalesPopup/SalesPopup";
const Home = () => {

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500); 

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="full-page-loader">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }
    return (
        <>
        <div id="content" className="site-content global-layout-no-sidebar">
            <div className="container">
                <div className="inner-wrapper">
                    <div id="primary" className="content-area">
                        <main id="main" className="site-main" >
                            <HeroSection />
                            <PormoSection />
                            <CustomerFeedback />
                            <CategoryProduct categorySlug="112" categoryTitle="Kids Collections"/>
                            <CategoryProduct categorySlug="84"  categoryTitle="Most-wanted Shoes"/>
                            <AdsBanner />
                            <CategoryProduct categorySlug="83" categoryTitle="Casual Shoes"/>
                            <CategoryProduct categorySlug="86" categoryTitle="Formal Shoes"/>
                            <AdsBanner />
                            <CategoryProduct categorySlug="90" categoryTitle="Loafers"/>
                            <CategoryProduct categorySlug="92" categoryTitle="Sandals"/>
                            <AdsBanner />
                            <CategoryProduct categorySlug="89" categoryTitle="TOFFPARK Wallets"/>
                            <CategoryProduct categorySlug="93" categoryTitle="Socks"/>
                            <HomeContent />
                        </main>
                    </div>
                </div>
            </div>
        </div>
        <SalesPopup />
        </>
    );
};

export default Home;