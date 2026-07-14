// import React, { useEffect, useState } from "react";
import HeroSection from "./HeroSection/HeroSection";
import AdsBanner from "./AdsBanner/AdsBanner";
import AdsBanner2 from "./AdsBanner/AdsBanner2";
import CustomerFeedback from "./CustomerFeedback/CustomerFeedback";
import CategoryProduct from "./CategoryProduct/CategoryProduct";
// import HomeContent from "./HomeContent/HomeContent";
import SalesPopup from "../../components/SalesPopup/SalesPopup";
import PopularCategory from "./PopularCategory/PopularCategory";
// import TestimonialSlider from "./TestimonialSlider/TestimonialSlider";
import { useEffect } from "react";
const Home = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setLoading(false);
    //     }, 1500); 

    //     return () => clearTimeout(timer);
    // }, []);

    // if (loading) {
    //     return (
    //         <div className="full-page-loader">
    //             <div className="spinner"></div>
    //             <p>Loading...</p>
    //         </div>
    //     );
    // }
    return (
        <>
        <div id="content" className="site-content global-layout-no-sidebar">
            <div className="container">
                <div className="inner-wrapper">
                    <div id="primary" className="content-area">
                        <main id="main" className="site-main" >
                            <HeroSection />
                            <PopularCategory />
                            <CategoryProduct categorySlug="84" categoryTitle="Top Selling Items"/>
                            <CustomerFeedback />
                            <CategoryProduct categorySlug="118"  categoryTitle="Kids Shoes"/>
                            <AdsBanner />
                            <CategoryProduct categorySlug="125" categoryTitle="Kids Clogs"/>
                            <CategoryProduct categorySlug="122" categoryTitle="Kids Sandals"/>
                            <AdsBanner2 />
                            <CategoryProduct categorySlug="119" categoryTitle="Kids Unisex Shoes"/>
                            <CategoryProduct categorySlug="126" categoryTitle="Kids Socks"/>
                            {/* <AdsBanner />
                            <CategoryProduct categorySlug="89" categoryTitle="TOFFPARK Wallets"/>
                            <CategoryProduct categorySlug="93" categoryTitle="Socks"/>
                            <HomeContent />
                            <TestimonialSlider /> */}
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