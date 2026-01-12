import api from './api';

export const getCart = async () => {
    const response = await api.get('/cart');
    return response.data;
};

export const addItemToCart = async (item) => {
    const response = await api.post('/cart/items', item);
    return response.data;
};

export const updateCartItem = async (cartItemId, quantity) => {
    const response = await api.put(`/cart/items/${cartItemId}`, { quantity });
    return response.data;
};

export const removeCartItem = async (cartItemId) => {
    const response = await api.delete(`/cart/items/${cartItemId}`);
    return response.data;
};

export const clearCart = async () => {
    const response = await api.delete('/cart');
    return response.data;
};
