# Delhivery API Error Explanation & Solution

## 🔴 The Error You're Seeing

```
POST /api/create-shipment 500 (Internal Server Error)
Delhivery shipment creation failed: UNAUTHORIZED - {"detail": "Authentication credentials were not provided."}
```

---

## 🔍 Why This Is Happening

The error **"Authentication credentials were not provided"** from Delhivery means:

1. **Your backend API is NOT sending the Delhivery API token** when calling Delhivery
2. **OR** the token format is incorrect
3. **OR** the environment variable is not set on your production server (Vercel)

### The Flow:
```
Browser → Your Backend (/api/create-shipment) → Delhivery API
                ↑
         Missing Delhivery token here!
```

---

## ✅ Solution

### **CRITICAL: You're deployed on Vercel!**

Your `.env` file is **NOT deployed** to Vercel. You must set environment variables in the **Vercel Dashboard**.

### Steps to Fix:

#### 1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `prasanna-premium-orchard`
   - Go to: **Settings → Environment Variables**

#### 2. **Add These Environment Variables:**

```bash
# Delhivery Backend Configuration (REQUIRED for API to work)
DELHIVERY_API_TOKEN=6a837c59c18e2becb4207783345c95ace05962fa
DELHIVERY_API_URL=https://track.delhivery.com/api

# Warehouse Details
DELHIVERY_WAREHOUSE_NAME=Prasannas orinuts
DELHIVERY_PICKUP_ADDRESS=Shiv Nivas Opposite Road no-7 Pragathinagar moosapet hyderabad
DELHIVERY_PICKUP_CITY=hyderabad
DELHIVERY_PICKUP_STATE=Telangana
DELHIVERY_PICKUP_PINCODE=500018
DELHIVERY_PICKUP_PHONE=6301308477
DELHIVERY_PICKUP_CONTACT=9398649506

# Firebase Admin SDK (if not already set)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...your full JSON...}

# Razorpay Backend (if not already set)
RAZORPAY_KEY_SECRET=g7Np7KdqfPgMPEPd6gr7Ohnf
```

#### 3. **Important Notes:**
- Add each variable separately in Vercel
- Set the **Environment** to: `Production`, `Preview`, and `Development` (all three)
- **DO NOT** include quotes around the values in Vercel's UI
- After adding, click **Save**

#### 4. **Redeploy Your Application**
After adding environment variables:
- Go to **Deployments** tab in Vercel
- Click the **...** menu on the latest deployment
- Select **Redeploy**
- OR just push a new commit to trigger auto-deployment

---

## 🐛 Debug Logs Added

I've added comprehensive debug logging to help you troubleshoot:

### Frontend Logs (Browser Console):
- ✅ Auth token status and preview
- ✅ Request details being sent to backend
- ✅ Response status and error details

### Backend Logs (Vercel Function Logs):
- ✅ Environment variable check
- ✅ Delhivery token existence and length
- ✅ Request details sent to Delhivery
- ✅ Response from Delhivery API

### To View Backend Logs:
1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments**
4. Click on the latest deployment
5. Click **Functions** tab
6. Click on `create-shipment` function
7. View the logs

---

## 📋 Verification Checklist

After setting environment variables in Vercel:

- [ ] Added `DELHIVERY_API_TOKEN` to Vercel
- [ ] Added all `DELHIVERY_PICKUP_*` variables to Vercel
- [ ] Added `FIREBASE_SERVICE_ACCOUNT_KEY` to Vercel
- [ ] Set variables for all environments (Production, Preview, Development)
- [ ] Redeployed the application
- [ ] Waited 2-3 minutes for deployment to complete
- [ ] Cleared browser cache (Ctrl+Shift+R)
- [ ] Tried creating a shipment again
- [ ] Checked browser console for detailed logs
- [ ] Checked Vercel function logs for backend errors

---

## 🔍 How to Debug

### If Still Getting Errors:

1. **Check Browser Console** for detailed logs:
   - Look for: `🔍 Creating Delhivery shipment via backend API...`
   - Check auth token status
   - Check request payload

2. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Deployments → Functions → create-shipment
   - Look for: `Environment check` log
   - Verify `hasDelhiveryToken: true`
   - Verify `tokenLength: 40` (your token length)

3. **Common Issues**:
   
   **Issue**: Token still missing in Vercel logs
   - **Solution**: Make sure you saved and redeployed after adding env vars
   
   **Issue**: `hasDelhiveryToken: false` in logs
   - **Solution**: Variable name might be wrong. Use exactly: `DELHIVERY_API_TOKEN`
   
   **Issue**: Still UNAUTHORIZED from Delhivery
   - **Solution**: Your Delhivery API token might be invalid or expired
   - **Action**: Log into Delhivery dashboard and generate a new token

---

## 🎯 Testing After Fix

Once environment variables are set and redeployed:

1. Open your site in **Incognito/Private window** (to avoid cache)
2. Login as admin
3. Go to Delivery Management
4. Try to create a Delhivery shipment
5. Open browser console (F12)
6. Look for these logs:
   ```
   🔍 Creating Delhivery shipment via backend API...
   🔐 Auth token obtained successfully
   🌐 Calling backend API: /api/create-shipment
   📡 Response Status: 200 OK
   ✅ Shipment created successfully! Waybill: XXXXXX
   ```

---

## 🆘 Still Not Working?

If you're still getting errors after following all steps:

1. **Share the Vercel function logs** (screenshot of the logs showing environment check)
2. **Share browser console logs** (the debug logs we added)
3. **Verify your Delhivery account is active** and the token is valid

---

## 🔐 Security Note

**NEVER** commit your `.env` file to Git. Environment variables with sensitive data should only be:
- In your local `.env` file (for development)
- In Vercel Dashboard (for production)

The `.env` file is already in `.gitignore` so it won't be committed.

---

## 📝 Summary

**Root Cause**: Delhivery API token is not available in your Vercel production environment

**Solution**: Add environment variables in Vercel Dashboard and redeploy

**Next Steps**:
1. Add env vars to Vercel
2. Redeploy
3. Test
4. Check logs if it fails
