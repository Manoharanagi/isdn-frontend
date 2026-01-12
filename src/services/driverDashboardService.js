import api from './api';

/**
 * Get driver's own profile and statistics
 */
export const getMyProfile = async () => {
    const response = await api.get('/drivers/me');
    return response.data;
};

/**
 * Get driver's assigned deliveries
 */
export const getMyDeliveries = async () => {
    const response = await api.get('/drivers/me/deliveries');
    return response.data;
};

/**
 * Update driver's current GPS location
 */
export const updateLocation = async (locationData) => {
    const response = await api.put(`/drivers/${locationData.driverId}/location`, {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        speed: locationData.speed,
        heading: locationData.heading
    });
    return response.data;
};

/**
 * Update driver's availability status
 */
export const updateMyStatus = async (status) => {
    const response = await api.put('/drivers/me/status', null, {
        params: { status }
    });
    return response.data;
};

/**
 * Mark delivery as PICKED_UP
 */
export const markAsPickedUp = async (deliveryId, notes = null) => {
    const response = await api.put(`/deliveries/${deliveryId}/pickup`, {
        notes,
        currentLatitude: null,
        currentLongitude: null
    });
    return response.data;
};

/**
 * Start delivery (IN_TRANSIT)
 */
export const startDelivery = async (deliveryId, notes = null) => {
    const response = await api.put(`/deliveries/${deliveryId}/start`, {
        notes,
        currentLatitude: null,
        currentLongitude: null
    });
    return response.data;
};

/**
 * Mark as ARRIVED at customer location
 */
export const markAsArrived = async (deliveryId, notes = null) => {
    const response = await api.put(`/deliveries/${deliveryId}/arrive`, {
        notes,
        currentLatitude: null,
        currentLongitude: null
    });
    return response.data;
};

/**
 * Complete delivery
 */
export const completeDelivery = async (deliveryId, completionData) => {
    const response = await api.put(`/deliveries/${deliveryId}/complete`, {
        recipientName: completionData.recipientName,
        deliveryNotes: completionData.deliveryNotes,
        currentLatitude: completionData.latitude,
        currentLongitude: completionData.longitude,
        photoUrl: completionData.photoUrl
    });
    return response.data;
};

/**
 * Upload delivery proof photo
 */
export const uploadDeliveryProof = async (deliveryId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/deliveries/${deliveryId}/proof`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};
