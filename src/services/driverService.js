import api from './api';

/**
 * Get all drivers
 */
export const getAllDrivers = async () => {
    const response = await api.get('/drivers');
    return response.data;
};

/**
 * Get available drivers for RDC
 */
export const getAvailableDrivers = async (rdcId) => {
    const response = await api.get(`/drivers/available/${rdcId}`);
    return response.data;
};

/**
 * Get driver by ID
 */
export const getDriverById = async (driverId) => {
    const response = await api.get(`/drivers/${driverId}`);
    return response.data;
};

/**
 * Update driver location
 */
export const updateDriverLocation = async (driverId, locationData) => {
    const response = await api.put(`/drivers/${driverId}/location`, locationData);
    return response.data;
};

/**
 * Update driver status
 */
export const updateDriverStatus = async (driverId, status) => {
    const response = await api.put(`/drivers/${driverId}/status`, null, {
        params: { status }
    });
    return response.data;
};

/**
 * Get drivers by RDC
 */
export const getDriversByRdc = async (rdcId) => {
    const response = await api.get(`/drivers/rdc/${rdcId}`);
    return response.data;
};

/**
 * Create new driver
 */
export const createDriver = async (driverData) => {
    const response = await api.post('/drivers', driverData);
    return response.data;
};

/**
 * Update driver details
 */
export const updateDriver = async (driverId, driverData) => {
    const response = await api.put(`/drivers/${driverId}`, driverData);
    return response.data;
};

/**
 * Delete driver (soft delete)
 */
export const deleteDriver = async (driverId) => {
    const response = await api.delete(`/drivers/${driverId}`);
    return response.data;
};
