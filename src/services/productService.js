import api from './api';

export const getAllProducts = async () => {
    const response = await api.get('/products');
    console.log('Products API response:', response.data); 
    return response.data;
};

export const getProductById = async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
};

export const searchProducts = async (searchRequest) => {
    const response = await api.post('/products/search', searchRequest);
    return response.data;
};

export const getProductsByCategory = async (category) => {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
};

export const getPromotionalProducts = async () => {
    const response = await api.get('/products/promotions');
    return response.data;
};
