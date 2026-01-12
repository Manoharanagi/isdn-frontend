import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as deliveryService from '../../services/deliveryService';
import * as driverService from '../../services/driverService';
import * as orderService from '../../services/orderService';

export default function AssignDeliveryModal({ orderId, onClose, onSuccess }) {
    const [orders, setOrders] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [formData, setFormData] = useState({
        orderId: orderId || '',
        driverId: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const rdcId = 4; // Western RDC - Change this if your drivers are in a different RDC

    useEffect(() => {
        loadData();
        console.log('Loading orders and drivers for RDC ID:', rdcId);
    }, []);

    const loadData = async () => {
        try {
            // Get ALL confirmed orders (not just user's orders) and available drivers
            const [ordersData, driversData] = await Promise.all([
                orderService.getOrdersByStatus('CONFIRMED'),
                driverService.getAvailableDrivers(rdcId)
            ]);

            console.log('Confirmed Orders:', ordersData);
            console.log('Available Drivers:', driversData);

            setOrders(ordersData);
            setDrivers(driversData);

            if (ordersData.length === 0) {
                console.warn('No confirmed orders found. Make sure RDC staff has confirmed some orders.');
            }
            if (driversData.length === 0) {
                console.warn(`No available drivers found for RDC ${rdcId}. Check driver status and RDC assignment.`);
            }
        } catch (err) {
            setError('Failed to load data');
            toast.error('Failed to load data');
            console.error('Error loading data:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await deliveryService.assignDelivery({
                ...formData,
                orderId: parseInt(formData.orderId),
                driverId: parseInt(formData.driverId)
            });
            onSuccess();
            onClose();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to assign delivery';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Assign Delivery</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!orderId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Order
                            </label>
                            <select
                                name="orderId"
                                required
                                value={formData.orderId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select Order</option>
                                {orders.map(order => (
                                    <option key={order.orderId} value={order.orderId}>
                                        {order.orderNumber} - Rs. {order.totalAmount.toFixed(2)}
                                    </option>
                                ))}
                            </select>
                            {orders.length === 0 && (
                                <p className="text-sm text-gray-500 mt-1">No confirmed orders available</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Driver
                        </label>
                        <select
                            name="driverId"
                            required
                            value={formData.driverId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select Driver</option>
                            {drivers.map(driver => (
                                <option key={driver.driverId} value={driver.driverId}>
                                    {driver.name} - {driver.vehicleNumber} ({driver.vehicleType})
                                </option>
                            ))}
                        </select>
                        {drivers.length === 0 && (
                            <p className="text-sm text-red-600 mt-1">No available drivers</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (Optional)
                        </label>
                        <textarea
                            name="notes"
                            rows={3}
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Special instructions for driver"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || drivers.length === 0}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Assigning...' : 'Assign Delivery'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
