# Shiprocket Integration Guide

This guide explains how to set up and use Shiprocket as a shipping partner for your Premium Orchard e-commerce website.

## Prerequisites

1. A Shiprocket account - Sign up at [https://shiprocket.in](https://shiprocket.in)
2. API credentials (Username and Password) from your Shiprocket Dashboard
3. Channel ID from your Shiprocket Dashboard
4. Configured pickup locations in your Shiprocket account

## Setup Instructions

### 1. Get Your Shiprocket Credentials

1. Log in to your Shiprocket Dashboard
2. Go to **Settings** → **API** section
3. Note down your **Username** and **Password** for API access
4. Go to **Settings** → **Channels** and note your **Channel ID**

### 2. Configure Environment Variables

Add the following environment variables to your hosting platform (Vercel, Netlify, etc.):

```bash
# Shiprocket API Credentials
SHIPROCKET_USERNAME=your_shiprocket_username
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_CHANNEL_ID=your_channel_id

# Your pickup pincode (update this with your actual warehouse/pickup location)
SHIPROCKET_PICKUP_PINCODE=110001
```

### 3. Configure Pickup Locations

1. In your Shiprocket Dashboard, go to **Settings** → **Pickup Locations**
2. Add your warehouse/pickup address
3. Set it as your default pickup location
4. Note the pickup location name (usually "Primary")

### 4. Update Default Values

In `src/services/orderService.ts`, update the default pickup pincode:

```typescript
// Update line 227 with your actual pickup pincode
pickupPincode: string = '110001' // Replace with your pickup pincode
```

In `api/create-shipment.js`, update the Channel ID if you prefer hardcoding:

```javascript
// Update line 117 with your Channel ID
channel_id: process.env.SHIPROCKET_CHANNEL_ID || 'your_channel_id',
```

### 5. Product Configuration

Update HSN codes for your products in the shipping service files:

```typescript
// In api/create-shipment.js, line 158
hsn: '08134000', // HSN code for dried fruits and nuts - update as needed
```

## Features Included

### Automatic Shipment Creation
- Shipments are automatically created after successful payment
- Order status is updated to "processing" when shipment is created
- Tracking information is stored in your database

### Shipping Rate Calculator
- Real-time shipping rates based on pincode and weight
- COD vs Prepaid pricing
- Multiple courier options

### Shipment Tracking
- Track shipments using AWB code
- Real-time status updates
- Integration with your order management

### Admin Features
- Manual shipment creation for COD orders
- Bulk shipment processing
- Pickup scheduling

## API Endpoints

The integration includes these API endpoints:

### 1. Create Shipment
**POST** `/api/create-shipment`

Creates a shipment in Shiprocket for the given order.

```javascript
// Request body
{
  "order": orderObject,
  "pickupLocation": "Primary"
}

// Response
{
  "success": true,
  "order_id": 12345,
  "shipment_id": 67890,
  "awb_code": "AWB123456",
  "courier_name": "BlueDart"
}
```

### 2. Calculate Shipping
**POST** `/api/calculate-shipping`

Calculates shipping rates for given parameters.

```javascript
// Request body
{
  "pickupPincode": "110001",
  "deliveryPincode": "400001",
  "weight": 0.5,
  "isCod": false
}

// Response
{
  "success": true,
  "serviceable": true,
  "shipping_options": [...],
  "recommended": {...}
}
```

### 3. Track Shipment
**GET** `/api/track-shipment?awb=AWB123456`

Tracks a shipment using AWB code.

```javascript
// Response
{
  "success": true,
  "awb_code": "AWB123456",
  "current_status": "In Transit",
  "estimated_delivery": "2024-01-15",
  "tracking_data": {...}
}
```

## Order Flow Integration

### 1. Checkout Process
1. Customer completes checkout with shipping address
2. Payment is processed via Razorpay
3. Order is created in your database
4. **Automatic shipment creation** is triggered
5. Customer receives confirmation with tracking details

### 2. Order Management
1. View orders in admin panel with shipping status
2. Track shipments directly from order details
3. Manual shipment creation for failed auto-creation
4. Bulk operations for multiple orders

## Testing

### 1. Test Mode
Shiprocket provides a test environment. Set up test credentials for development:

```bash
# Test environment (use test credentials)
SHIPROCKET_USERNAME=test_username
SHIPROCKET_PASSWORD=test_password
```

### 2. Pincode Testing
Test with different pincodes to verify:
- Serviceability check
- Rate calculation
- Delivery estimates

### 3. Weight Calculation
The system automatically calculates package weight based on items. Test with different product combinations.

## Production Deployment

### 1. Environment Setup
1. Set production Shiprocket credentials in your hosting platform
2. Update pickup location details
3. Configure webhook URLs (if needed)

### 2. Monitoring
- Monitor shipment creation success rates
- Set up alerts for failed shipments
- Track delivery performance

### 3. Customer Communication
- Send tracking details via email/SMS
- Provide order tracking page
- Set up delivery notifications

## Troubleshooting

### Common Issues

#### 1. Authentication Failed
- Verify username and password
- Check if credentials are properly set in environment
- Ensure no extra spaces in credentials

#### 2. Shipment Creation Failed
- Verify pickup location is configured
- Check product weight calculations
- Ensure all required fields are provided
- Verify pincode serviceability

#### 3. Rate calculation fails
- Check pickup and delivery pincodes
- Verify weight is within limits
- Ensure serviceable area

### Error Handling
The integration includes comprehensive error handling:
- Failed shipments don't block order completion
- Retry mechanisms for temporary failures
- Detailed error logging

## Support

### Shiprocket Support
- Email: support@shiprocket.in
- Phone: +91-11-4603-9999
- Documentation: [https://apidocs.shiprocket.in](https://apidocs.shiprocket.in)

### Technical Support
- Check console logs for detailed error messages
- Verify all environment variables are set
- Test with different pincodes and weights

## Advanced Configuration

### Custom Package Dimensions
Update `calculatePackageDimensions` function in shipping service files to match your actual package sizes.

### Multiple Pickup Locations
Configure different pickup locations for different product categories or regions.

### Custom Shipping Rules
Implement custom logic for shipping rate calculations, free shipping thresholds, etc.

### Webhooks
Set up Shiprocket webhooks for real-time status updates (optional).

## Security Notes

1. **Never expose API credentials** in frontend code
2. Use environment variables for all sensitive data
3. Implement proper error handling to avoid credential leakage
4. Regularly rotate API credentials

## Conclusion

With this Shiprocket integration, your Premium Orchard website now has:
- Automated shipping management
- Real-time rate calculations
- Comprehensive order tracking
- Admin tools for shipping operations

The integration follows the same pattern as your Razorpay setup, ensuring consistency and maintainability.