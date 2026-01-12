import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as driverService from '../../services/driverService';
import CreateDriverModal from './CreateDriverModal';
import UpdateDriverModal from './UpdateDriverModal';

export default function DriverManagement() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [selectedRdc, setSelectedRdc] = useState('all');

    useEffect(() => {
        loadDrivers();
    }, [selectedRdc]);

    const loadDrivers = async () => {
        try {
            setLoading(true);
            let data;
            if (selectedRdc === 'all') {
                data = await driverService.getAllDrivers();
            } else {
                data = await driverService.getDriversByRdc(parseInt(selectedRdc));
            }
            setDrivers(data);
        } catch (err) {
            toast.error('Failed to load drivers');
            console.error('Error loading drivers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        loadDrivers();
    };

    const handleUpdateSuccess = () => {
        setShowUpdateModal(false);
        setSelectedDriver(null);
        loadDrivers();
    };

    const handleEdit = (driver) => {
        setSelectedDriver(driver);
        setShowUpdateModal(true);
    };

    const handleDelete = async (driver) => {
        if (!window.confirm(`Are you sure you want to delete driver ${driver.fullName || driver.name}?`)) {
            return;
        }

        try {
            await driverService.deleteDriver(driver.driverId);
            toast.success('Driver deleted successfully');
            loadDrivers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete driver');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'AVAILABLE':
                return 'bg-green-100 text-green-800';
            case 'ON_DELIVERY':
                return 'bg-blue-100 text-blue-800';
            case 'OFF_DUTY':
                return 'bg-gray-100 text-gray-800';
            case 'ON_BREAK':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Loading drivers...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    + Create Driver
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Filter by RDC:</label>
                    <select
                        value={selectedRdc}
                        onChange={(e) => setSelectedRdc(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All RDCs</option>
                        <option value="1">Northern RDC</option>
                        <option value="2">Southern RDC</option>
                        <option value="3">Eastern RDC</option>
                        <option value="4">Western RDC</option>
                    </select>
                </div>
            </div>

            {drivers.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-600 text-lg">No drivers found</p>
                    <p className="text-gray-500 mt-2">Click "Create Driver" to add a new driver</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Driver ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vehicle
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        RDC
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
                                {drivers.map((driver) => (
                                    <tr key={driver.driverId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {driver.driverId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {driver.fullName || driver.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {driver.username}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {driver.phoneNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div>{driver.vehicleNumber}</div>
                                            <div className="text-xs text-gray-500">{driver.vehicleType}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {driver.rdcName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(driver.status)}`}>
                                                {driver.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleEdit(driver)}
                                                className="text-blue-600 hover:text-blue-800 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(driver)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <CreateDriverModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {showUpdateModal && selectedDriver && (
                <UpdateDriverModal
                    driver={selectedDriver}
                    onClose={() => {
                        setShowUpdateModal(false);
                        setSelectedDriver(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
}
