# Delivery Management System

## Overview
The Delivery Management System allows admins to manage order deliveries through two methods:
1. **Self Delivery** - Deliver orders yourself or through your own logistics
2. **Delhivery Integration** - Automated pickup and delivery through Delhivery API

## Features

### ✅ Admin Delivery Management Page
- **Location**: `/admin/delivery`
- **Purpose**: Central hub for managing all paid orders that need delivery assignment
- **Access**: Admin users only

### 📊 Dashboard Stats
- Pending Assignment count
- Self Delivery count  
- Delhivery Assigned count
- Total Orders count

### 🔍 Filtering & Search
- Search by Order ID, Customer Name, or Phone Number
- Filter by delivery status:
  - All Orders
  - Pending Assignment
  - Self Delivery
  - Delhivery

### 📦 Order Information Display
Each order shows:
- Order ID and creation date
- Customer name and phone
- Full delivery address with pincode
- Order amount
- Current order status
- Delivery method status
- Waybill number (for Delhivery orders)

## How It Works

### 1. Order Flow
```
Payment Completed 
    ↓
Order appears in Delivery Management
    ↓
Admin assigns delivery method
    ↓
Self Delivery OR Delhivery
```

### 2. Self Delivery Process
1. Admin clicks "Assign Delivery" button on an order
2. Selects "I'll Deliver" option
3. Order marked as `deliveryMethod: 'self'`
4. Order status updated to `processing`
5. Admin can now prepare and deliver the package manually
6. Admin updates order status to `shipped` → `delivered` in Orders page

### 3. Delhivery Automation Process
1. Admin clicks "Assign Delivery" button on an order
2. Selects "Use Delhivery" option
3. **Automated Steps**:
   - Creates shipment via Delhivery API (`/api/create-shipment`)
   - Generates Waybill (AWB) number
   - Schedules pickup from your warehouse
   - Updates order with:
     - `deliveryMethod: 'delhivery'`
     - `delhiveryWaybill`: AWB number
     - `delhiveryPickupScheduled`: true
     - `trackingId`: AWB number
     - `orderStatus`: 'processing'
4. Delhivery courier picks up from warehouse automatically
5. Admin can track shipment in real-time
6. Customer receives tracking updates

## Database Schema Updates

### Order Model Changes
```typescript
export interface Order {
  // ... existing fields
  
  // NEW: Delivery method tracking
  deliveryMethod?: 'pending' | 'self' | 'delhivery';
  deliveryAssignedAt?: Timestamp;
  
  // NEW: Delhivery integration fields
  delhiveryWaybill?: string;
  delhiveryShipmentId?: string;
  delhiveryPickupScheduled?: boolean;
}
```

## API Endpoints

### 1. Get Paid Orders
- **Function**: `getPaidOrders()`
- **Purpose**: Fetch all orders with `paymentStatus === 'paid'`
- **Returns**: Array of Order objects

### 2. Assign Delivery Method
- **Function**: `assignDeliveryMethod(orderId, deliveryMethod)`
- **Parameters**:
  - `orderId`: string
  - `deliveryMethod`: 'self' | 'delhivery'
- **Updates**:
  - `deliveryMethod`
  - `deliveryAssignedAt`
  - `orderStatus` (if pending → processing)

### 3. Create Delhivery Shipment
- **Function**: `createDelhiveryShipmentForOrder(orderId)`
- **Process**:
  1. Validates order is paid
  2. Checks no existing shipment
  3. Calls `/api/create-shipment` endpoint
  4. Updates order with Delhivery details
- **Returns**: Shipment result with waybill number

## File Structure

### New Files
```
src/pages/admin/
  └── DeliveryManagement.tsx        # Main delivery management page

src/services/
  └── orderService.ts                # Updated with new functions
      - getPaidOrders()
      - assignDeliveryMethod()
      - createDelhiveryShipmentForOrder()
```

### Modified Files
```
src/App.tsx                          # Added /admin/delivery route
src/components/Header.tsx            # Added Delivery Management menu item
src/services/orderService.ts         # Added delivery management functions
```

## UI Components

### Delivery Assignment Modal
Two-option selector:
- **Self Delivery Card**
  - Blue theme
  - "I'll Deliver" button
  - Suitable for local/manual delivery
  
- **Delhivery Card**
  - Green theme
  - "Use Delhivery" button
  - Automated logistics integration

### Status Badges
- 🟡 **Pending Assignment**: Yellow badge
- 🔵 **Self Delivery**: Blue badge
- 🟢 **Delhivery Assigned**: Green badge with AWB number
- 🟣 **Processing Delhivery**: Purple badge (transitional state)

## Delhivery Integration Details

### Environment Variables Required
```env
# Delhivery API Configuration
DELHIVERY_API_TOKEN=your_10_digit_token
DELHIVERY_API_URL=https://track.delhivery.com/api
VITE_DELHIVERY_PRODUCTION=false

# Warehouse Details
DELHIVERY_WAREHOUSE_NAME=Premium Orchard Warehouse
DELHIVERY_PICKUP_ADDRESS=Your_warehouse_address
DELHIVERY_PICKUP_CITY=Your_city
DELHIVERY_PICKUP_STATE=Your_state  
DELHIVERY_PICKUP_PINCODE=Your_pincode
DELHIVERY_PICKUP_PHONE=Your_phone
```

