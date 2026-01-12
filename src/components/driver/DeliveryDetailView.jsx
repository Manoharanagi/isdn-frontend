import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as driverDashboardService from '../../services/driverDashboardService';
import gpsTracker from '../../services/gpsTracker';

export default function DeliveryDetailView() {
    const { deliveryId } = useParams();
    const navigate = useNavigate();

    const [delivery, setDelivery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [notes, setNotes] = useState('');
    const [showCompleteForm, setShowCompleteForm] = useState(false);
    const [completionData, setCompletionData] = useState({
        recipientName: '',
        deliveryNotes: '',
        photoFile: null
    });
    const [currentLocation, setCurrentLocation] = useState(null);

    useEffect(() => {
        loadDeliveryDetails();
    }, [deliveryId]);

    const loadDeliveryDetails = async () => {
        try {
            const deliveries = await driverDashboardService.getMyDeliveries();
            const found = deliveries.find(d => d.deliveryId === parseInt(deliveryId));

            if (found) {
                setDelivery(found);
                console.log('📦 Delivery Details:', found);
            } else {
                toast.error('Delivery not found');
                navigate('/driver/dashboard');
            }
        } catch (err) {
            toast.error('Failed to load delivery details');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentPosition = async () => {
        try {
            const position = await gpsTracker.getCurrentPosition();
            setCurrentLocation(position);
            return position;
        } catch (error) {
            console.error('Failed to get current location:', error);
            return null;
        }
    };

    const handlePickup = async () => {
        setUpdating(true);
        try {
            await driverDashboardService.markAsPickedUp(deliveryId, notes || null);
            toast.success('Marked as picked up');
            setNotes('');
            loadDeliveryDetails();
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleStartDelivery = async () => {
        setUpdating(true);
        try {
            await driverDashboardService.startDelivery(deliveryId, notes || null);
            toast.success('Delivery started');
            setNotes('');
            loadDeliveryDetails();
        } catch (err) {
            toast.error('Failed to start delivery');
        } finally {
            setUpdating(false);
        }
    };

    const handleArrived = async () => {
        setUpdating(true);
        try {
            await driverDashboardService.markAsArrived(deliveryId, notes || null);
            toast.success('Marked as arrived');
            setNotes('');
            loadDeliveryDetails();
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleCompleteDelivery = async (e) => {
        e.preventDefault();

        if (!completionData.recipientName.trim()) {
            toast.error('Recipient name is required');
            return;
        }

        setUpdating(true);
        try {
            // Get current location
            const location = await getCurrentPosition();

            // Upload photo if provided
            let photoUrl = null;
            if (completionData.photoFile) {
                const uploadResult = await driverDashboardService.uploadDeliveryProof(
                    deliveryId,
                    completionData.photoFile
                );
                photoUrl = uploadResult.photoUrl;
            }

            // Complete delivery
            await driverDashboardService.completeDelivery(deliveryId, {
                recipientName: completionData.recipientName,
                deliveryNotes: completionData.deliveryNotes,
                latitude: location?.latitude || null,
                longitude: location?.longitude || null,
                photoUrl: photoUrl
            });

            toast.success('Delivery completed successfully!');
            navigate('/driver/dashboard');
        } catch (err) {
            toast.error('Failed to complete delivery');
            console.error('Error:', err);
        } finally {
            setUpdating(false);
        }
    };

    const openInMaps = () => {
        const lat = delivery.destinationLatitude || delivery.latitude;
        const lng = delivery.destinationLongitude || delivery.longitude;

        if (lat && lng) {
            // Open in Google Maps with directions
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        } else {
            toast.error('Location not available');
        }
    };

    const callCustomer = () => {
        if (delivery?.contactNumber) {
            window.location.href = `tel:${delivery.contactNumber}`;
        }
    };

    const smsCustomer = () => {
        if (delivery?.contactNumber) {
            window.location.href = `sms:${delivery.contactNumber}`;
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            ASSIGNED: 'bg-blue-100 text-blue-800 border-blue-300',
            PICKED_UP: 'bg-purple-100 text-purple-800 border-purple-300',
            IN_TRANSIT: 'bg-orange-100 text-orange-800 border-orange-300',
            ARRIVED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            DELIVERED: 'bg-green-100 text-green-800 border-green-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const canPickup = () => delivery?.status === 'ASSIGNED';
    const canStartDelivery = () => delivery?.status === 'PICKED_UP';
    const canMarkArrived = () => delivery?.status === 'IN_TRANSIT';
    const canComplete = () => delivery?.status === 'ARRIVED';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Loading delivery details...</div>
            </div>
        );
    }

    if (!delivery) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/driver/dashboard')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Delivery Details</h1>
            </div>

            {/* Status Badge */}
            <div className={`inline-block px-6 py-3 rounded-lg border-2 text-lg font-semibold mb-6 ${getStatusColor(delivery.status)}`}>
                {delivery.status.replace('_', ' ')}
            </div>

            {/* Order Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Order Information
                </h2>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Order Number:</span>
                        <span className="font-semibold">{delivery.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Assigned Date:</span>
                        <span className="font-semibold">
                            {new Date(delivery.assignedDate).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Distance:</span>
                        <span className="font-semibold">{delivery.estimatedDistanceKm} km</span>
                    </div>
                </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Customer Details
                </h2>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Delivery Address:</p>
                        <p className="font-semibold">{delivery.deliveryAddress}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Contact Number:</p>
                        <p className="font-semibold">{delivery.contactNumber}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <button
                            onClick={callCustomer}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call
                        </button>
                        <button
                            onClick={smsCustomer}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            SMS
                        </button>
                        <button
                            onClick={openInMaps}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Navigate
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Update Actions */}
            {!showCompleteForm && delivery.status !== 'DELIVERED' && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Update Status</h2>

                    {/* Notes Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="Add any notes about this delivery..."
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {canPickup() && (
                            <button
                                onClick={handlePickup}
                                disabled={updating}
                                className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                            >
                                {updating ? 'Updating...' : 'Mark as Picked Up'}
                            </button>
                        )}

                        {canStartDelivery() && (
                            <button
                                onClick={handleStartDelivery}
                                disabled={updating}
                                className="w-full px-6 py-4 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                            >
                                {updating ? 'Updating...' : 'Start Delivery (In Transit)'}
                            </button>
                        )}

                        {canMarkArrived() && (
                            <button
                                onClick={handleArrived}
                                disabled={updating}
                                className="w-full px-6 py-4 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                            >
                                {updating ? 'Updating...' : 'I\'ve Arrived at Customer Location'}
                            </button>
                        )}

                        {canComplete() && (
                            <button
                                onClick={() => setShowCompleteForm(true)}
                                className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                            >
                                Complete Delivery
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Complete Delivery Form */}
            {showCompleteForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Complete Delivery</h2>
                    <form onSubmit={handleCompleteDelivery}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Recipient Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={completionData.recipientName}
                                    onChange={(e) => setCompletionData({
                                        ...completionData,
                                        recipientName: e.target.value
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Name of person who received the delivery"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Delivery Notes (Optional)
                                </label>
                                <textarea
                                    value={completionData.deliveryNotes}
                                    onChange={(e) => setCompletionData({
                                        ...completionData,
                                        deliveryNotes: e.target.value
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows="3"
                                    placeholder="Any special notes about the delivery..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Delivery Proof Photo (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={(e) => setCompletionData({
                                        ...completionData,
                                        photoFile: e.target.files[0]
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                {completionData.photoFile && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Selected: {completionData.photoFile.name}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                                >
                                    {updating ? 'Completing...' : 'Complete Delivery'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCompleteForm(false)}
                                    disabled={updating}
                                    className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:cursor-not-allowed transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Delivery Complete Message */}
            {delivery.status === 'DELIVERED' && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
                    <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Delivery Completed!</h3>
                    <p className="text-green-700">This delivery has been successfully completed.</p>
                    {delivery.deliveryTime && (
                        <p className="text-sm text-green-600 mt-2">
                            Completed: {new Date(delivery.deliveryTime).toLocaleString()}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
