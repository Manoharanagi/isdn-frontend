import api from './api';

/**
 * Get inventory for an RDC
 */
export const getInventoryByRdc = async (rdcId) => {
    const response = await api.get(`/inventory/rdc/${rdcId}`);
    return response.data;
};

/**
 * Get low stock items for an RDC
 */
export const getLowStockItems = async (rdcId) => {
    const response = await api.get(`/inventory/rdc/${rdcId}/low-stock`);
    return response.data;
};

/**
 * Update stock
 */
export const updateStock = async (inventoryId, updateData) => {
    const response = await api.put(`/inventory/${inventoryId}/update`, updateData);
    return response.data;
};

/**
 * Transfer stock between RDCs
 */
export const transferStock = async (transferData) => {
    const response = await api.post('/inventory/transfer', transferData);
    return response.data;
};

/**
 * Get stock movement history
 */
export const getStockMovementHistory = async (inventoryId) => {
    const response = await api.get(`/inventory/${inventoryId}/movements`);
    return response.data;
};

/**
 * Get all movements for an RDC
 */
export const getRdcMovements = async (rdcId) => {
    const response = await api.get(`/inventory/rdc/${rdcId}/movements`);
    return response.data;
};
