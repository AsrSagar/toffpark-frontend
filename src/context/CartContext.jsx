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

  const addToCart = (product, qty = 1) => {
    const safeQty = Math.max(1, Number(qty) || 1);

    const standardizedProduct = {
      id: product.id,
      name: product.name,
      price: Number(product.price || product.prices?.price / 100) || 0,
      image: product.image || product.images?.[0]?.src || "",
      qty: safeQty,
    };

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === standardizedProduct.id);

      if (existing) {
        return prev.map((item) =>
          item.id === standardizedProduct.id
            ? { ...item, qty: item.qty + safeQty }
            : item
        );
      }

      return [...prev, standardizedProduct];
    });
  };

  const updateQuantity = (id, qty) => {
    const safeQty = Math.max(1, Number(qty) || 1);
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: safeQty } : item
      )
    );
  };

  const removeFromCart = (id) =>
    setCartItems((prev) => prev.filter((item) => item.id !== id));

  const clearCart = () => setCartItems([]);

  const isInCart = (productId) =>
    cartItems.some((item) => item.id === productId);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty, 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty * item.price, 0),
    [cartItems]
  );

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
