# Driver Interface Testing Guide

## Overview
This guide will help you test the complete driver interface with real data, including GPS tracking, delivery workflow, and PWA installation.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Test Scenarios](#test-scenarios)
4. [PWA Testing](#pwa-testing)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Backend Requirements
Ensure the following APIs are implemented and running:

- ✅ `GET /api/drivers/me` - Driver profile
- ✅ `GET /api/drivers/me/deliveries` - Assigned deliveries
- ✅ `PUT /api/drivers/{id}/location` - GPS location updates
- ✅ `PUT /api/drivers/me/status` - Driver status updates
- ✅ `PUT /api/deliveries/{id}/pickup` - Mark as picked up
- ✅ `PUT /api/deliveries/{id}/start` - Start delivery
- ✅ `PUT /api/deliveries/{id}/arrive` - Mark as arrived
- ✅ `PUT /api/deliveries/{id}/complete` - Complete delivery
- ✅ `POST /api/deliveries/{id}/proof` - Upload photo

### 2. Frontend Setup
```bash
# Ensure dependencies are installed
npm install

# Start development server
npm run dev
```

### 3. Database Schema
Ensure these columns exist in your database:

**drivers table:**
```sql
- driver_id (PRIMARY KEY)
- full_name
- username
- email
- phone_number
- vehicle_number
- vehicle_type
- license_number
- status (AVAILABLE, ON_DELIVERY, OFF_DUTY, ON_BREAK)
- rdc_id
- current_latitude
- current_longitude
- location_accuracy
- speed
- heading
- last_location_update
```

**deliveries table:**
```sql
- delivery_id (PRIMARY KEY)
- order_id (FOREIGN KEY)
- driver_id (FOREIGN KEY)
- status (ASSIGNED, PICKED_UP, IN_TRANSIT, ARRIVED, DELIVERED)
- destination_latitude
- destination_longitude
- delivery_address
- contact_number
- estimated_distance_km
- assigned_date
- pickup_time
- arrival_time
- delivery_time
- recipient_name
- delivery_notes
- delivery_proof_photo_url
- actual_delivery_latitude
- actual_delivery_longitude
```

---

## Database Setup

### Step 1: Create Test Driver User

```sql
-- Create a test driver in the users table
INSERT INTO users (username, password, email, role, active)
VALUES (
    'driver1',
    '$2a$10$xHJ5cEqEZd8H8H8H8H8H8H', -- bcrypt hash of 'password123'
    'driver1@isdn.lk',
    'DRIVER',
    true
);

-- Get the user_id that was just created
SET @user_id = LAST_INSERT_ID();

-- Create driver profile
INSERT INTO drivers (
    user_id,
    full_name,
    username,
    email,
    phone_number,
    vehicle_number,
    vehicle_type,
    license_number,
    status,
    rdc_id,
    current_latitude,
    current_longitude
) VALUES (
    @user_id,
    'Kamal Perera',
    'driver1',
    'driver1@isdn.lk',
    '0771234567',
    'WP CAB-1234',
    'VAN',
    'B1234567',
    'AVAILABLE',
    1, -- Replace with your RDC ID
    6.9271, -- Colombo City Center (initial location)
    79.8612
);

-- Get the driver_id
SET @driver_id = LAST_INSERT_ID();
```

### Step 2: Create Test Orders and Deliveries

```sql
-- Create test customer order #1
INSERT INTO orders (
    order_number,
    customer_id,
    total_amount,
    status,
    order_date
) VALUES (
    'ORD-TEST-001',
    1, -- Replace with actual customer_id
    5000.00,
    'CONFIRMED',
    NOW()
);

SET @order_id_1 = LAST_INSERT_ID();

-- Create delivery #1 - Colombo Fort
INSERT INTO deliveries (
    order_id,
    driver_id,
    status,
    destination_latitude,
    destination_longitude,
    delivery_address,
    contact_number,
    estimated_distance_km,
    assigned_date
) VALUES (
    @order_id_1,
    @driver_id,
    'ASSIGNED',
    6.9350, -- Colombo Fort
    79.8538,
    'No. 123, Main Street, Colombo Fort, Colombo 01',
    '0771234567',
    5.2,
    NOW()
);

-- Create test customer order #2
INSERT INTO orders (
    order_number,
    customer_id,
    total_amount,
    status,
    order_date
) VALUES (
    'ORD-TEST-002',
    1, -- Replace with actual customer_id
    7500.00,
    'CONFIRMED',
    NOW()
);

SET @order_id_2 = LAST_INSERT_ID();

-- Create delivery #2 - Mount Lavinia
INSERT INTO deliveries (
    order_id,
    driver_id,
    status,
    destination_latitude,
    destination_longitude,
    delivery_address,
    contact_number,
    estimated_distance_km,
    assigned_date
) VALUES (
    @order_id_2,
    @driver_id,
    'ASSIGNED',
    6.8319, -- Mount Lavinia
    79.8636,
    'No. 456, Beach Road, Mount Lavinia',
    '0779876543',
    15.5,
    NOW()
);

-- Create delivery #3 - Nugegoda
INSERT INTO orders (
    order_number,
    customer_id,
    total_amount,
    status,
    order_date
) VALUES (
    'ORD-TEST-003',
    1,
    3500.00,
    'CONFIRMED',
    NOW()
);

SET @order_id_3 = LAST_INSERT_ID();

INSERT INTO deliveries (
    order_id,
    driver_id,
    status,
    destination_latitude,
    destination_longitude,
    delivery_address,
    contact_number,
    estimated_distance_km,
    assigned_date
) VALUES (
    @order_id_3,
    @driver_id,
    'ASSIGNED',
    6.8649, -- Nugegoda
    79.8997,
    'No. 789, High Level Road, Nugegoda',
    '0768765432',
    10.3,
    NOW()
);
```

### Step 3: Verify Test Data

```sql
-- Check driver profile
SELECT
    d.driver_id,
    d.full_name,
    d.vehicle_number,
    d.status,
    COUNT(del.delivery_id) as assigned_deliveries
FROM drivers d
LEFT JOIN deliveries del ON d.driver_id = del.driver_id AND del.status != 'DELIVERED'
WHERE d.username = 'driver1'
GROUP BY d.driver_id;

-- Check assigned deliveries
SELECT
    del.delivery_id,
    o.order_number,
    del.status,
    del.delivery_address,
    del.contact_number,
    del.destination_latitude,
    del.destination_longitude,
    del.estimated_distance_km,
    CONCAT(
        'https://www.google.com/maps?q=',
        del.destination_latitude,
        ',',
        del.destination_longitude
    ) as map_link
FROM deliveries del
JOIN orders o ON del.order_id = o.order_id
WHERE del.driver_id = @driver_id
ORDER BY del.assigned_date DESC;
```

---

## Test Scenarios

### Scenario 1: Driver Login and Dashboard

**Steps:**
1. Open browser and go to `http://localhost:5173`
2. Login with credentials:
   - Username: `driver1`
   - Password: `password123` (or whatever you set)
3. You should be redirected to `/driver/dashboard`

**Expected Results:**
- ✅ Driver profile displays: "Welcome, Kamal Perera!"
- ✅ Vehicle info shows: "WP CAB-1234 - VAN"
- ✅ Status badge shows: "AVAILABLE"
- ✅ Quick stats show:
  - Active: 3 (deliveries)
  - Today: 0 (completed today)
  - Total: 0 (total deliveries)
  - Pending: 3
- ✅ Three deliveries listed with order numbers
- ✅ Auto-refresh every 30 seconds

### Scenario 2: GPS Tracking

**Steps:**
1. On dashboard, click "Start GPS Tracking" button
2. Browser will ask for location permission - click "Allow"
3. Button should change to "GPS Active" (green)
4. Open browser console (F12)

**Expected Results:**
- ✅ Toast notification: "GPS tracking started"
- ✅ Console logs GPS coordinates every 30 seconds:
  ```
  📍 GPS Update: {lat: 6.9271, lng: 79.8612, accuracy: "15.00m", speed: "0.0 km/h"}
  ✅ Location sent to server
  ```
- ✅ Backend receives location updates at `PUT /api/drivers/{id}/location`

**Database Verification:**
```sql
-- Check driver's location updates
SELECT
    driver_id,
    full_name,
    current_latitude,
    current_longitude,
    location_accuracy,
    speed,
    heading,
    last_location_update
FROM drivers
WHERE driver_id = @driver_id;
```

### Scenario 3: Change Driver Status

**Steps:**
1. On dashboard, find the status dropdown
2. Change from "AVAILABLE" to "ON_BREAK"
3. Wait for confirmation

**Expected Results:**
- ✅ Toast notification: "Status updated to ON_BREAK"
- ✅ Status badge color changes to yellow
- ✅ Dashboard refreshes automatically

**Database Verification:**
```sql
SELECT driver_id, full_name, status
FROM drivers
WHERE driver_id = @driver_id;
-- Should show status = 'ON_BREAK'
```

### Scenario 4: View Delivery Details

**Steps:**
1. Click on any delivery from the list (e.g., "ORD-TEST-001")
2. Should navigate to `/driver/delivery/{deliveryId}`

**Expected Results:**
- ✅ Back button visible
- ✅ Status badge shows "ASSIGNED" (blue)
- ✅ Order information displays:
  - Order Number: ORD-TEST-001
  - Assigned Date: [current date/time]
  - Distance: 5.2 km
- ✅ Customer details show:
  - Address: No. 123, Main Street, Colombo Fort, Colombo 01
  - Contact: 0771234567
- ✅ Three action buttons visible:
  - Call (green)
  - SMS (blue)
  - Navigate (purple)
- ✅ "Mark as Picked Up" button visible

### Scenario 5: Complete Delivery Workflow

**Test the full delivery lifecycle:**

#### Step 1: Mark as Picked Up
1. On delivery detail page, click "Mark as Picked Up"
2. Optionally add notes: "Package picked up from warehouse"

**Expected:**
- ✅ Toast: "Marked as picked up"
- ✅ Status badge changes to "PICKED UP" (purple)
- ✅ "Start Delivery (In Transit)" button appears
- ✅ Driver status auto-updates to "ON_DELIVERY"

**Database Check:**
```sql
SELECT delivery_id, status, pickup_time, notes
FROM deliveries
WHERE delivery_id = 1; -- Use actual delivery_id

SELECT driver_id, status
FROM drivers
WHERE driver_id = @driver_id;
-- Should show status = 'ON_DELIVERY'
```

#### Step 2: Start Delivery
1. Click "Start Delivery (In Transit)"
2. Add note: "En route to customer"

**Expected:**
- ✅ Toast: "Delivery started"
- ✅ Status badge changes to "IN TRANSIT" (orange)
- ✅ "I've Arrived at Customer Location" button appears

#### Step 3: Mark as Arrived
1. Click "I've Arrived at Customer Location"
2. Add note: "Arrived at customer's building"

**Expected:**
- ✅ Toast: "Marked as arrived"
- ✅ Status badge changes to "ARRIVED" (yellow)
- ✅ "Complete Delivery" button appears

**Database Check:**
```sql
SELECT delivery_id, status, arrival_time
FROM deliveries
WHERE delivery_id = 1;
```

#### Step 4: Complete Delivery
1. Click "Complete Delivery"
2. Fill completion form:
   - Recipient Name: "Nimal Silva"
   - Delivery Notes: "Delivered to security guard"
   - Upload Photo: Select any image (optional)
3. Click "Complete Delivery"

**Expected:**
- ✅ Toast: "Delivery completed successfully!"
- ✅ Redirected back to `/driver/dashboard`
- ✅ Delivery removed from active list
- ✅ Stats updated:
  - Active: 2 (one less)
  - Today: 1 (completed today)
  - Total: 1
- ✅ Driver status returns to "AVAILABLE"

**Database Check:**
```sql
SELECT
    delivery_id,
    status,
    pickup_time,
    arrival_time,
    delivery_time,
    recipient_name,
    delivery_notes,
    delivery_proof_photo_url,
    actual_delivery_latitude,
    actual_delivery_longitude
FROM deliveries
WHERE delivery_id = 1;

-- Check order status updated
SELECT order_id, order_number, status
FROM orders
WHERE order_id = @order_id_1;
-- Should show status = 'DELIVERED'

-- Check driver status
SELECT driver_id, status
FROM drivers
WHERE driver_id = @driver_id;
-- Should show status = 'AVAILABLE'
```

### Scenario 6: Customer Contact Actions

**Test Call Button:**
1. On delivery detail page, click "Call" button
2. Should trigger phone dialer with number

**Test SMS Button:**
1. Click "SMS" button
2. Should open SMS app with customer number pre-filled

**Test Navigate Button:**
1. Click "Navigate" button
2. Should open Google Maps in new tab
3. Shows directions to customer location

### Scenario 7: Photo Upload

**Steps:**
1. Navigate to delivery in "ARRIVED" status
2. Click "Complete Delivery"
3. Click "Choose Photo" or use camera
4. Select/capture photo
5. Review photo preview
6. Click "Complete Delivery"

**Expected:**
- ✅ Photo uploads successfully
- ✅ `delivery_proof_photo_url` saved in database
- ✅ File accessible at specified path

---

## PWA Testing

### Test PWA Installation on Desktop

**Steps:**
1. Build production version:
   ```bash
   npm run build
   npm run preview
   ```

2. Open `http://localhost:4173` in Chrome

3. Open DevTools (F12):
   - Go to "Application" tab
   - Check "Manifest" section
   - Verify all icons and settings

4. Run Lighthouse:
   - Open DevTools > Lighthouse
   - Select "Progressive Web App"
   - Click "Generate report"
   - Should score 90+ for PWA

5. Install the app:
   - Look for install icon in address bar (⊕)
   - Or click menu (⋮) > "Install ISDN Driver App"
   - Click "Install"

**Expected:**
- ✅ App opens in standalone window
- ✅ No browser UI (address bar, etc.)
- ✅ App icon in taskbar/dock

### Test PWA on Mobile (Android)

**Prerequisites:**
- Deploy to HTTPS server (Netlify, Vercel, etc.)
- Or use ngrok for local testing:
  ```bash
  npm install -g ngrok
  ngrok http 4173
  ```

**Steps:**
1. Open app URL in Chrome on Android
2. Look for "Add to Home Screen" prompt
3. Or tap menu (⋮) > "Install app"
4. Tap "Install"

**Expected:**
- ✅ App icon appears on home screen
- ✅ Opens in fullscreen mode
- ✅ Works like native app
- ✅ Can use offline (cached)

### Test PWA on iOS (iPhone/iPad)

**Steps:**
1. Open app URL in Safari
2. Tap Share button (box with arrow)
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"

**Expected:**
- ✅ App icon on home screen
- ✅ Opens in standalone mode
- ✅ No Safari UI

### Test Offline Functionality

**Steps:**
1. Open app and navigate to driver dashboard
2. Turn off WiFi and mobile data
3. Try to navigate within app

**Expected:**
- ✅ Previously loaded pages still work
- ✅ Shows offline.html for new requests
- ✅ GPS tracking pauses (no internet)
- ✅ Data syncs when connection restored

### Test Install Prompt

**Steps:**
1. Open app in browser (not installed)
2. Navigate to driver dashboard
3. Look for install prompt at bottom of screen

**Expected:**
- ✅ Prompt appears with "Install Now" button
- ✅ Shows features: Quick access, Offline, Notifications
- ✅ Can dismiss and reappear after 7 days
- ✅ Clicking "Install Now" triggers installation

---

## Troubleshooting

### Issue: GPS not working

**Possible Causes:**
1. Location permission denied
2. HTTPS required (use ngrok for testing)
3. Browser doesn't support Geolocation API

**Solution:**
```javascript
// Check browser console for errors
navigator.geolocation.getCurrentPosition(
    (pos) => console.log('GPS works:', pos),
    (err) => console.error('GPS error:', err)
);
```

### Issue: Service Worker not registering

**Check:**
1. Open DevTools > Application > Service Workers
2. Look for errors in console
3. Ensure service-worker.js is in /public folder
4. Try hard refresh (Ctrl+Shift+R)

**Solution:**
```bash
# Clear browser cache and reload
# Or unregister and re-register:
```
Open Console:
```javascript
navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
        registration.unregister();
    }
});
location.reload();
```

### Issue: PWA not installable

**Requirements:**
- ✅ Served over HTTPS
- ✅ Has valid manifest.json
- ✅ Has service worker registered
- ✅ Icons in correct sizes exist

**Check Lighthouse:**
- Run Lighthouse audit
- Fix any failing PWA criteria

### Issue: Deliveries not showing

**Check:**
1. Backend API running?
2. CORS configured correctly?
3. Driver has assigned deliveries?
4. Check network tab in DevTools

**SQL Check:**
```sql
SELECT COUNT(*) as count
FROM deliveries
WHERE driver_id = @driver_id
AND status != 'DELIVERED';
```

### Issue: Photo upload failing

**Check:**
1. File size < 10MB?
2. Image type supported?
3. Backend endpoint working?
4. FormData sent correctly?

**Test Backend:**
```bash
curl -X POST http://localhost:8080/api/deliveries/1/proof \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.jpg"
```

---

## Performance Tips

1. **Optimize Images:**
   - Create actual app icons in all sizes
   - Compress to reduce file size
   - Use PNG format

2. **Service Worker Cache:**
   - Cache static assets
   - Don't cache API responses
   - Clear old caches on update

3. **GPS Updates:**
   - 30 seconds is good balance
   - Don't update too frequently (battery drain)
   - Pause when app in background

4. **Auto-refresh:**
   - 30 seconds for dashboard
   - Don't refresh when user is interacting
   - Show loading indicators

---

## Success Criteria Checklist

- [ ] Driver can login successfully
- [ ] Dashboard shows driver profile and stats
- [ ] Assigned deliveries display correctly
- [ ] GPS tracking works and updates backend
- [ ] Driver can change status
- [ ] Full delivery workflow works (ASSIGNED → DELIVERED)
- [ ] Customer contact buttons work (call, SMS, navigate)
- [ ] Photo upload works
- [ ] PWA installs on desktop
- [ ] PWA installs on mobile
- [ ] Offline mode works
- [ ] Install prompt appears
- [ ] Service worker registers correctly
- [ ] Push notifications ready (optional)

---

## Next Steps After Testing

1. **Deploy to Production:**
   - Build production bundle: `npm run build`
   - Deploy to HTTPS server
   - Update API_URL in .env

2. **Configure Backend for Production:**
   - Set proper CORS origins
   - Configure file upload storage
   - Set up push notification service

3. **Monitor Usage:**
   - Track GPS update frequency
   - Monitor delivery completion times
   - Analyze offline usage patterns

4. **Gather Driver Feedback:**
   - Is UI intuitive?
   - Any missing features?
   - Performance issues?

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify backend API responses in Network tab
3. Check database records
4. Review server logs
5. Test in different browsers (Chrome, Firefox, Safari)

Happy Testing! 🚚📦
