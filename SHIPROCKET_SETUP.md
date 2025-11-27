# 🚀 Shiprocket Integration Setup Guide

Complete guide to set up Shiprocket shipping for Prasanna's Orinuts.

## 📋 Overview

Shiprocket is now the primary shipping provider for the application. This guide will help you configure and use Shiprocket for order fulfillment.

---

## 🔧 Prerequisites

1. **Shiprocket Account**: Sign up at https://www.shiprocket.in/
2. **Verified Business**: Complete business verification in Shiprocket
3. **Pickup Location**: Set up your warehouse/pickup location in Shiprocket dashboard
4. **Channel Setup**: Create a channel for your store (if not auto-created)

---

## 🔐 Step 1: Get Shiprocket Credentials

### 1.1 Login to Shiprocket Dashboard

1. Go to https://www.shiprocket.in/
2. Login with your account credentials

### 1.2 Get API Credentials

Your API credentials are simply your Shiprocket account login:

- **Email**: Your Shiprocket account email
- **Password**: Your Shiprocket account password

### 1.3 Get Channel ID (Optional but Recommended)

1. In Shiprocket Dashboard, go to **Settings** → **Channel**
2. Find your channel (e.g., "Custom Channel" or your store name)
3. Note the **Channel ID** (usually a 7-digit number)

---

## ⚙️ Step 2: Configure Environment Variables

### 2.1 Local Development (.env file)

Create/update your `.env` file in the project root:

```env
# Shiprocket Configuration
VITE_SHIPROCKET_EMAIL=your_shiprocket_email@example.com
VITE_SHIPROCKET_PASSWORD=your_shiprocket_password
VITE_SHIPROCKET_CHANNEL_ID=1234567
```

### 2.2 Vercel/Production Deployment

Add these environment variables in your deployment platform:

