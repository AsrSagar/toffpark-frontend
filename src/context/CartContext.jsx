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

  // 🔥 Smart WooCommerce Price Resolver
  const resolvePrice = (product, variation = null) => {
    const source = variation || product;

    if (source?.prices) {
      const {
        price,
        sale_price,
        regular_price,
        currency_minor_unit,
      } = source.prices;

      const divisor = Math.pow(10, currency_minor_unit || 2);

      if (sale_price && Number(sale_price) > 0)
        return Number(sale_price) / divisor;

      if (regular_price && Number(regular_price) > 0)
        return Number(regular_price) / divisor;

      if (price && Number(price) > 0)
        return Number(price) / divisor;
    }

    if (source?.price) {
      return Number(source.price);
    }

    return 0;
  };

  const addToCart = (product, qty = 1, selectedVariation = null) => {
    const safeQty = Math.max(1, Number(qty) || 1);
    const finalPrice = resolvePrice(product, selectedVariation);

    const variationId = selectedVariation?.id || null;
    const size =
      selectedVariation?.attributes?.find(
        (attr) =>
          attr.name.toLowerCase() === "size" ||
          attr.slug === "pa_size"
      )?.option || null;

    // 🔑 Unique cart ID (product + variation)
    const cartId = variationId ? `${product.id}-${variationId}` : `${product.id}`;

    const standardizedProduct = {
      cartId,
      productId: product.id,
      variationId,
      name: product.name,
      size,
      price: finalPrice,
      image: product.images?.[0]?.src || "",
      qty: safeQty,
    };

    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartId === cartId);

      if (existing) {
        return prev.map((item) =>
          item.cartId === cartId
            ? { ...item, qty: item.qty + safeQty }
            : item
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
    const cartId = variationId
      ? `${productId}-${variationId}`
      : `${productId}`;

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