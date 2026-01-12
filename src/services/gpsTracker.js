import * as driverDashboardService from './driverDashboardService';

class GPSTracker {
    constructor() {
        this.watchId = null;
        this.isTracking = false;
        this.lastUpdate = null;
        this.updateInterval = 30000; // 30 seconds
        this.driverId = null;
    }

    /**
     * Start GPS tracking
     */
    startTracking(driverId) {
        if (this.isTracking) {
            console.log('GPS tracking already running');
            return;
        }

        this.driverId = driverId;
        this.isTracking = true;

        console.log('🛰️ Starting GPS tracking for driver:', driverId);

        // Check if geolocation is supported
        if (!navigator.geolocation) {
            console.error('❌ Geolocation is not supported by this browser');
            return;
        }

        // Start watching position
        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.onPositionUpdate(position),
            (error) => this.onPositionError(error),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

        console.log('✅ GPS tracking started');
    }

    /**
     * Stop GPS tracking
     */
    stopTracking() {
        if (!this.isTracking) {
            return;
        }

        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        this.isTracking = false;
        console.log('⏹️ GPS tracking stopped');
    }

    /**
     * Handle position update
     */
    async onPositionUpdate(position) {
        const now = Date.now();

        // Only send update if 30 seconds have passed since last update
        if (this.lastUpdate && (now - this.lastUpdate) < this.updateInterval) {
            return;
        }

        const locationData = {
            driverId: this.driverId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed ? position.coords.speed * 3.6 : null, // Convert m/s to km/h
            heading: position.coords.heading
        };

        console.log('📍 GPS Update:', {
            lat: locationData.latitude,
            lng: locationData.longitude,
            accuracy: `${locationData.accuracy.toFixed(2)}m`,
            speed: locationData.speed ? `${locationData.speed.toFixed(1)} km/h` : 'N/A'
        });

        try {
            await driverDashboardService.updateLocation(locationData);
            this.lastUpdate = now;
            console.log('✅ Location sent to server');
        } catch (error) {
            console.error('❌ Failed to update location:', error);
        }
    }

    /**
     * Handle position error
     */
    onPositionError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.error('❌ User denied the request for Geolocation');
                break;
            case error.POSITION_UNAVAILABLE:
                console.error('❌ Location information is unavailable');
                break;
            case error.TIMEOUT:
                console.error('❌ The request to get user location timed out');
                break;
            default:
                console.error('❌ An unknown error occurred');
                break;
        }
    }

    /**
     * Get current position once (not continuous tracking)
     */
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }
}

// Export singleton instance
export default new GPSTracker();
