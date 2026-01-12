import React, { createContext, useContext, useState, useEffect } from 'react';
import * as cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            loadCart();
        } else {
            setCart(null);
            setCartCount(0);
        }
    }, [isAuthenticated]);

    const loadCart = async () => {
        try {
            setLoading(true);
            const data = await cartService.getCart();
            setCart(data);
            setCartCount(data.totalItems || 0);
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity) => {
        try {
            const data = await cartService.addItemToCart({ productId, quantity });
            setCart(data);
            setCartCount(data.totalItems || 0);
            return data;
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    };

    const updateItem = async (cartItemId, quantity) => {
        try {
            const data = await cartService.updateCartItem(cartItemId, quantity);
            setCart(data);
            setCartCount(data.totalItems || 0);
            return data;
        } catch (error) {
            console.error('Error updating cart item:', error);
            throw error;
        }
    };

    const removeItem = async (cartItemId) => {
        try {
            const data = await cartService.removeCartItem(cartItemId);
            setCart(data);
            setCartCount(data.totalItems || 0);
            return data;
        } catch (error) {
            console.error('Error removing cart item:', error);
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            await cartService.clearCart();
            setCart(null);
            setCartCount(0);
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    };

    const value = {
        cart,
        cartCount,
        loading,
        loadCart,
        addToCart,
        updateItem,
        removeItem,
        clearCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
