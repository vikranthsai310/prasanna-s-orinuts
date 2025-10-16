# Delhivery Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Get Delhivery Credentials (2 minutes)
1. Sign up at [Delhivery.com](https://www.delhivery.com)
2. Get your 10-digit API token from Dashboard → Settings → API
3. Note your warehouse details

### Step 2: Configure Environment Variables (2 minutes)

Add to your `.env` file:

```bash
# Required
DELHIVERY_API_TOKEN=your_10_digit_token
DELHIVERY_WAREHOUSE_NAME=Your Warehouse Name
DELHIVERY_PICKUP_ADDRESS=Your Address
DELHIVERY_PICKUP_CITY=City
DELHIVERY_PICKUP_STATE=State
DELHIVERY_PICKUP_PINCODE=110001
DELHIVERY_PICKUP_PHONE=9876543210
DELHIVERY_PICKUP_CONTACT=Contact Name

# Optional (defaults provided)
DELHIVERY_API_URL=https://track.delhivery.com/api
VITE_DELHIVERY_PRODUCTION=false
```

### Step 3: Deploy (1 minute)

**For Vercel:**
```bash
# Add all variables to Vercel dashboard
vercel env add DELHIVERY_API_TOKEN
# Add remaining variables...
vercel --prod
```

**For Netlify:**
```bash
# Add to Netlify dashboard: Site Settings → Environment Variables
netlify deploy --prod
```

### Step 4: Test

```bash
# Test shipping calculation
curl -X POST https://your-domain.com/api/calculate-shipping \
  -H "Content-Type: application/json" \
  -d '{
    "pickupPincode": "110001",
    "deliveryPincode": "400001",
    "weight": 0.5,
    "cod": false
  }'
```

---

## 📦 How It Works

```
Customer Order → Payment Success → Create Shipment API → Delhivery → Tracking Number
```

**Automatic Process:**
1. Customer places order
2. Payment is successful
3. Backend automatically calls `/api/create-shipment`
4. Delhivery creates shipment and returns waybill number
5. Waybill is saved to order for tracking

**No manual intervention needed!**

---

## 🔧 Key Files Created

| File | Purpose |
|------|---------|
| `src/config/delhivery.ts` | Configuration & settings |
| `src/services/delhiveryService.ts` | Frontend service functions |
| `api/calculate-shipping.js` | Rate calculation endpoint |
| `api/create-shipment.js` | Shipment creation endpoint |
| `api/track-shipment.js` | Tracking endpoint |
| `DELHIVERY_SETUP.md` | Complete documentation |

---

## 🎯 Common Tasks

### Check if Pincode is Serviceable

```typescript
import { checkServiceability } from '@/services/delhiveryService';

const result = await checkServiceability({
  pickup_pincode: '110001',
  delivery_pincode: '400001',
  weight: 0.5,
  cod: false
});

if (result.delivery_codes[0].postal_code.pre_paid === 'Y') {
  console.log('Delivery available!');
}
```

### Calculate Shipping Cost

```typescript
import { calculateShippingRate } from '@/services/delhiveryService';

const rate = await calculateShippingRate({
  origin: '110001',
  destination: '400001',
  weight: 0.5,
  cod: false
});

console.log('Shipping cost:', rate.data.total_amount);
```

### Track Order

```typescript
import { trackShipment } from '@/services/delhiveryService';

const tracking = await trackShipment('ABC123456');
const status = tracking.ShipmentData[0].Shipment.Status.Status;
console.log('Order status:', status);
```

---

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| "API token not configured" | Add `DELHIVERY_API_TOKEN` to environment |
| "Pincode not serviceable" | Check pincode on Delhivery website |
| "Warehouse not verified" | Wait 1-2 days for Delhivery verification |
| Tracking not working | Wait 2-4 hours after shipment creation |

---

## 📊 Shipping Rates (Estimated)

| Weight | Metro | Tier 1 | Tier 2 | ODA |
|--------|-------|--------|--------|-----|
| 0.5 kg | ₹65   | ₹70    | ₹70    | ₹80 |
| 1.0 kg | ₹95   | ₹105   | ₹110   | ₹140|
| 2.0 kg | ₹155  | ₹175   | ₹190   | ₹260|

**COD Charges:** ₹50 (if enabled)

---

## 🌐 API Endpoints

### Calculate Shipping
```
POST /api/calculate-shipping
Body: { pickupPincode, deliveryPincode, weight, cod }
```

### Create Shipment
```
POST /api/create-shipment
Body: { order: {...} }
```

### Track Shipment
```
GET /api/track-shipment?waybill=ABC123
```

---

## 📞 Support

- **Delhivery Support:** 011-4948-4000
- **Email:** support@delhivery.com
- **Dashboard:** [delhivery.com](https://www.delhivery.com)

For complete documentation, see [DELHIVERY_SETUP.md](./DELHIVERY_SETUP.md)

---

**✅ You're all set!** Orders will automatically create shipments with Delhivery.
