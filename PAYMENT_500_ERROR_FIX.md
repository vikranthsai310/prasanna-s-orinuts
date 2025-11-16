# Payment 500 Error Fix - Complete Guide

## Problem Identified

The `/api/create-order` endpoint is returning a **500 Internal Server Error** when processing payments. This is caused by:

1. ❌ **Missing Firebase Service Account Key** on Vercel
2. ❌ **Incorrect Razorpay credentials** in `vercel.json`
3. ❌ **Poor error handling** causing authentication errors to appear as 500 errors

## What Was Fixed

### 1. ✅ Updated `api/create-order.js`
- Changed to lazy initialization of Razorpay (prevents startup crashes)
- Added Firebase Service Account check in environment logging
- Improved error messages to be more user-friendly
- Better error status codes (503 for config issues, not 500)

### 2. ✅ Updated `api/_middleware/auth.js`
- Added check for Firebase Admin initialization
- Returns 503 (Service Unavailable) if Firebase Admin can't initialize
- Better error logging with stack traces
- Prevents authentication errors from causing 500 errors

### 3. ✅ Updated `vercel.json`
- Corrected Razorpay credentials to match `.env` file:
  - `RAZORPAY_KEY_ID`: `rzp_live_Rg5FYFB1P2T4wv`
  - `RAZORPAY_KEY_SECRET`: `g7Np7KdqfPgMPEPd6gr7Ohnf`

## Critical: Configure Vercel Environment Variables

⚠️ **YOU MUST ADD THE FIREBASE SERVICE ACCOUNT KEY TO VERCEL**

### Step 1: Get Your Firebase Service Account Key

Your Firebase service account key is stored in `.env`:
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"orinut-494cc",...}
```

### Step 2: Add to Vercel Dashboard

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add a new environment variable:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value**: Copy the entire JSON object from your `.env` file (the complete service account key)
   - **Environments**: Check all (Production, Preview, Development)
3. Click **Save**

### Step 3: Redeploy

After adding the environment variable:
```bash
git add .
git commit -m "fix: Payment 500 error - update Razorpay creds and improve error handling"
git push
```

Or trigger a redeploy from Vercel Dashboard → **Deployments** → **Redeploy**

## Testing After Deployment

1. **Check Vercel Logs** during deployment:
   - Look for: `✅ [CREATE-ORDER] Razorpay instance created successfully`
   - Look for: `FIREBASE_SERVICE_ACCOUNT_KEY exists: true`

2. **Test payment flow**:
   - Add items to cart
   - Proceed to checkout
   - Fill in details
   - Click "Pay Now"
   - Should now successfully create Razorpay order

3. **Expected behavior**:
   - No more 500 errors
   - If Firebase is misconfigured: Get 503 with clear message
   - If user not logged in: Get 401 with clear message
   - If Razorpay fails: Get appropriate error message

## Error Messages You Should See (if issues persist)

### Before Fix:
```
❌ 500 Server Error - Backend issue
Error: Network request failed. Please check your connection
```

### After Fix:

**If Firebase Service Account missing:**
```
❌ 503 Service Unavailable
Authentication service is not configured. Please contact support.
```

**If user not authenticated:**
```
❌ 401 Unauthorized
Authentication required
```

**If Razorpay configuration issue:**
```
❌ 500 Server Error
Payment service is temporarily unavailable. Please try again later.
```

## Verification Checklist

- [ ] Firebase Service Account Key added to Vercel
- [ ] Razorpay credentials updated in `vercel.json`
- [ ] Code changes committed and pushed
- [ ] Vercel redeployment triggered
- [ ] Deployment logs checked for success messages
- [ ] Payment flow tested in production
- [ ] No more 500 errors appearing

## Additional Notes

### Environment Variables Summary

Your Vercel project should have these environment variables:

```env
# Razorpay (from vercel.json)
RAZORPAY_KEY_ID=rzp_live_Rg5FYFB1P2T4wv
RAZORPAY_KEY_SECRET=g7Np7KdqfPgMPEPd6gr7Ohnf

# Firebase (from vercel.json)
FIREBASE_API_KEY=AIzaSyCFGNw-QaL0NeajxgjMcuOxCXzeeHX1nwY
FIREBASE_AUTH_DOMAIN=orinut-494cc.firebaseapp.com
FIREBASE_PROJECT_ID=orinut-494cc
FIREBASE_STORAGE_BUCKET=orinut-494cc.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=369347130599
FIREBASE_APP_ID=1:369347130599:web:79cd0316f8af76c0a2de42
FIREBASE_MEASUREMENT_ID=G-MB52LLLTFD

# Firebase Service Account (ADD THIS MANUALLY IN VERCEL DASHBOARD)
FIREBASE_SERVICE_ACCOUNT_KEY=<your complete JSON service account key>
```

### Why This Happened

1. The authentication middleware (`requireAuth`) wraps the create-order handler
2. When Firebase Admin SDK couldn't initialize (missing service account key), it would throw an error
3. The error was caught by the middleware, but then trying to continue caused issues
4. The handler would fail before even reaching the Razorpay code
5. Resulted in generic 500 errors without clear indication of the root cause

### Prevention

- Always check Vercel deployment logs for environment variable issues
- Use 503 (Service Unavailable) for configuration/setup issues
- Use 500 only for unexpected runtime errors
- Log detailed errors server-side but return user-friendly messages

## Support

If issues persist after following this guide:

1. Check Vercel Function logs: **Vercel Dashboard** → **Deployments** → Click latest deployment → **Functions**
2. Look for the `create-order` function logs
3. Check for environment variable warnings
4. Verify Firebase Service Account JSON is valid (not truncated)

## Files Changed

- ✅ `api/create-order.js` - Better error handling and lazy initialization
- ✅ `api/_middleware/auth.js` - Check Firebase Admin before proceeding
- ✅ `vercel.json` - Updated Razorpay credentials
- 📝 `PAYMENT_500_ERROR_FIX.md` - This documentation

---

**Status**: ✅ Code fixes complete | ⏳ Waiting for Vercel environment variable configuration
