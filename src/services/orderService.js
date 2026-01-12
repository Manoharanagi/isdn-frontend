import api from './api';

export const placeOrder = async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
};

export const getUserOrders = async () => {
    const response = await api.get('/orders');
    return response.data;
};

export const getOrderById = async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
};

export const getOrderByNumber = async (orderNumber) => {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return response.data;
};

export const cancelOrder = async (orderId) => {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
};

/**
 * Get all orders (staff only)
 */
export const getAllOrders = async () => {
    const response = await api.get('/orders/all');
    return response.data;
};

/**
 * Get orders by status
 */
export const getOrdersByStatus = async (status) => {
    const response = await api.get(`/orders/status/${status}`);
    return response.data;
};

/**
 * Confirm order (PENDING → CONFIRMED)
 */
export const confirmOrder = async (orderId) => {
    const response = await api.put(`/orders/${orderId}/confirm`);
    return response.data;
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId, statusData) => {
    const response = await api.put(`/orders/${orderId}/status`, statusData);
    return response.data;
};

/**
 * Get orders by RDC
 */
export const getOrdersByRdc = async (rdcId) => {
    const response = await api.get(`/orders/rdc/${rdcId}`);
    return response.data;
};
