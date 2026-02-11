import React from "react";
import HeroSection from "./HeroSection/HeroSection";
import PormoSection from "./PormoSection/PormoSection";
import PopularCategory from "./PopularCategory/PopularCategory";
import FeaturedProducts from "./FeaturedProducts/FeaturedProducts";
import CallToAction from "./CallToAction/CallToAction";
import NewProducts from "./NewProducts/NewProducts";
import AdsBanner from "./AdsBanner/AdsBanner";
import PopularProducts from "./PopularProducts/PopularProducts";
import AssociateLogos from "./AssociateLogos/AssociateLogos";
import ProductSidebar from "./ProductSidebar/ProductSidebar";
import RecentNews from "./RecentNews/RecentNews";
import Newsletter from "./Newsletter/Newsletter";
import InstagramSection from "./InstagramSection/InstagramSection";


const Home = () => {
    return (
        <>
        <div id="content" className="site-content global-layout-no-sidebar">
            <div className="container">
                <div className="inner-wrapper">
                    <div id="primary" className="content-area">
                        <main id="main" className="site-main" >
                            <HeroSection />
                            <PormoSection />
                            <PopularCategory />
                            <FeaturedProducts />
                            <CallToAction />
                            <NewProducts />
                            <AdsBanner />
                            <PopularProducts />
                            <AssociateLogos />
                            <ProductSidebar />
                            <RecentNews />
                            <Newsletter />
                            <InstagramSection />
                        </main>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default Home;