import React, { useState, useEffect } from 'react';
import * as inventoryService from '../../services/inventoryService';

export default function StockMovementModal({ inventory, onClose }) {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMovements();
    }, []);

    const loadMovements = async () => {
        try {
            setLoading(true);
            const data = await inventoryService.getStockMovementHistory(inventory.inventoryId);
            setMovements(data);
        } catch (err) {
            console.error('Error loading movements:', err);
        } finally {
            setLoading(false);
        }
    };

    const getMovementTypeColor = (type) => {
        const colors = {
            'RECEIVED': 'text-green-600',
            'SOLD': 'text-blue-600',
            'DAMAGED': 'text-red-600',
            'RETURNED': 'text-purple-600',
            'TRANSFERRED_OUT': 'text-orange-600',
            'TRANSFERRED_IN': 'text-indigo-600',
            'ADJUSTMENT': 'text-gray-600'
        };
        return colors[type] || 'text-gray-600';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Stock Movement History</h2>
                        <p className="text-gray-600">{inventory.productName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                    </div>
                ) : movements.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No movement history found
                    </div>
                ) : (
                    <div className="space-y-4">
                        {movements.map(movement => (
                            <div key={movement.movementId} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className={`font-semibold ${getMovementTypeColor(movement.movementType)}`}>
                                            {movement.movementType.replace('_', ' ')}
                                        </span>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {new Date(movement.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Quantity</p>
                                        <p className="font-semibold text-lg">{movement.quantity}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Previous Stock</p>
                                        <p className="font-medium">{movement.previousStock} units</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">New Stock</p>
                                        <p className="font-medium">{movement.newStock} units</p>
                                    </div>
                                </div>

                                {movement.reason && (
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-600">Reason</p>
                                        <p className="text-gray-900">{movement.reason}</p>
                                    </div>
                                )}

                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        Performed by: <span className="font-medium">{movement.performedBy}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
