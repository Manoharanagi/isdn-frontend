import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as orderService from '../../services/orderService';
import OrderConfirmModal from './OrderConfirmModal';
import Loader from '../common/Loader';

export default function OrderManagement() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        loadOrders();
    }, [filterStatus]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            let data;

            if (filterStatus === 'ALL') {
                data = await orderService.getAllOrders();
            } else {
                data = await orderService.getOrdersByStatus(filterStatus);
            }

            setOrders(data);
            setError(null);
        } catch (err) {
            setError('Failed to load orders');
            toast.error('Failed to load orders');
            console.error('Error loading orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to confirm this order?')) {
            return;
        }

        try {
            await orderService.confirmOrder(orderId);
            toast.success('Order confirmed successfully!');
            loadOrders();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to confirm order');
        }
    };

    const handleViewDetails = (order) => {
        navigate(`/orders/${order.orderId}`);
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-blue-100 text-blue-800',
            PROCESSING: 'bg-purple-100 text-purple-800',
            READY_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
            OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
            DELIVERED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
            FAILED_DELIVERY: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) return <Loader />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-gray-600">Manage and confirm customer orders</p>
                </div>
                <button
                    onClick={loadOrders}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Status Filter */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="font-semibold mb-3">Filter by Status</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterStatus('ALL')}
                        className={`px-4 py-2 rounded-lg transition ${
                            filterStatus === 'ALL'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        All Orders
                    </button>
                    <button
                        onClick={() => setFilterStatus('PENDING')}
                        className={`px-4 py-2 rounded-lg transition ${
                            filterStatus === 'PENDING'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilterStatus('CONFIRMED')}
                        className={`px-4 py-2 rounded-lg transition ${
                            filterStatus === 'CONFIRMED'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Confirmed
                    </button>
                    <button
                        onClick={() => setFilterStatus('OUT_FOR_DELIVERY')}
                        className={`px-4 py-2 rounded-lg transition ${
                            filterStatus === 'OUT_FOR_DELIVERY'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Out for Delivery
                    </button>
                    <button
                        onClick={() => setFilterStatus('DELIVERED')}
                        className={`px-4 py-2 rounded-lg transition ${
                            filterStatus === 'DELIVERED'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Delivered
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold">
                        Orders ({orders.length})
                    </h2>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No orders found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map(order => (
                                    <tr key={order.orderId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.orderNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {order.customerName || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.contactNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.orderDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                Rs. {order.totalAmount.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {order.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleConfirmOrder(order.orderId)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Confirm
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleViewDetails(order)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showConfirmModal && selectedOrder && (
                <OrderConfirmModal
                    order={selectedOrder}
                    onClose={() => {
                        setShowConfirmModal(false);
                        setSelectedOrder(null);
                    }}
                    onSuccess={loadOrders}
                />
            )}
        </div>
    );
}
