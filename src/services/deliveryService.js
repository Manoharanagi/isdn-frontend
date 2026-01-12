import api from './api';

/**
 * Assign delivery to driver
 */
export const assignDelivery = async (assignData) => {
    const response = await api.post('/deliveries/assign', assignData);
    return response.data;
};

/**
 * Update delivery status
 */
export const updateDeliveryStatus = async (deliveryId, statusData) => {
    const response = await api.put(`/deliveries/${deliveryId}/status`, statusData);
    return response.data;
};

/**
 * Get deliveries by RDC
 */
export const getDeliveriesByRdc = async (rdcId) => {
    const response = await api.get(`/deliveries/rdc/${rdcId}`);
    return response.data;
};

/**
 * Get deliveries by driver
 */
export const getDeliveriesByDriver = async (driverId) => {
    const response = await api.get(`/deliveries/driver/${driverId}`);
    return response.data;
};

/**
 * Get active deliveries
 */
export const getActiveDeliveries = async () => {
    const response = await api.get('/deliveries/active');
    return response.data;
};

/**
 * Get delivery by ID
 */
export const getDeliveryById = async (deliveryId) => {
    const response = await api.get(`/deliveries/${deliveryId}`);
    return response.data;
};

/**
 * Get delivery by order ID
 */
export const getDeliveryByOrderId = async (orderId) => {
    const response = await api.get(`/deliveries/order/${orderId}`);
    return response.data;
};
