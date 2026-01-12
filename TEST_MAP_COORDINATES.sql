-- ============================================
-- TEST MAP COORDINATES FOR DELIVERY TRACKING
-- ============================================
-- Run these SQL queries in your database to test the Google Maps integration

-- Step 1: Add latitude/longitude columns to deliveries table (if not already added)
ALTER TABLE deliveries
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Step 2: Add latitude/longitude columns to drivers table (if not already added)
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS current_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS current_longitude DECIMAL(11, 8);

-- ============================================
-- TEST DATA: Colombo, Sri Lanka Locations
-- ============================================

-- Location 1: Colombo City Center (Customer location)
-- Latitude: 6.9271, Longitude: 79.8612
-- This is where the delivery is going

-- Location 2: Mount Lavinia (Driver current location)
-- Latitude: 6.8319, Longitude: 79.8636
-- This is where the driver is currently located

-- Location 3: Dehiwala (Another delivery location)
-- Latitude: 6.8563, Longitude: 79.8632

-- Location 4: Colombo Fort (RDC location)
-- Latitude: 6.9350, Longitude: 79.8538

-- ============================================
-- UPDATE EXISTING DELIVERY WITH COORDINATES
-- ============================================

-- Option 1: Update the first delivery (adjust delivery_id as needed)
UPDATE deliveries
SET
    latitude = 6.9271,
    longitude = 79.8612
WHERE delivery_id = 1;

-- Option 2: Update all deliveries for driver_id = 1
UPDATE deliveries
SET
    latitude = CASE delivery_id
        WHEN 1 THEN 6.9271  -- Colombo City Center
        WHEN 2 THEN 6.8563  -- Dehiwala
        WHEN 3 THEN 6.8319  -- Mount Lavinia
        ELSE 6.9271
    END,
    longitude = CASE delivery_id
        WHEN 1 THEN 79.8612  -- Colombo City Center
        WHEN 2 THEN 79.8632  -- Dehiwala
        WHEN 3 THEN 79.8636  -- Mount Lavinia
        ELSE 79.8612
    END
WHERE driver_id = 1;

-- ============================================
-- UPDATE DRIVER CURRENT LOCATION
-- ============================================

-- Update driver's current GPS location (for real-time tracking)
UPDATE drivers
SET
    current_latitude = 6.8319,   -- Mount Lavinia (driver is here now)
    current_longitude = 79.8636
WHERE driver_id = 1;

-- ============================================
-- VERIFY THE DATA
-- ============================================

-- Check deliveries with coordinates
SELECT
    d.delivery_id,
    o.order_number,
    d.status,
    d.latitude,
    d.longitude,
    CONCAT(dr.full_name, ' (', dr.vehicle_number, ')') as driver_info
FROM deliveries d
JOIN orders o ON d.order_id = o.order_id
LEFT JOIN drivers dr ON d.driver_id = dr.driver_id
WHERE d.driver_id = 1
ORDER BY d.delivery_id;

-- Check driver location
SELECT
    driver_id,
    full_name,
    vehicle_number,
    status,
    current_latitude,
    current_longitude
FROM drivers
WHERE driver_id = 1;

-- ============================================
-- SAMPLE: CREATE TEST DELIVERY WITH COORDINATES
-- ============================================
-- If you want to create a brand new test delivery:

/*
-- First, make sure you have a confirmed order
SELECT order_id, order_number, status
FROM orders
WHERE status = 'CONFIRMED'
LIMIT 1;

-- Then create a delivery (replace <order_id> with actual ID)
INSERT INTO deliveries (
    order_id,
    driver_id,
    status,
    latitude,
    longitude,
    estimated_distance_km,
    created_at
) VALUES (
    <order_id>,           -- Replace with actual order_id
    1,                    -- Driver ID 1
    'IN_TRANSIT',         -- Status
    6.9271,              -- Colombo City Center latitude
    79.8612,             -- Colombo City Center longitude
    12.5,                -- Estimated distance
    NOW()
);
*/

-- ============================================
-- COLOMBO AREA COORDINATES FOR REFERENCE
-- ============================================
/*
Popular locations in Colombo for testing:

1. Colombo Fort (City Center)
   Latitude: 6.9350, Longitude: 79.8538

2. Galle Face Green
   Latitude: 6.9262, Longitude: 79.8435

3. Independence Square
   Latitude: 6.9034, Longitude: 79.8682

4. Mount Lavinia Beach
   Latitude: 6.8319, Longitude: 79.8636

5. Dehiwala Zoo
   Latitude: 6.8563, Longitude: 79.8632

6. Nugegoda
   Latitude: 6.8649, Longitude: 79.8997

7. Rajagiriya
   Latitude: 6.9099, Longitude: 79.8920

8. Kotte
   Latitude: 6.8905, Longitude: 79.9037

Use these coordinates to create multiple delivery test points!
*/

-- ============================================
-- QUICK TEST QUERY
-- ============================================
-- Run this to see all active deliveries with coordinates:
SELECT
    d.delivery_id,
    o.order_number,
    d.status,
    d.latitude,
    d.longitude,
    dr.full_name as driver_name,
    dr.vehicle_number,
    o.delivery_address
FROM deliveries d
JOIN orders o ON d.order_id = o.order_id
LEFT JOIN drivers dr ON d.driver_id = dr.driver_id
WHERE d.status IN ('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED')
  AND d.latitude IS NOT NULL
  AND d.longitude IS NOT NULL
ORDER BY d.delivery_id;
