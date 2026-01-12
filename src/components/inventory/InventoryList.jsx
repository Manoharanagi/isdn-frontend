import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as inventoryService from '../../services/inventoryService';
import StockUpdateModal from './StockUpdateModal';
import StockMovementModal from './StockMovementModal';
import Loader from '../common/Loader';

export default function InventoryList() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInventory, setSelectedInventory] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showMovementModal, setShowMovementModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Hardcoded RDC ID - In real app, get from user context
    const rdcId = 4; // Western RDC

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            setLoading(true);
            const data = await inventoryService.getInventoryByRdc(rdcId);
            setInventory(data);
            setError(null);
        } catch (err) {
            setError('Failed to load inventory');
            toast.error('Failed to load inventory');
            console.error('Error loading inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStock = (item) => {
        setSelectedInventory(item);
        setShowUpdateModal(true);
    };

    const handleViewMovements = (item) => {
        setSelectedInventory(item);
        setShowMovementModal(true);
    };

    const handleUpdateComplete = () => {
        setShowUpdateModal(false);
        loadInventory();
    };

    const getStatusColor = (status) => {
        const colors = {
            'OK': 'bg-green-100 text-green-800',
            'LOW_STOCK': 'bg-yellow-100 text-yellow-800',
            'OUT_OF_STOCK': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const filteredInventory = inventory.filter(item => {
        if (filterStatus === 'ALL') return true;
        return item.status === filterStatus;
    });

    if (loading) return <Loader />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-600">Western RDC</p>
                </div>
                <button
                    onClick={loadInventory}
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

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex gap-4">
                    <button
                        onClick={() => setFilterStatus('ALL')}
                        className={`px-4 py-2 rounded-lg transition ${
                            filterStatus === 'ALL'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        All Items
                    </button>
                    <button
                        onClick={() => setFilterStatus('LOW_STOCK')}
                        className={`px-4 py-2 rounded-lg transition ${
                            filterStatus === 'LOW_STOCK'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Low Stock
                    </button>
                    <button
                        onClick={() => setFilterStatus('OUT_OF_STOCK')}
                        className={`px-4 py-2 rounded-lg transition ${
                            filterStatus === 'OUT_OF_STOCK'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Out of Stock
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                SKU
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reorder Level
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Updated
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInventory.map(item => (
                            <tr key={item.inventoryId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {item.productName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{item.productSku}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {item.quantityOnHand} units
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {item.reorderLevel} units
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                        {item.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(item.lastUpdated).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => handleUpdateStock(item)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Update
                                    </button>
                                    <button
                                        onClick={() => handleViewMovements(item)}
                                        className="text-gray-600 hover:text-gray-900"
                                    >
                                        History
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredInventory.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No inventory items found
                    </div>
                )}
            </div>

            {showUpdateModal && selectedInventory && (
                <StockUpdateModal
                    inventory={selectedInventory}
                    onClose={() => setShowUpdateModal(false)}
                    onSuccess={handleUpdateComplete}
                />
            )}

            {showMovementModal && selectedInventory && (
                <StockMovementModal
                    inventory={selectedInventory}
                    onClose={() => setShowMovementModal(false)}
                />
            )}
        </div>
    );
}
