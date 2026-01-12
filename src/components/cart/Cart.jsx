import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import Loader from '../common/Loader';

export default function Cart() {
    const { cart, loading, updateItem, removeItem, clearCart } = useCart();
    const navigate = useNavigate();

    const handleClearCart = async () => {
        if (!window.confirm('Are you sure you want to clear your cart?')) {
            return;
        }
        try {
            await clearCart();
            toast.success('Cart cleared successfully!');
        } catch (err) {
            toast.error('Failed to clear cart');
        }
    };

    const handleUpdateItem = async (cartItemId, quantity) => {
        try {
            await updateItem(cartItemId, quantity);
            toast.success('Quantity updated!');
        } catch (err) {
            toast.error('Failed to update quantity');
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            await removeItem(cartItemId);
            toast.success('Item removed from cart!');
        } catch (err) {
            toast.error('Failed to remove item');
        }
    };

    if (loading) return <Loader />;

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-md mx-auto text-center">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
                    <p className="mt-2 text-gray-600">Start shopping to add items to your cart</p>
                    <Link
                        to="/products"
                        className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-800 font-medium"
                >
                    Clear Cart
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cart.items.map(item => (
                        <CartItem
                            key={item.cartItemId}
                            item={item}
                            onUpdate={handleUpdateItem}
                            onRemove={handleRemoveItem}
                        />
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Items ({cart.totalItems})</span>
                                <span>Rs. {cart.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery</span>
                                <span className="text-green-600">FREE</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span className="text-blue-600">Rs. {cart.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                            Proceed to Checkout
                        </button>

                        <Link
                            to="/products"
                            className="block w-full mt-3 py-3 bg-gray-200 text-gray-800 text-center font-semibold rounded-lg hover:bg-gray-300 transition"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
