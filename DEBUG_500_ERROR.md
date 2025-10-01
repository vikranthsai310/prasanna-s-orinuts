# 500 Internal Server Error - Debugging Guide

## 🔍 Current Status

**Fixed Issues:**
- ✅ Double `/api/api/` path - RESOLVED
- ✅ Cache issues - Use Ctrl+Shift+F5

**Current Issue:**
- ❌ 500 Internal Server Error from `/api/create-order`

**Error Details:**
```
POST https://prasanna-premium-orchard.vercel.app/api/create-order 500 (Internal Server Error)
❌ Error creating Razorpay order: {success: false, error: 'Network request failed...', statusCode: 500}
```

## 🎯 Root Cause Analysis

The 500 error means the **serverless function is crashing**. Most likely causes:

### 1. **Firebase Admin SDK Not Configured** (MOST LIKELY)
- Missing `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable in Vercel
- Invalid JSON format in the service account key
- Incorrect service account permissions

### 2. **Razorpay Credentials Missing**
- Missing `RAZORPAY_KEY_ID` or `RAZORPAY_KEY_SECRET`

### 3. **Authentication Token Issues**
- Token expired or invalid
- Token not being sent from frontend
- Firebase Admin can't verify the token

## 📋 Step-by-Step Debugging Process

### Step 1: Check Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. **Verify these variables exist** (for Production):

```
✅ FIREBASE_SERVICE_ACCOUNT_KEY
✅ RAZORPAY_KEY_ID
✅ RAZORPAY_KEY_SECRET
✅ VITE_FIREBASE_API_KEY
✅ VITE_FIREBASE_AUTH_DOMAIN
✅ VITE_FIREBASE_PROJECT_ID
✅ VITE_FIREBASE_STORAGE_BUCKET
✅ VITE_FIREBASE_MESSAGING_SENDER_ID
✅ VITE_FIREBASE_APP_ID
✅ VITE_RAZORPAY_KEY_ID
```

### Step 2: Check Vercel Function Logs

1. Go to **Vercel Dashboard** → Your Project
2. Click **Deployments** → Latest deployment
3. Click **Functions** tab
4. Click on `api/create-order`
5. Check the **Runtime Logs**

**Look for these specific logs:**

#### ✅ If Firebase Admin is working:
```
✅ [FIREBASE-ADMIN] Firebase Admin initialized successfully
✅ [VERIFY-TOKEN] Token verified successfully: <uid> (<email>)
✅ [AUTH] User authenticated successfully
```

#### ❌ If Firebase Admin is failing:
```
❌ [FIREBASE-ADMIN] FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set
❌ [FIREBASE-ADMIN] Failed to parse service account
❌ [FIREBASE-ADMIN] Firebase Admin initialization failed
```

#### ❌ If Razorpay is failing:
```
❌ [CREATE-ORDER] Error occurred
CRITICAL: Razorpay credentials not configured
```

#### ❌ If Auth Token is failing:
```
❌ [AUTH] Authentication error: Missing authorization header
❌ [VERIFY-TOKEN] Missing authorization header
❌ [VERIFY-TOKEN] Token verification failed
```

### Step 3: Fix Based on Logs

#### **Issue A: FIREBASE_SERVICE_ACCOUNT_KEY not set**

**Solution:**
1. Get your service account key from Firebase Console:
   - Go to: https://console.firebase.google.com
   - Select project: `orinut-494cc`
   - Click ⚙️ Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

2. Convert to single-line JSON:
```bash
# In PowerShell (in your project directory)
$json = Get-Content "orinut-494cc-firebase-adminsdk-fbsvc-7b087e3184.json" -Raw
$json = $json -replace "`r`n", "" -replace "`n", ""
Write-Output $json | clip
```

3. Add to Vercel:
   - Go to Vercel → Settings → Environment Variables
   - Variable name: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Value: Paste the single-line JSON
   - Environment: **Production**, Preview, Development (check all)
   - Click **Save**

4. **Redeploy**:
```bash
git commit --allow-empty -m "chore: Trigger redeploy after env var update"
git push origin main
```

#### **Issue B: Razorpay Credentials Missing**

**Solution:**
1. Get Razorpay credentials from: https://dashboard.razorpay.com/app/keys
2. Add to Vercel:
   - `RAZORPAY_KEY_ID`: Your live/test key ID
   - `RAZORPAY_KEY_SECRET`: Your live/test key secret
3. Redeploy

#### **Issue C: Auth Token Not Being Sent**

**Check Frontend Code:**

Open DevTools → Network tab → Find the `create-order` request → Headers:

**Should have:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6I...
```

**If missing**, check `src/utils/authToken.ts`:
```typescript
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = await getAuthToken(); // Should get token from Firebase
  // ... adds Authorization header
}
```

### Step 4: Test After Fix

1. Clear browser cache: `Ctrl + Shift + F5`
2. Open DevTools → Console
3. Try checkout again
4. Check console for logs:

