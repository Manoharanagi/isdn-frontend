-- ============================================
-- UPDATE COORDINATES TO AVOID MARKER OVERLAP
-- ============================================

-- Current situation:
-- Both deliveries have same coordinates (6.9271, 79.8612) causing overlap

-- ============================================
-- OPTION 1: Update ORD-1767806817641 to Mount Lavinia
-- ============================================

UPDATE deliveries
SET
    destination_latitude = 6.8319,
    destination_longitude = 79.8636
WHERE delivery_id = 2;  -- This is the delivery for ORD-1767806817641

-- ============================================
-- OPTION 2: Update using order number directly
-- ============================================

UPDATE deliveries d
JOIN orders o ON d.order_id = o.order_id
SET
    d.destination_latitude = 6.8319,   -- Mount Lavinia
    d.destination_longitude = 79.8636
WHERE o.order_number = 'ORD-1767806817641';

-- ============================================
-- ALTERNATIVE LOCATIONS (Choose one)
-- ============================================

-- Option A: Mount Lavinia Beach (South of Colombo)
-- 15 km from city center
UPDATE deliveries
SET
    destination_latitude = 6.8319,
    destination_longitude = 79.8636
WHERE delivery_id = 2;

-- Option B: Dehiwala (South of Colombo)
-- 12 km from city center
UPDATE deliveries
SET
    destination_latitude = 6.8563,
    destination_longitude = 79.8632
WHERE delivery_id = 2;

-- Option C: Nugegoda (East of Colombo)
-- 10 km from city center
UPDATE deliveries
SET
    destination_latitude = 6.8649,
    destination_longitude = 79.8997
WHERE delivery_id = 2;

-- Option D: Rajagiriya (East of Colombo)
-- 8 km from city center
UPDATE deliveries
SET
    destination_latitude = 6.9099,
    destination_longitude = 79.8920
WHERE delivery_id = 2;

-- Option E: Colombo Fort (North of current location)
-- City center, different area
UPDATE deliveries
SET
    destination_latitude = 6.9350,
    destination_longitude = 79.8538
WHERE delivery_id = 2;

-- ============================================
-- UPDATE MULTIPLE DELIVERIES AT DIFFERENT LOCATIONS
-- ============================================

-- Delivery #1 (ORD-1767815613240) - Keep at Colombo City Center
UPDATE deliveries
SET
    destination_latitude = 6.9271,
    destination_longitude = 79.8612
WHERE delivery_id = 1;

-- Delivery #2 (ORD-1767806817641) - Move to Mount Lavinia
UPDATE deliveries
SET
    destination_latitude = 6.8319,
    destination_longitude = 79.8636
WHERE delivery_id = 2;

-- ============================================
-- VERIFY THE UPDATE
-- ============================================

SELECT
    d.delivery_id,
    o.order_number,
    d.destination_latitude,
    d.destination_longitude,
    d.status,
    dr.full_name as driver_name,
    CONCAT(
        'https://www.google.com/maps?q=',
        d.destination_latitude,
        ',',
        d.destination_longitude
    ) as google_maps_link
FROM deliveries d
JOIN orders o ON d.order_id = o.order_id
LEFT JOIN drivers dr ON d.driver_id = dr.driver_id
WHERE o.order_number IN ('ORD-1767806817641', 'ORD-1767815613240')
ORDER BY d.delivery_id;

-- ============================================
-- QUICK FIX: Run this to separate the markers
-- ============================================

-- This will place them at different locations automatically:

UPDATE deliveries d
JOIN orders o ON d.order_id = o.order_id
SET
    d.destination_latitude = CASE o.order_number
        WHEN 'ORD-1767806817641' THEN 6.8319  -- Mount Lavinia
        WHEN 'ORD-1767815613240' THEN 6.9271  -- Colombo City Center
        ELSE d.destination_latitude
    END,
    d.destination_longitude = CASE o.order_number
        WHEN 'ORD-1767806817641' THEN 79.8636  -- Mount Lavinia
        WHEN 'ORD-1767815613240' THEN 79.8612  -- Colombo City Center
        ELSE d.destination_longitude
    END
WHERE o.order_number IN ('ORD-1767806817641', 'ORD-1767815613240');

-- ============================================
-- VISUAL MAP OF NEW LOCATIONS
-- ============================================
/*
After running the update:

Map View:
┌─────────────────────────────────┐
│                                 │
│      🔵 ORD-1767815613240      │  ← Colombo City Center (6.9271, 79.8612)
│      (Colombo City)             │
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
│      🔵 ORD-1767806817641      │  ← Mount Lavinia (6.8319, 79.8636)
│      (Mount Lavinia Beach)      │
│                                 │
└─────────────────────────────────┘

Distance between markers: ~15 km
Both markers will be clearly visible!
*/

-- ============================================
-- CHECK BEFORE AND AFTER
-- ============================================

-- Before Update:
-- Delivery #1: (6.9271, 79.8612) - Colombo City
-- Delivery #2: (6.9271, 79.8612) - Colombo City  ← SAME! Overlapping!

-- After Update:
-- Delivery #1: (6.9271, 79.8612) - Colombo City
-- Delivery #2: (6.8319, 79.8636) - Mount Lavinia  ← DIFFERENT! Separated!
