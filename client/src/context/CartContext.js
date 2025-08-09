import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useContext(UserContext);

  // FIX: Wrap fetchCart in useCallback to memoize the function.
  const fetchCart = useCallback(async () => {
    if (user) {
      try {
        const res = await axios.get('/api/cart');
        setCartItems(res.data);
      } catch (err) {
        console.error("Failed to fetch cart", err);
        setCartItems([]);
      }
    } else {
      // If there's no user, ensure the cart is empty.
      setCartItems([]);
    }
  }, [user]); // The function only changes if the user object changes.

  useEffect(() => {
    fetchCart();
  }, [fetchCart]); // FIX: Add the memoized fetchCart function to the dependency array.

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await axios.post('/api/cart/add', { productId, quantity });
      setCartItems(res.data);
    } catch (err) { console.error("Failed to add to cart", err); }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await axios.delete(`/api/cart/remove/${productId}`);
      setCartItems(res.data);
    } catch (err) { console.error("Failed to remove from cart", err); }
  };
  
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, fetchCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
