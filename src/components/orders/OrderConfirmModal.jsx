import React, { useState } from 'react';
import { toast } from 'react-toastify';
import * as orderService from '../../services/orderService';

export default function OrderConfirmModal({ order, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        try {
            setLoading(true);
            await orderService.confirmOrder(order.orderId);
            toast.success('Order confirmed successfully!');
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to confirm order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Confirm Order</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4 p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-semibold text-gray-900">{order.orderNumber}</p>

                    <p className="text-sm text-gray-600 mt-2">Total Amount</p>
                    <p className="font-semibold text-gray-900">Rs. {order.totalAmount.toFixed(2)}</p>

                    <p className="text-sm text-gray-600 mt-2">Customer</p>
                    <p className="font-semibold text-gray-900">{order.customerName || 'N/A'}</p>

                    <p className="text-sm text-gray-600 mt-2">Delivery Address</p>
                    <p className="text-gray-900">{order.deliveryAddress}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                    <p className="text-sm text-blue-800">
                        <strong>Confirming this order will:</strong>
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
                        <li>Change status from PENDING to CONFIRMED</li>
                        <li>Make it available for delivery assignment</li>
                        <li>Send confirmation notification to customer</li>
                    </ul>
                </div>

                <p className="text-gray-700 mb-4">
                    Are you sure you want to confirm this order?
                </p>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Confirming...' : 'Confirm Order'}
                    </button>
                </div>
            </div>
        </div>
    );
}
