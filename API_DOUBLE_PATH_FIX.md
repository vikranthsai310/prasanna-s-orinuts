# 🔧 API Endpoint Double Path Fix

**Date:** October 1, 2025  
**Issue:** 405 Method Not Allowed - Double `/api/api/` path

---

## ❌ Problem

**Error in Console:**
```
POST https://prasanna-premium-orchard.vercel.app/api/api/create-order 405 (Method Not Allowed)
                                                      ^^^^^^^^
                                                      DUPLICATE PATH!
```

**What was happening:**
- User tries to place order
- Frontend creates order in Firestore ✅
- Frontend calls API to create Razorpay order ❌
- API URL has duplicate `/api/api/` causing 405 error
- Payment fails

---

## 🔍 Root Cause

### The Problem Chain:

1. **apiService.ts** sets base URL:
   ```typescript
   constructor(baseUrl: string = '/api') {
     this.baseUrl = baseUrl;  // baseUrl = '/api'
   }
   ```

2. **apiService.ts** constructs full URL:
   ```typescript
   const url = `${this.baseUrl}${endpoint}`;
   // Result: '/api' + '/api/create-order' = '/api/api/create-order' ❌
   ```

3. **constants/api.ts** had endpoints with `/api` prefix:
   ```typescript
   // WRONG ❌
   CREATE_ORDER: `${API_BASE_URL}/create-order`,  // = '/api/create-order'
   ```

4. **Final URL:**
   ```
   baseUrl (/api) + endpoint (/api/create-order) = /api/api/create-order ❌
   ```

---

## ✅ Solution

### Fixed `src/constants/api.ts`:

**Before (WRONG):**
```typescript
export const API_ENDPOINTS = {
  PAYMENT: {
    CREATE_ORDER: `${API_BASE_URL}/create-order`,     // ❌ Already includes /api
    VERIFY_PAYMENT: `${API_BASE_URL}/verify-payment`, // ❌
  },
  SHIPPING: {
    CALCULATE: `${API_BASE_URL}/calculate-shipping`,  // ❌
    // ...
  },
};
```

**After (CORRECT):**
```typescript
export const API_ENDPOINTS = {
  PAYMENT: {
    CREATE_ORDER: '/create-order',     // ✅ Just the endpoint path
    VERIFY_PAYMENT: '/verify-payment', // ✅
  },
  SHIPPING: {
    CALCULATE: '/calculate-shipping',  // ✅
    // ...
  },
};
```

### Why This Works:

Now the URL construction is correct:
```typescript
// apiService.ts
const url = `${this.baseUrl}${endpoint}`;
// Result: '/api' + '/create-order' = '/api/create-order' ✅
```

---

## 📊 Impact

### Before Fix:
```
GET /api/api/create-order    → 405 Method Not Allowed ❌
POST /api/api/verify-payment → 405 Method Not Allowed ❌
POST /api/api/calculate-shipping → 405 Method Not Allowed ❌
```

### After Fix:
```
POST /api/create-order        → 200 OK ✅
POST /api/verify-payment      → 200 OK ✅
POST /api/calculate-shipping  → 200 OK ✅
```

---

## 🚀 Deployment Steps

### 1. Commit the Fix
```bash
git add src/constants/api.ts DEPLOYMENT_CHECKLIST.md
git commit -m "fix: Remove duplicate /api prefix from API endpoints"
git push origin main
```

### 2. Verify on Vercel
- Vercel will auto-deploy (2-3 minutes)
- Check deployment logs for success

### 3. Test the Fix
Visit your deployment and test:
```
1. Add items to cart
2. Go to checkout
3. Fill shipping details
4. Click "Place Order"
5. Razorpay modal should open ✅
6. Complete payment
7. Order should be created ✅
```

---

## 🧪 Testing Verification

### Expected Behavior After Fix:

**Console Logs (Success):**
```
🔐 Creating authenticated Razorpay order on server...
💰 Amount: 1495
💳 Currency: INR
🧾 Receipt: H3IiTSBh3gChRURxl1FQ
✅ Razorpay order created successfully
🎉 Opening Razorpay payment modal...
```

**Network Tab:**
```
POST /api/create-order        Status: 200 ✅
Response: {
  success: true,
  id: "order_xxx",
  amount: 1495,
  currency: "INR"
}
```

---

## 🔗 Related Files

- ✅ `src/constants/api.ts` - Fixed endpoint paths
- 📝 `src/services/apiService.ts` - Uses corrected endpoints
- 📝 `src/services/razorpayService.ts` - Calls fixed endpoints
- 📝 `api/create-order.js` - Backend API (unchanged)
- 📝 `DEPLOYMENT_CHECKLIST.md` - Updated with this fix

---

## ✅ Verification Checklist

After deployment, verify:
- [ ] No `/api/api/` URLs in Network tab
- [ ] All API calls return 200 (not 405)
- [ ] Razorpay order creation succeeds
- [ ] Payment modal opens correctly
- [ ] Order is saved to Firestore
- [ ] No console errors
- [ ] Checkout flow completes end-to-end

---

## 📝 Lessons Learned

### Key Takeaway:
When using a centralized API service with a base URL, endpoint constants should **NOT** include the base path.

### Best Practice:
```typescript
// apiService handles base URL
class ApiService {
  constructor(baseUrl = '/api') { ... }
}

// Constants should be relative paths only
const ENDPOINTS = {
  CREATE_ORDER: '/create-order',  // ✅ Relative
  NOT: '/api/create-order',       // ❌ Absolute with base
};
```

---

**Status:** ✅ Fixed  
**Testing:** Ready for verification  
**Next:** Commit, push, and test on Vercel deployment

---

Made with ❤️ for Prasanna Premium Orchard
