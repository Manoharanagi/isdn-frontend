import React, { useState } from 'react';
import { toast } from 'react-toastify';
import * as driverService from '../../services/driverService';

export default function UpdateDriverModal({ driver, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        fullName: driver.fullName || driver.name || '',
        email: driver.email || '',
        phoneNumber: driver.phoneNumber || '',
        vehicleNumber: driver.vehicleNumber || '',
        vehicleType: driver.vehicleType || '',
        licenseNumber: driver.licenseNumber || '',
        rdcId: driver.rdcId || '',
        status: driver.status || 'AVAILABLE'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            await driverService.updateDriver(driver.driverId, {
                ...formData,
                rdcId: parseInt(formData.rdcId)
            });
            toast.success('Driver updated successfully!');
            onSuccess();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to update driver';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Update Driver</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="mb-4 p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Driver ID</p>
                    <p className="font-semibold text-gray-900">{driver.driverId}</p>
                    <p className="text-sm text-gray-600 mt-2">Username</p>
                    <p className="font-semibold text-gray-900">{driver.username}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                required
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                License Number *
                            </label>
                            <input
                                type="text"
                                name="licenseNumber"
                                required
                                value={formData.licenseNumber}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vehicle Number *
                            </label>
                            <input
                                type="text"
                                name="vehicleNumber"
                                required
                                value={formData.vehicleNumber}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vehicle Type *
                            </label>
                            <select
                                name="vehicleType"
                                required
                                value={formData.vehicleType}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select Type</option>
                                <option value="VAN">Van</option>
                                <option value="TRUCK">Truck</option>
                                <option value="BIKE">Bike</option>
                                <option value="CAR">Car</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Assigned RDC *
                            </label>
                            <select
                                name="rdcId"
                                required
                                value={formData.rdcId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select RDC</option>
                                <option value="1">Northern RDC</option>
                                <option value="2">Southern RDC</option>
                                <option value="3">Eastern RDC</option>
                                <option value="4">Western RDC</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status *
                            </label>
                            <select
                                name="status"
                                required
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="AVAILABLE">Available</option>
                                <option value="ON_DELIVERY">On Delivery</option>
                                <option value="OFF_DUTY">Off Duty</option>
                                <option value="ON_BREAK">On Break</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Changing the driver's status will affect their availability for new deliveries. Drivers with "AVAILABLE" status can be assigned to deliveries.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Driver'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
