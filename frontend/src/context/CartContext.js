// src/context/CartContext.js
import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCartItems(JSON.parse(storedCart));
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ Add item to cart
  const addToCart = (item) => {
    const quantityToAdd = item.quantity || 1;
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i._id === item._id && i.restaurantId === item.restaurantId
      );

      if (existing) {
        return prev.map((i) =>
          i._id === item._id && i.restaurantId === item.restaurantId
            ? { ...i, quantity: i.quantity + quantityToAdd }
            : i
        );
      }

      return [...prev, { ...item, quantity: quantityToAdd }];
    });
  };

  // ✅ Remove item from cart
  const removeFromCart = (itemId, restaurantId) => {
    setCartItems((prev) =>
      prev.filter(
        (i) => !(i._id === itemId && i.restaurantId === restaurantId)
      )
    );
  };

  // ✅ Update item quantity
  const updateQuantity = (itemId, restaurantId, quantity) => {
    const safeQuantity = Math.max(1, quantity); // minimum 1
    setCartItems((prev) =>
      prev.map((i) =>
        i._id === itemId && i.restaurantId === restaurantId
          ? { ...i, quantity: safeQuantity }
          : i
      )
    );
  };

  // ✅ Clear entire cart
  const clearCart = () => setCartItems([]);

  // ✅ Total price
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};