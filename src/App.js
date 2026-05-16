import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./Pages/HomePage/Home";
import Footer from "./components/Footer/Footer";
import ShopPage from "./Pages/Shop/ShopPage";
import CartPage from "./Pages/CartPage/CartPage";
import CheckoutPage from "./Pages/CheckOut/CheckOut";
import ProductDetailsPage from "./Pages/ProductDetailsPage/ProductDetailsPage";
import CategoryProducts from "./Pages/CategoryProduct/ProductCategoryPage";
import BlogGridPage from "./Pages/Blog/BlogPageContent";
import ContactPageContent from "./Pages/ContactPage/ContactPageConent";
import BlogSinglePage from "./Pages/Blog/BlogSinglePage";
import MiniCart from "./components/SideBar/MiniCart";
import AboutPage from "./Pages/AboutPage/AboutPage";
import PrivacyPolicy from "./Pages/PrivacyPolicy/PrivacyPolicy";
import ReturnExchangePolicy from "./Pages/ReturnsRefunds/ReturnsRefunds";
import ShippingPolicy from "./Pages/ShippingPolicy/ShippingPolicy";
import OffersPage from "./Pages/Offers/Offers";
import MobileFooterNav from "./components/MobileFooterNav/MobileFooterNav";
import TermsAndConditions from "./Pages/TermsConditions/TermsAndConditions";
import TagManager from 'react-gtm-module';

// 🔥 THIS COMPONENT TRACKS PAGE VIEW ON EVERY ROUTE CHANGE
// function PixelTracker() {
//   const location = useLocation();

//   useEffect(() => {
//     if (window.fbq) {
//       window.fbq("track", "PageView");
//     }
//   }, [location]);

//   return null;
// }

const tagManagerArgs = {
  gtmId: 'GTM-KR68KTZG'
};

TagManager.initialize(tagManagerArgs);

function App() {
  const location = useLocation();

  useEffect(() => {

    const pageViewObj = {
      event: 'pageview',
      page: location.pathname + location.search,
      title: document.title
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(pageViewObj);
    
    console.log("GTM Triggered for:", location.pathname); // চেক করার জন্য
  }, [location]);
  return (
    <>
      {/* <PixelTracker /> */}
      <Header/>
      <MiniCart/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/blog" element={<BlogGridPage />} />
        <Route path="/blog/:slug" element={<BlogSinglePage />} />
        <Route path="/contact" element={<ContactPageContent />} />
        <Route path="/product/:slug" element={<ProductDetailsPage />} />
        <Route path="product-category/*" element={<CategoryProducts />} />
        <Route path="/about-us" element={<AboutPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/returns-refunds" element={<ReturnExchangePolicy />} />
        <Route path="/delivery-policy" element={<ShippingPolicy />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/terms-conditions" element={<TermsAndConditions />} />
      </Routes>
      <Footer />  
      <MobileFooterNav />
    </>
  );
}

export default App;
