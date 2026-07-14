import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1, selectedVariation = null) => {
    const safeQty = Math.max(1, Number(qty) || 1);
    const variationId = selectedVariation?.id || null;
    
    // --- Price Logic ---
    const source = selectedVariation || product;
    let finalPrice = 0;
    let regPrice = 0;
    let slPrice = null;

    // ১. সেল ডেট এক্সপায়ার হয়েছে কিনা তা চেক করার লজিক
    const isSaleActive = () => {
      const now = new Date();
      
      // WooCommerce API থেকে ডেট নিয়ে আসা (যদি থাকে)
      const saleFrom = source.date_on_sale_from ? new Date(source.date_on_sale_from) : null;
      const saleTo = source.date_on_sale_to ? new Date(source.date_on_sale_to) : null;

      // যদি কোনো ডেট সেট করা না থাকে, তাহলে ধরে নেওয়া হবে সেল একটিভ আছে
      if (!saleFrom && !saleTo) return true; 
      
      // যদি শুরুর ডেট বাকি থাকে
      if (saleFrom && now < saleFrom) return false;
      
      // যদি শেষের ডেট পার হয়ে যায় (Expired)
      if (saleTo && now > saleTo) return false;

      return true;
    };

    const saleValid = isSaleActive();

    if (source?.prices) {
      // WooCommerce Store API structure handle korar jonno
      const { sale_price, regular_price, currency_minor_unit } = source.prices;
      const divisor = Math.pow(10, currency_minor_unit || 2);

      regPrice = Number(regular_price) / divisor;
      
      // সেল ভ্যালিড হলেই কেবল sale_price কাউন্ট হবে, নয়তো null
      slPrice = sale_price && saleValid ? Number(sale_price) / divisor : null;
      finalPrice = slPrice !== null ? slPrice : regPrice;
    } else {
      // Fallback: Jodi structure simple hoy (Standard REST API)
      regPrice = Number(source.regular_price || source.price || 0);
      
      // সেল ভ্যালিড হলেই কেবল sale_price কাউন্ট হবে
      slPrice = source.sale_price && saleValid ? Number(source.sale_price) : null;
      finalPrice = slPrice && slPrice > 0 ? slPrice : regPrice;
    }

    // Size attribute khuje ber kora
    const size = product.size || selectedVariation?.attributes?.find(
      (attr) => attr.name.toLowerCase() === "size" || attr.slug === "pa_size"
    )?.option || null;

    // Unique Cart ID (Product ID + Variation ID combination)
    const cartId = variationId 
    ? `${product.id}-${variationId}` 
    : (product.size ? `${product.id}-${product.size}` : `${product.id}`);

    const standardizedProduct = {
      cartId,
      productId: product.id,
      variationId,
      name: product.name,
      size, 
      price: finalPrice,
      regularPrice: regPrice,
      salePrice: slPrice,
      image: product.images?.[0]?.src || product.image || "", 
      qty: safeQty,
    };

    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartId === cartId);
      if (existing) {
        return prev.map((item) =>
          item.cartId === cartId ? { ...item, qty: item.qty + safeQty } : item
        );
      }
      return [...prev, standardizedProduct];
    });
  };

  const updateQuantity = (cartId, qty) => {
    const safeQty = Math.max(1, Number(qty) || 1);
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, qty: safeQty } : item
      )
    );
  };

  const removeFromCart = (cartId) =>
    setCartItems((prev) =>
      prev.filter((item) => item.cartId !== cartId)
    );

  const clearCart = () => setCartItems([]);

  const isInCart = (productId, variationId = null) => {
    const cartId = variationId ? `${productId}-${variationId}` : `${productId}`;
    return cartItems.some((item) => item.cartId === cartId);
  };

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty, 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty * item.price, 0),
    [cartItems]
  );

  const [cartOpen, setCartOpen] = useState(false);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
        isInCart,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);