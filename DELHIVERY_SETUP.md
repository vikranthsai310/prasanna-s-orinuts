# Delhivery Integration Guide

Complete guide for setting up and using Delhivery as your shipping partner for Premium Orchard e-commerce website.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Delhivery API Credentials](#getting-delhivery-api-credentials)
3. [Environment Setup](#environment-setup)
4. [Warehouse Configuration](#warehouse-configuration)
5. [Testing the Integration](#testing-the-integration)
6. [Features Included](#features-included)
7. [API Endpoints](#api-endpoints)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

1. **Delhivery Account** - Sign up at [https://www.delhivery.com](https://www.delhivery.com)
2. **Active API Token** - Get from Delhivery Dashboard
3. **Registered Warehouse** - Configure pickup location in Delhivery account
4. **Vercel/Netlify Deployment** - For serverless API functions

---

## Getting Delhivery API Credentials

### Step 1: Create Delhivery Account

1. Visit [https://www.delhivery.com](https://www.delhivery.com)
2. Click on **"Sign Up"** or **"Get Started"**
3. Fill in your business details:
   - Business Name
   - Contact Person
   - Email & Phone
   - GST Number (if applicable)
4. Complete the verification process

### Step 2: Get API Token

1. Log in to your Delhivery Dashboard
2. Navigate to **Settings** → **API**
3. You'll find your **10-digit Surface Tracking API Token**
4. Copy this token - you'll need it for environment variables

**Important:** Keep your API token secure. Never commit it to version control.

### Step 3: Get Warehouse Details

1. In Delhivery Dashboard, go to **Settings** → **Warehouse Management**
2. Add your warehouse/pickup location with complete details:
   - Warehouse Name
   - Complete Address
   - City, State, Pincode
   - Contact Person Name & Phone
3. Note down all these details for environment configuration

---

## Environment Setup

### Local Development (.env file)

Create a `.env` file in your project root with the following variables:

```bash
# ===================================
# DELHIVERY CONFIGURATION
# ===================================

# API Token (10-digit token from Delhivery Dashboard)
DELHIVERY_API_TOKEN=your_10_digit_token_here

# API URL (use staging for testing, production for live)
DELHIVERY_API_URL=https://track.delhivery.com/api
# For staging: https://staging-express.delhivery.com/api

# Production Mode (set to 'true' for live environment)
VITE_DELHIVERY_PRODUCTION=false

# Client Name for tracking
VITE_DELHIVERY_CLIENT_NAME=PremiumOrchard

# ===================================
# WAREHOUSE/PICKUP LOCATION
# ===================================

DELHIVERY_WAREHOUSE_NAME=Premium Orchard Warehouse
DELHIVERY_PICKUP_ADDRESS=123, Business Plaza, MG Road
DELHIVERY_PICKUP_CITY=Mumbai
DELHIVERY_PICKUP_STATE=Maharashtra
DELHIVERY_PICKUP_PINCODE=400001
DELHIVERY_PICKUP_PHONE=9876543210
DELHIVERY_PICKUP_CONTACT=John Doe
```

### Production Deployment (Vercel/Netlify)

#### For Vercel:

1. Go to your project dashboard on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable individually:
   - Variable Name: `DELHIVERY_API_TOKEN`
   - Value: Your actual token
   - Environment: Production, Preview, Development (select all)
4. Repeat for all variables listed above

#### For Netlify:

1. Go to **Site Settings** → **Build & Deploy** → **Environment**
2. Click **Edit Variables**
3. Add all the Delhivery variables listed above

---

## Warehouse Configuration

### Complete Warehouse Setup in Delhivery

1. **Login to Delhivery Dashboard**
   - Go to [https://www.delhivery.com](https://www.delhivery.com)
   - Login with your credentials

2. **Add Warehouse Details**
   - Navigate to **Warehouse Management**
   - Click **"Add New Warehouse"**
   - Fill in complete details:
     ```
     Warehouse Name: Premium Orchard Warehouse
     Address Line 1: 123, Business Plaza
     Address Line 2: MG Road
     City: Mumbai
     State: Maharashtra
     Pincode: 400001
     Contact Person: John Doe
     Phone: 9876543210
     Email: warehouse@premiumorchard.com
     ```

3. **Set as Default Pickup Location**
   - Mark this warehouse as your primary pickup location
   - Delhivery will use this for all shipment pickups

4. **Verify Warehouse**
   - Delhivery may require physical verification
   - This usually takes 1-2 business days
   - You'll receive a confirmation email once verified

---

## Testing the Integration

### Test Mode (Staging Environment)

1. **Use Staging API URL:**
   ```bash
   DELHIVERY_API_URL=https://staging-express.delhivery.com/api
   VITE_DELHIVERY_PRODUCTION=false
   ```

2. **Test Pincodes:**
   - Use these pincodes for testing:
     - Mumbai: 400001
     - Delhi: 110001
     - Bangalore: 560001

3. **Test Shipment Creation:**
   ```bash
   # Run your dev server
   npm run dev
   
   # Create a test order with delivery to test pincode
   # Check if shipment is created successfully
   ```

### Production Mode

1. **Switch to Production API:**
   ```bash
   DELHIVERY_API_URL=https://track.delhivery.com/api
   VITE_DELHIVERY_PRODUCTION=true
   ```

2. **Verify with Real Orders:**
   - Create a test order with actual delivery address
   - Check Delhivery dashboard for shipment creation
   - Track the shipment using waybill number

---

## Features Included

### 1. Automatic Shipment Creation ✅

- Shipments are automatically created after successful payment
- Order status updates to "processing"
- Waybill (tracking) number is stored in order details

**How it works:**
```
Customer Payment → Order Created → API Call to Delhivery → Shipment Created → Tracking Number Saved
```

### 2. Real-time Shipping Rate Calculator ✅

- Calculate shipping costs based on:
  - Pickup pincode
  - Delivery pincode
  - Package weight
  - COD vs Prepaid
- Check serviceability before order placement

**Endpoint:** `POST /api/calculate-shipping`

### 3. Shipment Tracking ✅

- Track shipments using waybill number
- Real-time status updates
- Estimated delivery date
- Complete tracking history

**Endpoint:** `GET /api/track-shipment?waybill=ABC123456`

### 4. Pincode Serviceability Check ✅

- Verify if delivery is available for a pincode
- Check COD availability
- Identify ODA (Out of Delivery Area) locations

### 5. Automatic Package Calculation ✅

- Weight calculation based on items
- Dimensions calculation for optimal packaging
- HSN code integration for dried fruits/nuts

---

## API Endpoints

### 1. Calculate Shipping Rates

**Endpoint:** `POST /api/calculate-shipping`

**Request Body:**
```json
{
  "pickupPincode": "110001",
  "deliveryPincode": "400001",
  "weight": 0.5,
  "cod": false
}
```

**Response:**
```json
{
  "success": true,
  "serviceable": true,
  "codAvailable": true,
  "isODA": false,
  "shippingOptions": [
    {
      "id": "delhivery_express",
      "name": "Delhivery Express",
      "provider": "Delhivery",
      "deliveryTime": "1-2 days",
      "freight_charge": 70,
      "cod_charges": 0,
      "total_amount": 70,
      "currency": "INR",
      "serviceType": "Express"
    }
  ]
}
```

### 2. Create Shipment

**Endpoint:** `POST /api/create-shipment`

**Request Body:**
```json
{
  "order": {
    "id": "ORD123456",
    "userId": "user@example.com",
    "items": [
      {
        "id": "PROD001",
        "name": "Premium Almonds",
        "quantity": 2,
        "price": 250,
        "weight": "500g"
      }
    ],
    "totalAmount": 500,
    "paymentMethod": "prepaid",
    "shippingAddress": {
      "name": "John Doe",
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "phone": "9876543210"
    },
    "createdAt": {
      "seconds": 1700000000
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "waybill": "ABC123456789",
  "order_id": "ORD123456",
  "message": "Shipment created successfully"
}
```

### 3. Track Shipment

**Endpoint:** `GET /api/track-shipment?waybill=ABC123456`

**Response:**
```json
{
  "success": true,
  "waybill": "ABC123456789",
  "current_status": "In Transit",
  "estimated_delivery": "2025-10-20",
  "tracking_history": [
    {
      "status": "Picked Up",
      "date": "2025-10-17T10:00:00",
      "location": "Mumbai Hub",
      "instructions": "Package picked up from sender"
    },
    {
      "status": "In Transit",
      "date": "2025-10-18T14:30:00",
      "location": "Delhi Hub",
      "instructions": "Package in transit"
    }
  ],
  "track_url": "https://www.delhivery.com/track/package/ABC123456789"
}
```

---

## Shipping Rate Structure

### Base Rates (Approximate)

| Zone | Weight | Base Rate | Per Kg Additional |
|------|--------|-----------|-------------------|
| Metro Cities | 0.5 kg | ₹50 | ₹30/kg |
| Tier 1 Cities | 0.5 kg | ₹50 | ₹35/kg |
| Tier 2 Cities | 0.5 kg | ₹50 | ₹40/kg |
| Rest of India | 0.5 kg | ₹50 | ₹45/kg |
| ODA Locations | 0.5 kg | ₹50 | ₹60/kg |

### Additional Charges

- **COD Charges:** ₹50 per order (if enabled)
- **Fuel Surcharge:** As per Delhivery policy
- **ODA Surcharge:** Automatic for remote areas

---

## Delivery Time Estimates

| Location Type | Estimated Delivery |
|--------------|-------------------|
| Metro Cities | 1-2 business days |
| Tier 1 Cities | 2-3 business days |
| Tier 2 Cities | 3-5 business days |
| Rest of India | 5-7 business days |
| ODA Locations | 7-10 business days |

**Metro Cities:** Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad

---

## Troubleshooting

### Issue 1: "Delhivery API token is not configured"

**Solution:**
- Verify `.env` file has `DELHIVERY_API_TOKEN`
- Check if token is 10 digits
- Ensure no extra spaces or quotes
- Redeploy if on Vercel/Netlify

### Issue 2: "Delivery not available for this pincode"

**Solution:**
- Verify pincode is 6 digits
- Check if pincode is serviceable on Delhivery website
- Try with a known metro city pincode for testing

### Issue 3: "Failed to create shipment"

**Possible Causes:**
1. **Incomplete warehouse details** - Add complete address in Delhivery dashboard
2. **Unverified warehouse** - Wait for Delhivery verification (1-2 days)
3. **Invalid API token** - Regenerate token from dashboard
4. **Missing required fields** - Check order data has all required fields

**Solution:**
```bash
# Check logs for specific error
console.log(error.message);

# Verify environment variables
echo $DELHIVERY_API_TOKEN
```

### Issue 4: "Tracking not working"

**Solution:**
- Waybill number takes 2-4 hours to be trackable
- Verify waybill number is correct
- Check if shipment was created successfully
- Try tracking on Delhivery website directly

### Issue 5: "COD not available"

**Solution:**
- COD may not be available for all pincodes
- Check `codAvailable` field in shipping calculation response
- Use prepaid payment for areas where COD is not available

---

## Code Integration Examples

### Frontend - Calculate Shipping

```typescript
import { calculateShippingRate } from '@/services/delhiveryService';

const checkShipping = async () => {
  const result = await calculateShippingRate({
    origin: '110001',
    destination: '400001',
    weight: 0.5,
    cod: false
  });
  
  if (result.status) {
    console.log('Shipping Cost:', result.data.total_amount);
    console.log('Delivery Time:', result.data.delivery_time);
  }
};
```

### Backend - Create Shipment

```javascript
// api/create-shipment.js automatically called after order creation
// No additional code needed - integrated with order flow
```

### Frontend - Track Shipment

```typescript
import { trackShipment } from '@/services/delhiveryService';

const trackOrder = async (waybill: string) => {
  const tracking = await trackShipment(waybill);
  console.log('Current Status:', tracking.ShipmentData[0].Shipment.Status.Status);
};
```

---

## Best Practices

### 1. Error Handling

Always wrap Delhivery API calls in try-catch blocks:

```typescript
try {
  const shipment = await createDelhiveryShipment(data);
} catch (error) {
  // Log error
  console.error('Shipment creation failed:', error);
  // Notify admin
  sendAdminAlert('Shipment failed for order: ' + orderId);
  // Show user-friendly message
  toast.error('Unable to create shipment. Please contact support.');
}
```

### 2. Retry Logic

Implement retry logic for transient failures:

```typescript
const retryShipment = async (data, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await createDelhiveryShipment(data);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
};
```

### 3. Logging

Log all API interactions for debugging:

```typescript
console.log('Creating shipment for order:', orderId);
console.log('Request data:', JSON.stringify(shipmentData));
console.log('Response:', JSON.stringify(response));
```

### 4. Testing

Test with staging environment before going live:

```bash
# .env.local for testing
VITE_DELHIVERY_PRODUCTION=false
DELHIVERY_API_URL=https://staging-express.delhivery.com/api
```

---

## Support & Resources

### Delhivery Resources
- **Dashboard:** [https://www.delhivery.com](https://www.delhivery.com)
- **API Documentation:** Contact Delhivery support for official docs
- **Support Email:** support@delhivery.com
- **Support Phone:** 011-4948-4000

### Project Resources
- **GitHub Issues:** Report bugs or request features
- **Documentation:** Check other .md files in project root
- **Support Email:** support@premiumorchard.com

---

## Checklist for Go-Live

- [ ] Delhivery account created and verified
- [ ] API token obtained and added to environment variables
- [ ] Warehouse details added and verified
- [ ] Test orders placed and tracked successfully
- [ ] Production API URL configured
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Customer support trained on shipment tracking
- [ ] Backup plan in place for API failures

---

## Updates & Changelog

### Version 1.0.0 (October 2025)
- Initial Delhivery integration
- Replace Shiprocket with Delhivery
- Shipping rate calculation
- Shipment creation automation
- Tracking functionality

---

## License

This integration is part of the Premium Orchard e-commerce platform.

---

**Need Help?** Contact the development team or refer to other documentation files in the project.
