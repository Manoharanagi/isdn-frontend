import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import * as orderService from '../../services/orderService';
import Loader from '../common/Loader';

export default function Checkout() {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        deliveryAddress: '',
        contactNumber: '',
        paymentMethod: 'CASH_ON_DELIVERY',
        notes: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fix: Move navigation to useEffect to avoid render-time setState
    useEffect(() => {
        if (!cart || cart.items.length === 0) {
            navigate('/cart');
        }
    }, [cart, navigate]);

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
            const order = await orderService.placeOrder(formData);
            await clearCart();
            toast.success('Order placed successfully!');
            navigate(`/orders/${order.orderId}`);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to place order. Please try again.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!cart || cart.items.length === 0) {
        return <Loader />;
    }

    if (loading) return <Loader />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Delivery Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Delivery Address *
                                    </label>
                                    <textarea
                                        name="deliveryAddress"
                                        required
                                        rows={3}
                                        value={formData.deliveryAddress}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter your full delivery address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="contactNumber"
                                        required
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="+94 77 123 4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Delivery Notes (Optional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        rows={2}
                                        value={formData.notes}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Any special instructions for delivery"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Payment Method</h2>

                            <div className="space-y-3">
                                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="CASH_ON_DELIVERY"
                                        checked={formData.paymentMethod === 'CASH_ON_DELIVERY'}
                                        onChange={handleChange}
                                        className="mr-3"
                                    />
                                    <div>
                                        <div className="font-semibold">Cash on Delivery</div>
                                        <div className="text-sm text-gray-500">Pay when you receive your order</div>
                                    </div>
                                </label>

                                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="BANK_TRANSFER"
                                        checked={formData.paymentMethod === 'BANK_TRANSFER'}
                                        onChange={handleChange}
                                        className="mr-3"
                                    />
                                    <div>
                                        <div className="font-semibold">Bank Transfer</div>
                                        <div className="text-sm text-gray-500">Transfer to our bank account</div>
                                    </div>
                                </label>

                                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="ONLINE_PAYMENT"
                                        checked={formData.paymentMethod === 'ONLINE_PAYMENT'}
                                        onChange={handleChange}
                                        className="mr-3"
                                    />
                                    <div>
                                        <div className="font-semibold">Online Payment</div>
                                        <div className="text-sm text-gray-500">Pay securely online</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                        <div className="space-y-3 mb-4">
                            {cart.items.map(item => (
                                <div key={item.cartItemId} className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        {item.productName} x {item.quantity}
                                    </span>
                                    <span className="text-gray-900 font-medium">
                                        Rs. {item.subtotal.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-3 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>Rs. {cart.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery</span>
                                <span className="text-green-600">FREE</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold pt-2 border-t">
                                <span>Total</span>
                                <span className="text-blue-600">Rs. {cart.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
