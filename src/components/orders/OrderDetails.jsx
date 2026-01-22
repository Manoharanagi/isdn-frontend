import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as orderService from '../../services/orderService';
import { BACKEND_URL } from '../../services/api';
import Loader from '../common/Loader';
import PayHerePayment from '../payment/PayHerePayment';

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrderById(id);
            setOrder(data);
            setError(null);
        } catch (err) {
            setError('Failed to load order details');
            console.error('Error loading order:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            await orderService.cancelOrder(id);
            await loadOrder();
            toast.success('Order cancelled successfully');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to cancel order';
            setError(errorMsg);
            toast.error(errorMsg);
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

    const canCancelOrder = (status) => {
        return status === 'PENDING' || status === 'CONFIRMED';
    };

    const showPaymentButton = () => {
        return order?.paymentMethod === 'ONLINE_PAYMENT' && order?.status === 'PENDING';
    };

    const handlePaymentError = (err) => {
        console.error('Payment error:', err);
        toast.error(err.response?.data?.message || 'Payment failed');
    };

    if (loading) return <Loader />;
    if (!order) return <div>Order not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/orders')}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Orders
            </button>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order #{order.orderNumber}
                        </h1>
                        <p className="text-gray-600">
                            Placed on {new Date(order.orderDate).toLocaleString()}
                        </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Delivery Information</h3>
                        <p className="text-gray-600 mb-1">
                            <span className="font-medium">Address:</span> {order.deliveryAddress}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">Contact:</span> {order.contactNumber}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                        <p className="text-gray-600 mb-1">
                            <span className="font-medium">Payment Method:</span> {order.paymentMethod.replace('_', ' ')}
                        </p>
                        <p className="text-gray-600 mb-1">
                            <span className="font-medium">Estimated Delivery:</span>{' '}
                            {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'TBD'}
                        </p>
                        {order.actualDeliveryDate && (
                            <p className="text-gray-600">
                                <span className="font-medium">Delivered On:</span>{' '}
                                {new Date(order.actualDeliveryDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>

                {order.notes && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Delivery Notes</h3>
                        <p className="text-gray-600">{order.notes}</p>
                    </div>
                )}

                <div className="flex flex-wrap gap-4">
                    {canCancelOrder(order.status) && (
                        <button
                            onClick={handleCancelOrder}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Cancel Order
                        </button>
                    )}
                </div>

                {showPaymentButton() && (
                    <div className="mt-6 pt-6 border-t">
                        <h3 className="font-semibold text-gray-900 mb-4">Complete Payment</h3>
                        <div className="max-w-sm">
                            <PayHerePayment
                                orderId={order.orderId}
                                onError={handlePaymentError}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>

                <div className="space-y-4">
                    {order.items.map(item => (
                        <div key={item.orderItemId} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                            <div className="w-20 h-20 bg-gray-50 rounded-lg p-2 flex-shrink-0">
                                <img
                                    src={item.productImage ? `${BACKEND_URL}${item.productImage}` : '/placeholder-product.png'}
                                    alt={item.productName}
                                    className="w-full h-full object-contain"
                                    onError={(e) => e.target.src = '/placeholder-product.png'}
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                                <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                                <p className="text-sm text-gray-600">
                                    Rs. {item.unitPrice.toFixed(2)} x {item.quantity}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">
                                    Rs. {item.subtotal.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">Total Amount:</span>
                        <span className="text-2xl font-bold text-blue-600">
                            Rs. {order.totalAmount.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
