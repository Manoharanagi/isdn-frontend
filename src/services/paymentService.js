import api from './api';

const paymentService = {
  // Initiate payment for an order
  initiatePayment: async (orderId) => {
    const response = await api.post('/payments/initiate', { orderId });
    return response.data;
  },

  // Get payment status by reference
  getPaymentStatus: async (paymentReference) => {
    const response = await api.get(`/payments/status/${paymentReference}`);
    return response.data;
  },

  // Get all payments for an order
  getPaymentsByOrder: async (orderId) => {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data;
  },

  // Get user's payment history
  getPaymentHistory: async () => {
    const response = await api.get('/payments');
    return response.data;
  },
};

export default paymentService;
