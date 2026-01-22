import React, { useState } from 'react';
import { BACKEND_URL } from '../../services/api';

export default function CartItem({ item, onUpdate, onRemove }) {
    const [quantity, setQuantity] = useState(item.quantity);
    const [updating, setUpdating] = useState(false);

    const handleUpdateQuantity = async (newQuantity) => {
        if (newQuantity < 1) return;

        setUpdating(true);
        try {
            await onUpdate(item.cartItemId, newQuantity);
            setQuantity(newQuantity);
        } catch (error) {
            console.error('Error updating quantity:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleRemove = async () => {
        try {
            await onRemove(item.cartItemId);
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    return (
        <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="w-24 h-24 bg-gray-50 rounded-lg p-2 flex-shrink-0">
                <img
                    src={item.productImage ? `${BACKEND_URL}${item.productImage}` : '/placeholder-product.png'}
                    alt={item.productName}
                    className="w-full h-full object-contain"
                    onError={(e) => e.target.src = '/placeholder-product.png'}
                />
            </div>

            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                    {item.productName}
                </h3>
                <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                <p className="text-lg font-semibold text-blue-600 mt-1">
                    Rs. {item.unitPrice.toFixed(2)}
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded">
                    <button
                        onClick={() => handleUpdateQuantity(quantity - 1)}
                        disabled={updating || quantity <= 1}
                        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        -
                    </button>
                    <span className="px-4 py-1 border-l border-r border-gray-300">
                        {quantity}
                    </span>
                    <button
                        onClick={() => handleUpdateQuantity(quantity + 1)}
                        disabled={updating}
                        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        +
                    </button>
                </div>

                <div className="text-right min-w-[100px]">
                    <p className="text-lg font-bold text-gray-900">
                        Rs. {item.subtotal.toFixed(2)}
                    </p>
                </div>

                <button
                    onClick={handleRemove}
                    className="text-red-600 hover:text-red-800 p-2"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