### Delhivery API Call Structure
```javascript
POST /api/cmu/create.json
Headers:
  - Authorization: Token <DELHIVERY_API_TOKEN>
  - Content-Type: application/json

Body:
{
  format: 'json',
  data: {
    shipments: [{
      name: customer_name,
      add: customer_address,
      pin: customer_pincode,
      city: customer_city,
      state: customer_state,
      phone: customer_phone,
      order: order_id,
      payment_mode: 'Prepaid' or 'COD',
      return_pin: warehouse_pincode,
      // ... more fields
    }],
    pickup_location: {
      name: warehouse_name,
      add: warehouse_address,
      city: warehouse_city,
      pin_code: warehouse_pincode,
      country: 'India',
      phone: warehouse_phone
    }
  }
}
```

### Response Structure
```javascript
{
  success: true,
  waybill: "DELHIVERY_AWB_NUMBER",
  packages: [{
    waybill: "DELHIVERY_AWB_NUMBER",
    status: "Pending",
    client: "PremiumOrchard"
  }],
  rmk: "Shipment created successfully"
}
```

## Error Handling

### Common Errors
1. **Order not paid**: "Order payment is not completed"
2. **Already assigned**: "Delivery method already assigned to this order"
3. **Shipment exists**: "Delhivery shipment already created for this order"
4. **API failure**: Detailed error from Delhivery API

### Validation Checks
- ✅ Order must have `paymentStatus === 'paid'`
- ✅ Order must not have existing `deliveryMethod` (except 'pending')
- ✅ For Delhivery: No existing `delhiveryWaybill`
- ✅ Order must exist in database

## Usage Guide for Admins

### Step-by-Step: Assigning Delivery

#### For Self Delivery:
1. Navigate to `/admin/delivery`
2. Find the order needing delivery assignment
3. Click "Assign Delivery" button
4. Click "I'll Deliver" in the modal
5. Order is now marked for self-delivery
6. Prepare the package
7. Go to `/admin/orders` to update status as shipped → delivered

#### For Delhivery:
1. Navigate to `/admin/delivery`
2. Find the order needing delivery assignment
3. Click "Assign Delivery" button
4. Click "Use Delhivery" in the modal
5. Wait for shipment creation (2-3 seconds)
6. Success! Waybill number is displayed
7. Delhivery will automatically schedule pickup
8. Track shipment using "Track" button or waybill number

### Tracking Delhivery Shipments
- **From Delivery Management**: Click "Track" button next to order
- **External**: Visit `https://www.delhivery.com/track/package/{WAYBILL}`
- **Customer Tracking**: Customers get waybill in their order details

## Benefits

### For Admins:
✅ Centralized delivery management
✅ Clear visibility of delivery status
✅ Flexible delivery options
✅ Automated Delhivery integration
✅ Real-time tracking
✅ No manual waybill entry needed

### For Customers:
✅ Automatic tracking updates
✅ Professional logistics for distant deliveries
✅ Faster delivery times
✅ Real-time shipment status

### Business Benefits:
✅ Reduced manual work
✅ Better scalability
✅ Professional courier integration
✅ Cost-effective for bulk orders
✅ Clear audit trail

## Testing Checklist

### Self Delivery Testing:
- [ ] Can view paid orders
- [ ] Can assign self delivery
- [ ] Order status updates correctly
- [ ] Badge displays "Self Delivery"
- [ ] Can proceed to manual delivery workflow

### Delhivery Testing:
- [ ] Can assign Delhivery delivery
- [ ] API creates shipment successfully
- [ ] Waybill number is captured
- [ ] Order updates with all Delhivery fields
- [ ] Track button works
- [ ] Tracking URL is correct
- [ ] Pickup gets scheduled (check Delhivery dashboard)

### Edge Cases:
- [ ] Cannot assign delivery twice
- [ ] Only paid orders show up
- [ ] Error messages display correctly
- [ ] Search and filters work
- [ ] Mobile responsive
- [ ] Loading states work

## Troubleshooting

### Issue: Shipment creation fails
**Check:**
- Delhivery API token is valid
- Warehouse details are correct
- Order has valid address with pincode
- Network connectivity
- Delhivery API status

### Issue: Orders not appearing
**Check:**
- Order `paymentStatus` is 'paid'
- Database connection
- Admin permissions
- Filter settings

### Issue: Track button not working
**Check:**
- Waybill number is present in order
- External tracking URL is accessible
- No popup blockers

## Future Enhancements

### Planned Features:
- [ ] Bulk delivery assignment
- [ ] Delivery cost calculation
- [ ] Pickup scheduling for specific dates
- [ ] SMS notifications to customers
- [ ] Delivery partner comparison (Delhivery vs others)
- [ ] Delivery performance analytics
- [ ] Auto-assignment based on rules (distance, value, etc.)
- [ ] Return shipment management
- [ ] POD (Proof of Delivery) capture

## Support

For issues or questions:
1. Check Delhivery API logs in browser console
2. Check order document in Firestore
3. Verify environment variables
4. Review API response errors
5. Contact Delhivery support if API issues persist

---

**Last Updated**: November 16, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
