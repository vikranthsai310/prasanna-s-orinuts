# Payment 400 Error - Troubleshooting Guide

## Problem
Getting 400 (Bad Request) error when creating Razorpay order during checkout.

## Error Messages
```
Failed to load resource: the server responded with a status of 400 ()
❌ Error creating Razorpay order
❌ Order creation failed
```

## Root Causes & Solutions

### 1. **Missing Environment Variables in Vercel** (Most Likely)

The API endpoints need these environment variables to be set in your Vercel dashboard:

#### Required Variables:
- `RAZORPAY_KEY_ID` - Your Razorpay Key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay Key Secret  
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Your Firebase service account JSON (as a single-line string)

#### How to Fix:
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: `prasanna-premium-orchard`
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

```bash
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"orinut-494cc",...}
```

**Important:** 
- For `FIREBASE_SERVICE_ACCOUNT_KEY`, paste the ENTIRE content of your service account JSON file as a single line (remove all line breaks)
- Make sure there are no extra spaces or quotes
- Click "Save" after each variable

5. **Redeploy** your application after adding variables

### 2. **CORS Issue - Wrong Domain**

If you're accessing from `prasannasorinuts.com` but it's not in the allowed origins list.

#### Fix Applied:
✅ Updated `api/_middleware/cors.js` to include:
- `https://prasannasorinuts.com`
- `https://www.prasannasorinuts.com`

### 3. **Authentication Token Issue**

The API requires a valid Firebase authentication token.

#### Check:
1. Make sure you're logged in before trying to checkout
2. Check browser console for authentication errors
3. If you see "User not authenticated", you need to log in first

### 4. **Service Account JSON Format Issue**

The Firebase service account key must be valid JSON.

#### To Fix:
1. Open your service account file: `orinut-494cc-firebase-adminsdk-fbsvc-7b087e3184.json`
2. Copy the ENTIRE content
3. Use an online JSON minifier to convert it to a single line: https://codebeautify.org/jsonminifier
4. Paste the minified JSON into Vercel environment variable

## How to Test

### Test Environment Variables:
```bash
# In your api/create-order.js, the logs will show:
🔑 [CREATE-ORDER] Razorpay Key ID exists: true/false
🔑 [CREATE-ORDER] Razorpay Key Secret exists: true/false
```

If these show `false`, your environment variables aren't set correctly in Vercel.

### Test Authentication:
```bash
# In your api/_middleware/auth.js, the logs will show:
✅ [AUTH] User authenticated successfully
🔐 [AUTH] Authorization header exists: true
```

If authentication fails, you'll see:
```bash
❌ [AUTH] Missing authorization header
❌ [VERIFY-TOKEN] Token verification failed
```

### Test CORS:
```bash
# Browser console should NOT show:
❌ CORS policy: No 'Access-Control-Allow-Origin' header
```

## Quick Deployment Checklist

1. ✅ Set `RAZORPAY_KEY_ID` in Vercel
2. ✅ Set `RAZORPAY_KEY_SECRET` in Vercel
3. ✅ Set `FIREBASE_SERVICE_ACCOUNT_KEY` in Vercel (single-line JSON)
4. ✅ Updated CORS to include `prasannasorinuts.com`
5. ✅ Redeploy the application
6. ✅ Test checkout while logged in

## Verification Steps

1. **Open Browser DevTools** (F12)
2. Go to **Console** tab
3. Try to place an order
4. Look for these success messages:
```
🔄 Creating Razorpay order...
✅ Firebase order created: [ORDER_ID]
🌐 Creating Razorpay order on server...
✅ Razorpay order created
```

If you see any ❌ errors, check:
- Network tab for the actual API response
- Console tab for detailed error messages
- Vercel deployment logs for server-side errors

## Still Not Working?

Check Vercel deployment logs:
1. Go to Vercel dashboard
2. Click on your deployment
3. Go to **Logs** tab
4. Look for the error messages with 🔑, 🔐, or ❌ prefixes
5. Share the logs for more specific help

## Contact
If none of these solutions work, check:
- Vercel deployment logs for detailed error messages
- Razorpay dashboard to ensure test mode is enabled
- Firebase console to verify service account permissions
