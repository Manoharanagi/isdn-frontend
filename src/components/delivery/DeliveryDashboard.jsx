import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as deliveryService from '../../services/deliveryService';
import AssignDeliveryModal from './AssignDeliveryModal';
import DeliveryMap from './DeliveryMap';
import Loader from '../common/Loader';

export default function DeliveryDashboard() {
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);

    // Hardcoded RDC ID - In real app, get from user context
    const rdcId = 4; // Western RDC

    useEffect(() => {
        loadActiveDeliveries();

        // Poll for updates every 30 seconds
        const interval = setInterval(loadActiveDeliveries, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadActiveDeliveries = async () => {
        try {
            setLoading(true);
            const data = await deliveryService.getActiveDeliveries();

            console.log('🚚 Active Deliveries Loaded:', data);
            console.log('📊 Total Deliveries:', data.length);

            // Check which deliveries have coordinates (check multiple field name variations)
            const deliveriesWithCoords = data.filter(d =>
                (d.destinationLatitude && d.destinationLongitude) || (d.latitude && d.longitude)
            );
            const deliveriesWithoutCoords = data.filter(d =>
                !(d.destinationLatitude && d.destinationLongitude) && !(d.latitude && d.longitude)
            );

            console.log('✅ Deliveries WITH coordinates:', deliveriesWithCoords.length);
            console.log('❌ Deliveries WITHOUT coordinates:', deliveriesWithoutCoords.length);

            if (deliveriesWithCoords.length > 0) {
                console.log('📍 Sample delivery with coordinates:', deliveriesWithCoords[0]);
            }

            if (deliveriesWithoutCoords.length > 0) {
                console.warn('⚠️ These deliveries missing coordinates:',
                    deliveriesWithoutCoords.map(d => ({
                        deliveryId: d.deliveryId,
                        orderNumber: d.orderNumber,
                        status: d.status
                    }))
                );
            }

            setActiveDeliveries(data);
            setError(null);
        } catch (err) {
            setError('Failed to load deliveries');
            toast.error('Failed to load deliveries');
            console.error('❌ Error loading deliveries:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING_ASSIGNMENT: 'bg-gray-100 text-gray-800',
            ASSIGNED: 'bg-blue-100 text-blue-800',
            PICKED_UP: 'bg-purple-100 text-purple-800',
            IN_TRANSIT: 'bg-orange-100 text-orange-800',
            ARRIVED: 'bg-indigo-100 text-indigo-800',
            DELIVERED: 'bg-green-100 text-green-800',
            FAILED: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) return <Loader />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Delivery Dashboard</h1>
                    <p className="text-gray-600">Real-time delivery tracking</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAssignModal(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        Assign Delivery
                    </button>
                    <button
                        onClick={loadActiveDeliveries}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Debug Info Box */}
            {activeDeliveries.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">📊 Delivery Data Status</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-blue-600 font-medium">Total Deliveries</p>
                            <p className="text-2xl font-bold text-blue-900">{activeDeliveries.length}</p>
                        </div>
                        <div>
                            <p className="text-green-600 font-medium">With Coordinates</p>
                            <p className="text-2xl font-bold text-green-900">
                                {activeDeliveries.filter(d => (d.destinationLatitude && d.destinationLongitude) || (d.latitude && d.longitude)).length}
                            </p>
                        </div>
                        <div>
                            <p className="text-red-600 font-medium">Missing Coordinates</p>
                            <p className="text-2xl font-bold text-red-900">
                                {activeDeliveries.filter(d => !(d.destinationLatitude && d.destinationLongitude) && !(d.latitude && d.longitude)).length}
                            </p>
                        </div>
                        <div>
                            <p className="text-purple-600 font-medium">Map Markers</p>
                            <p className="text-2xl font-bold text-purple-900">
                                {activeDeliveries.filter(d => (d.destinationLatitude && d.destinationLongitude) || (d.latitude && d.longitude)).length}
                            </p>
                        </div>
                    </div>
                    {activeDeliveries.filter(d => !(d.destinationLatitude && d.destinationLongitude) && !(d.latitude && d.longitude)).length > 0 && (
                        <div className="mt-3 text-xs text-red-700">
                            ⚠️ Some deliveries are missing coordinates. They won't appear on the map. Check backend DTO includes latitude/longitude fields.
                        </div>
                    )}
                </div>
            )}

            {/* Map View */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Live Tracking Map</h2>
                <DeliveryMap deliveries={activeDeliveries} />
            </div>

            {/* Active Deliveries List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold">Active Deliveries ({activeDeliveries.length})</h2>
                </div>

                {activeDeliveries.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No active deliveries at the moment
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {activeDeliveries.map(delivery => (
                            <div key={delivery.deliveryId} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Order #{delivery.orderNumber}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                                                {delivery.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                            <div>
                                                <p className="font-medium text-gray-900">Driver</p>
                                                <p>{delivery.driverName || 'Not assigned'}</p>
                                                {delivery.vehicleNumber && (
                                                    <p className="text-xs text-gray-500">{delivery.vehicleNumber}</p>
                                                )}
                                            </div>

                                            <div>
                                                <p className="font-medium text-gray-900">Delivery Address</p>
                                                <p className="line-clamp-2">{delivery.deliveryAddress}</p>
                                            </div>

                                            <div>
                                                <p className="font-medium text-gray-900">Contact</p>
                                                <p>{delivery.contactNumber}</p>
                                            </div>

                                            <div>
                                                <p className="font-medium text-gray-900">Distance</p>
                                                <p>{delivery.estimatedDistanceKm} km</p>
                                            </div>
                                        </div>

                                        {delivery.pickupTime && (
                                            <div className="mt-3 text-sm text-gray-600">
                                                <p>Picked up: {new Date(delivery.pickupTime).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setSelectedDelivery(delivery)}
                                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showAssignModal && (
                <AssignDeliveryModal
                    onClose={() => setShowAssignModal(false)}
                    onSuccess={() => {
                        loadActiveDeliveries();
                        toast.success('Delivery assigned successfully!');
                    }}
                />
            )}
        </div>
    );
}
