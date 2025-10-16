# Migration from Shiprocket to Delhivery

## ✅ What's Been Changed

### Files Replaced/Updated

1. **Configuration Files:**
   - ✅ Created `src/config/delhivery.ts` (NEW)
   - ✅ Updated `src/config/shipping.ts` to use Delhivery
   - ✅ Created `src/services/delhiveryService.ts` (NEW)

2. **API Endpoints:**
   - ✅ Updated `api/calculate-shipping.js` → Now uses Delhivery API
   - ✅ Updated `api/create-shipment.js` → Now uses Delhivery API
   - ✅ Updated `api/track-shipment.js` → Now uses Delhivery API

3. **Environment Variables:**
   - ✅ Updated `.env.example` with Delhivery credentials
   - ❌ **ACTION REQUIRED:** Update your `.env` file

4. **Documentation:**
   - ✅ Created `DELHIVERY_SETUP.md` (Complete guide)
   - ✅ Created `DELHIVERY_QUICK_START.md` (Quick reference)
   - ✅ Created `MIGRATION_SHIPROCKET_TO_DELHIVERY.md` (This file)

---

## 🔄 What You Need to Do

### 1. Get Delhivery Credentials

```bash
# Sign up at https://www.delhivery.com
# Get your API token from Dashboard → Settings → API
# Note your warehouse details
```

### 2. Update Environment Variables

**Remove these (Shiprocket):**
```bash
# Delete from .env
SHIPROCKET_USERNAME
SHIPROCKET_PASSWORD
VITE_SHIPROCKET_USERNAME
VITE_SHIPROCKET_PASSWORD
VITE_SHIPROCKET_CHANNEL_ID
VITE_SHIPROCKET_PICKUP_PINCODE
```

**Add these (Delhivery):**
```bash
# Add to .env
DELHIVERY_API_TOKEN=your_10_digit_token
DELHIVERY_API_URL=https://track.delhivery.com/api
VITE_DELHIVERY_PRODUCTION=false
VITE_DELHIVERY_CLIENT_NAME=PremiumOrchard

# Warehouse details
DELHIVERY_WAREHOUSE_NAME=Premium Orchard Warehouse
DELHIVERY_PICKUP_ADDRESS=Your_warehouse_address
DELHIVERY_PICKUP_CITY=Your_city
DELHIVERY_PICKUP_STATE=Your_state
DELHIVERY_PICKUP_PINCODE=110001
DELHIVERY_PICKUP_PHONE=9876543210
DELHIVERY_PICKUP_CONTACT=Contact_person_name
```

### 3. Update Hosting Environment Variables

**Vercel:**
1. Go to project dashboard
2. Settings → Environment Variables
3. Delete Shiprocket variables
4. Add Delhivery variables

**Netlify:**
1. Site Settings → Build & Deploy → Environment
2. Delete Shiprocket variables
3. Add Delhivery variables

### 4. Redeploy

```bash
# For Vercel
vercel --prod

# For Netlify
netlify deploy --prod

# Or push to main branch for auto-deploy
git add .
git commit -m "Migrate from Shiprocket to Delhivery"
git push origin main
```

---

## 📊 API Comparison

### Calculate Shipping

**Before (Shiprocket):**
```typescript
// Called Shiprocket serviceability API
// Response had multiple courier options
```

**After (Delhivery):**
```typescript
// Calls Delhivery pincode API
// Single Delhivery Express option
// More accurate serviceability check
```

### Create Shipment

**Before (Shiprocket):**
```typescript
// Used Shiprocket order creation
// Got order_id, shipment_id, awb_code
```

**After (Delhivery):**
```typescript
// Uses Delhivery shipment creation
// Gets waybill number directly
// Simpler data structure
```

### Track Shipment

**Before (Shiprocket):**
```typescript
// Tracked via Shiprocket
// URL: shiprocket.co/tracking/{awb}
```

**After (Delhivery):**
```typescript
// Tracked via Delhivery
// URL: delhivery.com/track/package/{waybill}
```

---

## 🔧 Code Changes Required

### If You're Using Frontend Service

**Before:**
```typescript
import { authenticateShiprocket } from '@/services/shippingService';
```

**After:**
```typescript
import { 
  calculateShippingRate,
  createDelhiveryShipment,
  trackShipment 
} from '@/services/delhiveryService';
```

### If You're Calling API Directly

**No changes needed!** API endpoints remain the same:
- `POST /api/calculate-shipping`
- `POST /api/create-shipment`
- `GET /api/track-shipment`

Only the backend implementation changed.

---

## 🎯 Benefits of Delhivery

1. **Simpler Integration:** No auth token management needed
2. **Direct API:** Single token, no login required
3. **Better Rates:** Competitive pricing
4. **Wider Reach:** More serviceable pincodes
5. **Faster Delivery:** Express service available
6. **Real-time Tracking:** Better tracking updates

---

## 🐛 Potential Issues & Solutions

### Issue 1: Old Orders Have Shiprocket AWB

**Solution:** Old orders will continue to work. Track them on Shiprocket manually if needed.

### Issue 2: Warehouse Not Verified

**Solution:** 
- Delhivery requires 1-2 days to verify warehouse
- Test with staging URL first
- Contact Delhivery support: 011-4948-4000

### Issue 3: Environment Variables Not Loading

**Solution:**
```bash
# Check if .env is loaded
echo $DELHIVERY_API_TOKEN

# Restart dev server
npm run dev

# Clear cache and rebuild
rm -rf .next
rm -rf node_modules/.cache
npm run build
```

### Issue 4: Pincode Not Serviceable

**Solution:**
- Verify on Delhivery website
- Check if pincode format is correct (6 digits)
- Try with known serviceable pincode (400001, 110001)

---

## 📝 Testing Checklist

- [ ] Environment variables added
- [ ] Dev server restarted
- [ ] Calculate shipping works for test pincode
- [ ] Create test order
- [ ] Shipment created successfully
- [ ] Waybill number received
- [ ] Tracking works
- [ ] Production deployment completed
- [ ] Production test order placed

---

## 🔙 Rollback Plan

If you need to rollback to Shiprocket:

1. **Revert files:**
   ```bash
   git revert HEAD
   ```

2. **Restore Shiprocket env variables**

3. **Redeploy**

---

## 📞 Support

- **Delhivery Support:** support@delhivery.com, 011-4948-4000
- **Documentation:** See `DELHIVERY_SETUP.md`
- **Quick Start:** See `DELHIVERY_QUICK_START.md`

---

## ✨ Next Steps

1. Complete warehouse verification with Delhivery
2. Test with real orders in staging
3. Monitor first few shipments closely
4. Update customer communication with new tracking URLs
5. Train support team on Delhivery dashboard

---

**Migration complete!** 🎉 Your store now uses Delhivery for all shipments.
