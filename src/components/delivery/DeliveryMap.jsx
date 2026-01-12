import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '500px'
};

// Default center: Colombo, Sri Lanka
const defaultCenter = {
    lat: 6.9271,
    lng: 79.8612
};

// Map styling options
const mapOptions = {
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
};

export default function DeliveryMap({ deliveries }) {
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [map, setMap] = useState(null);

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Get marker color based on delivery status
    const getMarkerColor = (status) => {
        switch (status) {
            case 'ASSIGNED':
                return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
            case 'PICKED_UP':
                return 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
            case 'IN_TRANSIT':
                return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
            case 'ARRIVED':
                return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
            case 'DELIVERED':
                return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
            default:
                return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
        }
    };

    const onLoad = useCallback((map) => {
        setMap(map);

        // If we have deliveries with locations, fit bounds to show all markers
        if (deliveries && deliveries.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            deliveries.forEach(delivery => {
                if (delivery.latitude && delivery.longitude) {
                    bounds.extend({
                        lat: parseFloat(delivery.latitude),
                        lng: parseFloat(delivery.longitude)
                    });
                }
            });

            // Only fit bounds if we have valid locations
            if (deliveries.some(d => d.latitude && d.longitude)) {
                map.fitBounds(bounds);
            }
        }
    }, [deliveries]);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Check if API key is configured
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-yellow-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                            Google Maps API Key Required
                        </h3>
                        <p className="text-sm text-yellow-700 mb-4">
                            To enable real-time delivery tracking on maps, you need to configure a Google Maps API key.
                        </p>
                        <div className="bg-white rounded p-4 text-sm">
                            <p className="font-semibold text-gray-900 mb-2">Setup Instructions:</p>
                            <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                <li>Get a Google Maps API key from: <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
                                <li>Create a <code className="bg-gray-100 px-1 rounded">.env</code> file in the project root</li>
                                <li>Add: <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</code></li>
                                <li>Restart the development server with <code className="bg-gray-100 px-1 rounded">npm run dev</code></li>
                            </ol>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                            <p className="font-semibold mb-1">Active Deliveries: {deliveries.length}</p>
                            {deliveries.map((delivery, index) => (
                                <div key={delivery.deliveryId} className="flex items-center gap-2 py-1">
                                    <span className={`w-3 h-3 rounded-full ${
                                        delivery.status === 'IN_TRANSIT' ? 'bg-orange-500' :
                                        delivery.status === 'PICKED_UP' ? 'bg-purple-500' :
                                        delivery.status === 'DELIVERED' ? 'bg-green-500' :
                                        'bg-blue-500'
                                    }`}></span>
                                    <span>{delivery.orderNumber} - {delivery.driverName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <LoadScript googleMapsApiKey={apiKey}>
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={defaultCenter}
                        zoom={12}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        options={mapOptions}
                    >
                        {deliveries.map((delivery) => {
                            // Try multiple field name variations for coordinates
                            const lat = delivery.destinationLatitude || delivery.latitude;
                            const lng = delivery.destinationLongitude || delivery.longitude;

                            const position = lat && lng
                                ? {
                                    lat: parseFloat(lat),
                                    lng: parseFloat(lng)
                                  }
                                : null;

                            // Debug logging
                            console.log(`📍 Delivery ${delivery.orderNumber}:`, {
                                deliveryId: delivery.deliveryId,
                                status: delivery.status,
                                lat: lat,
                                lng: lng,
                                hasPosition: !!position,
                                willShowMarker: !!position
                            });

                            // Only render marker if we have a valid position
                            if (!position) {
                                console.warn(`⚠️ No marker for ${delivery.orderNumber} - missing coordinates`);
                                return null;
                            }

                            console.log(`✅ Creating marker for ${delivery.orderNumber} at (${position.lat}, ${position.lng})`);

                            return (
                                <Marker
                                    key={delivery.deliveryId}
                                    position={position}
                                    icon={getMarkerColor(delivery.status)}
                                    onClick={() => setSelectedDelivery(delivery)}
                                    title={`${delivery.orderNumber} - ${delivery.status}`}
                                />
                            );
                        })}

                        {selectedDelivery && (selectedDelivery.destinationLatitude || selectedDelivery.latitude) && (selectedDelivery.destinationLongitude || selectedDelivery.longitude) && (
                            <InfoWindow
                                position={{
                                    lat: parseFloat(selectedDelivery.destinationLatitude || selectedDelivery.latitude),
                                    lng: parseFloat(selectedDelivery.destinationLongitude || selectedDelivery.longitude)
                                }}
                                onCloseClick={() => setSelectedDelivery(null)}
                            >
                                <div className="p-2">
                                    <h3 className="font-bold text-gray-900 mb-2">
                                        {selectedDelivery.orderNumber}
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        <p>
                                            <span className="font-semibold">Status:</span>{' '}
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                selectedDelivery.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                selectedDelivery.status === 'IN_TRANSIT' ? 'bg-orange-100 text-orange-800' :
                                                selectedDelivery.status === 'PICKED_UP' ? 'bg-purple-100 text-purple-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {selectedDelivery.status}
                                            </span>
                                        </p>
                                        <p>
                                            <span className="font-semibold">Driver:</span> {selectedDelivery.driverName}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Customer:</span> {selectedDelivery.customerName}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Address:</span> {selectedDelivery.deliveryAddress}
                                        </p>
                                        {selectedDelivery.estimatedDeliveryTime && (
                                            <p>
                                                <span className="font-semibold">ETA:</span>{' '}
                                                {new Date(selectedDelivery.estimatedDeliveryTime).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                </LoadScript>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Map Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span>Assigned</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                        <span>Picked Up</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                        <span>In Transit</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                        <span>Arrived</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span>Delivered</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
