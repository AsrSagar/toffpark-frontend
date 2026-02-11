import React from "react";
import { Route, Routes } from "react-router-dom";
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

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/blog" element={<BlogGridPage />} />
        <Route path="/contact" element={<ContactPageContent />} />
        <Route path="/product/:slug" element={<ProductDetailsPage />} />
        <Route path="product-category/*" element={<CategoryProducts />} />
      </Routes>
      <Footer />  
    </>
  );
}

export default App;
