import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import * as driverDashboardService from '../../services/driverDashboardService';
import gpsTracker from '../../services/gpsTracker';
import { useAuth } from '../../context/AuthContext';
import InstallPWA from '../common/InstallPWA';

export default function DriverDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gpsActive, setGpsActive] = useState(false);

    useEffect(() => {
        loadData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const [profileData, deliveriesData] = await Promise.all([
                driverDashboardService.getMyProfile(),
                driverDashboardService.getMyDeliveries()
            ]);

            setProfile(profileData);
            setDeliveries(deliveriesData);

            console.log('👤 Driver Profile:', profileData);
            console.log('📦 My Deliveries:', deliveriesData);
        } catch (err) {
            toast.error('Failed to load data');
            console.error('Error loading driver data:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleGPS = () => {
        if (gpsActive) {
            gpsTracker.stopTracking();
            setGpsActive(false);
            toast.info('GPS tracking stopped');
        } else {
            if (profile) {
                gpsTracker.startTracking(profile.driverId);
                setGpsActive(true);
                toast.success('GPS tracking started');
            }
        }
    };

    const updateStatus = async (status) => {
        try {
            await driverDashboardService.updateMyStatus(status);
            toast.success(`Status updated to ${status}`);
            loadData();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            ASSIGNED: 'bg-blue-100 text-blue-800',
            PICKED_UP: 'bg-purple-100 text-purple-800',
            IN_TRANSIT: 'bg-orange-100 text-orange-800',
            ARRIVED: 'bg-yellow-100 text-yellow-800',
            DELIVERED: 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getDriverStatusColor = (status) => {
        const colors = {
            AVAILABLE: 'bg-green-600',
            ON_DELIVERY: 'bg-blue-600',
            OFF_DUTY: 'bg-gray-600',
            ON_BREAK: 'bg-yellow-600'
        };
        return colors[status] || 'bg-gray-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* PWA Install Prompt */}
            <InstallPWA />

            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome, {profile?.fullName}!
                        </h1>
                        <p className="text-gray-600">{profile?.vehicleNumber} - {profile?.vehicleType}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-white ${getDriverStatusColor(profile?.status)}`}>
                        {profile?.status}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">{deliveries.length}</p>
                        <p className="text-sm text-gray-600">Active</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">{profile?.completedToday || 0}</p>
                        <p className="text-sm text-gray-600">Today</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-3xl font-bold text-purple-600">{profile?.totalDeliveries || 0}</p>
                        <p className="text-sm text-gray-600">Total</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-3xl font-bold text-orange-600">{profile?.pendingDeliveries || 0}</p>
                        <p className="text-sm text-gray-600">Pending</p>
                    </div>
                </div>
            </div>

            {/* GPS & Status Controls */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Controls</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* GPS Toggle */}
                    <button
                        onClick={toggleGPS}
                        className={`px-6 py-4 rounded-lg font-semibold transition ${
                            gpsActive
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {gpsActive ? '🛰️ GPS Active' : '📍 Start GPS Tracking'}
                    </button>

                    {/* Quick Status Update */}
                    <select
                        value={profile?.status || ''}
                        onChange={(e) => updateStatus(e.target.value)}
                        className="px-6 py-4 border border-gray-300 rounded-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="AVAILABLE">Available</option>
                        <option value="ON_DELIVERY">On Delivery</option>
                        <option value="ON_BREAK">On Break</option>
                        <option value="OFF_DUTY">Off Duty</option>
                    </select>
                </div>
            </div>

            {/* My Deliveries */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold">My Deliveries ({deliveries.length})</h2>
                </div>

                {deliveries.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-lg font-medium">No deliveries assigned</p>
                        <p className="text-sm mt-2">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {deliveries.map((delivery) => (
                            <div
                                key={delivery.deliveryId}
                                className="p-6 hover:bg-gray-50 cursor-pointer transition"
                                onClick={() => navigate(`/driver/delivery/${delivery.deliveryId}`)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {delivery.orderNumber}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                                                {delivery.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {delivery.deliveryAddress}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {delivery.contactNumber}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                                {delivery.estimatedDistanceKm} km
                                            </p>
                                        </div>
                                    </div>

                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