**For Vercel:**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_SHIPROCKET_EMAIL` | your_shiprocket_email@example.com | Production, Preview, Development |
| `VITE_SHIPROCKET_PASSWORD` | your_shiprocket_password | Production, Preview, Development |
| `VITE_SHIPROCKET_CHANNEL_ID` | 1234567 | Production, Preview, Development |

4. **Redeploy** your application after adding variables

---

## 🏢 Step 3: Set Up Pickup Location in Shiprocket

### 3.1 Add Pickup Location

1. Login to Shiprocket Dashboard
2. Go to **Settings** → **Pickup Location**
3. Click **Add Pickup Location**
4. Fill in your warehouse details:
   - **Pickup Location Name**: Prasannas Orinuts Warehouse
   - **Address**: Shiv Nivas Opposite Road no-7 Pragathinagar moosapet
   - **City**: Hyderabad
   - **State**: Telangana
   - **Pincode**: 500018
   - **Phone**: 9398649506
   - **Email**: prasannasorinuts@gmail.com
5. Save the pickup location

### 3.2 Set as Default

- Make this your default pickup location for automatic selection

---

## 📦 Step 4: How to Use Shiprocket in Your Application

### 4.1 Creating Shipments

1. **Admin Dashboard** → **Delivery Management**
2. View all paid orders
3. For each order, you can:
   - **Create Shiprocket Shipment**: Automatically creates order in Shiprocket and assigns courier
   - **Track Shipment**: Check real-time shipment status

### 4.2 Order Flow

```
1. Customer places order → Order saved in Firebase
2. Payment completed → Order status: "Paid"
3. Admin creates Shiprocket shipment → Shiprocket assigns courier
4. Pickup scheduled → Courier picks up from your location
5. In transit → Customer receives tracking updates
6. Delivered → Order marked as delivered
```

### 4.3 What Happens When You Create a Shipment

The application automatically:
- Creates an order in Shiprocket with customer details
- Calculates package weight from order items
- Gets best courier options from Shiprocket
- Generates AWB (Air Way Bill) number
- Schedules pickup from your warehouse
- Updates order in your database with tracking info

---

## 🔍 Step 5: Testing

### 5.1 Test the Integration

1. Place a test order on your website
2. Mark payment as successful
3. Go to Admin → Delivery Management
4. Click "Create Shiprocket Shipment"
5. Check logs for success message
6. Verify in Shiprocket Dashboard that order was created

### 5.2 Expected Logs

```
🚀 Creating Shiprocket order: { orderId: 'xxx', weight: 0.5 }
✅ Shiprocket order created successfully: { order_id: xxx, awb_code: 'xxx' }
```

### 5.3 Common Success Indicators

- ✅ Shiprocket Order ID is generated
- ✅ AWB Code is assigned
- ✅ Courier is selected
- ✅ Order appears in Shiprocket Dashboard
- ✅ Order status in your app changes to "Processing"

---

## ❗ Troubleshooting

### Issue: "Shiprocket credentials are missing"

**Solution**: Check that all environment variables are set correctly:
```bash
# Check .env file has:
VITE_SHIPROCKET_EMAIL=...
VITE_SHIPROCKET_PASSWORD=...
```

### Issue: "Shiprocket authentication failed"

**Solutions**:
1. Verify email and password are correct
2. Login to Shiprocket dashboard manually to confirm credentials
3. Check if your Shiprocket account is active

### Issue: "Channel ID is missing"

**Solution**: 
1. Get Channel ID from Shiprocket Dashboard → Settings → Channel
2. Add `VITE_SHIPROCKET_CHANNEL_ID` to your environment variables

### Issue: "Pickup location not found"

**Solution**:
1. Ensure pickup location is added in Shiprocket Dashboard
2. Set it as default pickup location
3. Use exact name when creating shipments

---

## 📊 Features

### ✅ Implemented Features

- **Automatic Order Creation**: Orders are automatically created in Shiprocket
- **Weight Calculation**: Package weight is calculated from cart items
- **Courier Selection**: Shiprocket automatically selects best courier
- **Tracking**: Real-time shipment tracking via AWB code
- **Multi-carrier**: Access to 17+ courier partners through Shiprocket
- **Pan-India Delivery**: Ship anywhere in India
- **COD Support**: Cash on Delivery enabled
- **Rate Calculation**: Automatic shipping rate calculation

### 🎯 How It's Better Than Delhivery

1. **✅ User-Friendly**: Much simpler dashboard and API
2. **✅ Multi-Carrier**: Access to 17+ couriers vs single carrier
3. **✅ Better Rates**: Competitive shipping rates
4. **✅ Easy Setup**: No complex warehouse registration
5. **✅ Better Support**: Dedicated support team
6. **✅ More Features**: NDR management, manifest generation, etc.

---

## 📁 File Structure

```
src/
├── config/
│   └── shiprocket.ts          # Shiprocket configuration
├── services/
│   ├── shippingService.ts     # Shiprocket API integration
│   └── shiprocketFeesService.ts # Shipping fee calculations
└── pages/
    └── admin/
        └── DeliveryManagement.tsx # Order management UI
```

---

## 🔄 Migration from Delhivery

All Delhivery references have been removed:
- ❌ Deleted: `delhiveryService.ts`
- ❌ Deleted: `delhiveryFeesService.ts`
- ❌ Deleted: `delhivery.ts` config
- ❌ Deleted: Delhivery API endpoints
- ❌ Deleted: Delhivery documentation files
- ✅ Updated: All order types to use Shiprocket fields
- ✅ Updated: DeliveryManagement component
- ✅ Updated: Cart and Checkout pages

---

## 📞 Support

### Shiprocket Support
- Website: https://www.shiprocket.in/
- Email: support@shiprocket.in
- Phone: +91-120-4627928

### Application Support
- Check console logs for detailed error messages
- Verify all environment variables are set
- Ensure Shiprocket account is active and verified

---

## ✅ Checklist

Before going live, ensure:

- [ ] Shiprocket account is created and verified
- [ ] Pickup location is added and set as default
- [ ] Environment variables are set in production
- [ ] Test order successfully created in Shiprocket
- [ ] Tracking works correctly
- [ ] Payment integration is working
- [ ] Customer receives email notifications

---

## 🎉 You're All Set!

Your Shiprocket integration is complete and ready to use. Orders will now be automatically processed through Shiprocket for efficient shipping across India.

For any issues, check the troubleshooting section or contact Shiprocket support.