**Success logs:**
```
📦 Items count: 3
📄 Creating order in database...
✅ Firebase order created: <id>
🌐 Creating Razorpay order on server...
🔐 Creating authenticated Razorpay order on server...
```

**Then check Network tab:**
```
POST /api/create-order
Status: 200 OK ✅
Response: { id: "order_...", amount: 149500, currency: "INR", status: "created" }
```

## 🔧 Quick Fixes

### Fix 1: Verify Firebase Service Account in Vercel

```bash
# In Vercel Dashboard CLI (or dashboard UI)
vercel env ls

# Should show:
# FIREBASE_SERVICE_ACCOUNT_KEY (Production, Preview, Development)
```

### Fix 2: Check Vercel Function Logs

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs <your-deployment-url> --follow
```

### Fix 3: Test Locally First

```bash
# Create .env file with all variables
cp .env.example .env

# Add your actual values to .env
# Then test locally:
npm run dev

# Try checkout - should work locally
```

### Fix 4: Emergency Bypass (Testing Only)

**Temporarily disable auth** to see if Razorpay is the issue:

```javascript
// In api/create-order.js - TEMPORARY TEST ONLY
async function handler(req, res) {
  try {
    // Bypass auth for testing
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;
    
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt,
      notes,
      payment_capture: 1
    });
    
    return res.status(200).json({ 
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Remove auth wrapper temporarily
export default handler; // Instead of: export default requireAuth(handler);
```

**IMPORTANT:** Revert this after testing!

## 📊 Expected Debug Output

After adding the enhanced debugging, Vercel logs should show:

```
🔐 [AUTH] requireAuth middleware invoked
🔐 [AUTH] Request method: POST
🔐 [AUTH] Authorization header exists: true
🌐 [AUTH] Configuring CORS...
🔍 [AUTH] Verifying authentication token...
🔍 [VERIFY-TOKEN] Starting token verification...
🔍 [VERIFY-TOKEN] Authorization header: Bearer eyJhbGci...
🔥 [VERIFY-TOKEN] Initializing Firebase Admin...
🔥 [FIREBASE-ADMIN] initializeFirebaseAdmin called
✅ [FIREBASE-ADMIN] Already initialized, returning cached instance
✅ [VERIFY-TOKEN] Firebase Admin ready
🔍 [VERIFY-TOKEN] Verifying ID token with Firebase...
✅ [VERIFY-TOKEN] Token verified successfully: abc123 (user@example.com)
✅ [AUTH] User authenticated successfully: {uid, email, isAdmin}
✅ [AUTH] Calling handler...
🚀 [CREATE-ORDER] Handler invoked
📝 [CREATE-ORDER] Method: POST
🔑 [CREATE-ORDER] User object exists: true
🔐 [CREATE-ORDER] User authenticated: {uid, email, hasUser}
📦 [CREATE-ORDER] Request body: {...}
💰 [CREATE-ORDER] Parsed values: {amount, currency, receipt, notes}
📝 [CREATE-ORDER] Enriched notes: {...}
🔑 [CREATE-ORDER] Razorpay Key ID exists: true
🔑 [CREATE-ORDER] Razorpay Key Secret exists: true
🌐 [CREATE-ORDER] Calling Razorpay API...
✅ [CREATE-ORDER] Razorpay order created successfully: order_abc123
```

## 🚨 Common Error Patterns

### Error: "FIREBASE_SERVICE_ACCOUNT_KEY not set"
**Fix:** Add environment variable in Vercel → Settings → Environment Variables

### Error: "Failed to parse service account"
**Fix:** Ensure JSON is properly formatted (no line breaks, valid JSON)

### Error: "Token verification failed"
**Fix:** User needs to re-login to get fresh token

### Error: "Razorpay credentials not configured"
**Fix:** Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to Vercel

### Error: "Missing authorization header"
**Fix:** Check frontend is calling `authenticatedFetch()` correctly

## 📝 Commit and Deploy Debug Version

```bash
# Stage files
git add api/create-order.js api/_middleware/auth.js CACHE_CLEARING_GUIDE.md

# Commit
git commit -m "debug: Add comprehensive logging to API and auth middleware"

# Push
git push origin main

# Wait 2-3 minutes for Vercel deployment

# Clear cache and test
# Ctrl + Shift + F5

# Check Vercel logs for debug output
```

## 🎯 Next Steps

1. **Deploy debug version** (push the changes I made)
2. **Check Vercel Function Logs** (will show detailed output)
3. **Identify the exact failure point** from logs
4. **Fix the specific issue** (likely Firebase Admin config)
5. **Redeploy** and test again

---

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Firebase Console**: https://console.firebase.google.com
- **Razorpay Dashboard**: https://dashboard.razorpay.com
- **Vercel Logs**: https://vercel.com/your-project/logs

Let me know what you see in the Vercel Function Logs after deploying! 🚀
