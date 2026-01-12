import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as orderService from '../../services/orderService';
import Loader from '../common/Loader';

export default function OrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getUserOrders();
            setOrders(data);
            setError(null);
        } catch (err) {
            setError('Failed to load orders');
            console.error('Error loading orders:', err);
        } finally {
            setLoading(false);
        }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">No orders yet</h2>
                    <p className="mt-2 text-gray-600">Start shopping to place your first order</p>
                    <Link
                        to="/products"
                        className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.orderId} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Order #{order.orderNumber}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Placed on {new Date(order.orderDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                    {order.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-600">Delivery Address:</p>
                                    <p className="text-gray-900">{order.deliveryAddress}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Payment Method:</p>
                                    <p className="text-gray-900">{order.paymentMethod.replace('_', ' ')}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                                <div>
                                    <p className="text-sm text-gray-600">Total Amount:</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        Rs. {order.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                                <Link
                                    to={`/orders/${order.orderId}`}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
