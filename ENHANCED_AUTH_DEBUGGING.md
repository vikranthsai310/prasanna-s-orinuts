# 🔍 Enhanced Authentication Debugging Guide

**Date**: November 13, 2025  
**Issue**: 401 Unauthorized errors with enhanced debugging

## 🎯 What Was Done

### Changes Made:

1. **Enhanced Checkout Authentication** (`src/pages/Checkout.tsx`)
   - Added detailed logging of auth state
   - Compare context user vs Firebase currentUser
   - Force token refresh before order creation
   - Use verified `currentUser.uid` instead of `user.id`

2. **Improved Token Management** (`src/utils/authToken.ts`)
   - Capture and log server 401 response body
   - Enhanced token refresh retry logic
   - Detailed logging at each step
   - Better error messages with server response details

## 🔍 What to Check in Console

When you try to place an order, you should see this sequence:

### ✅ **SUCCESSFUL FLOW:**

```
🔐 Verifying Firebase authentication...
🔐 Context user: { id: "abc123", email: "user@example.com", name: "John" }
🔐 Firebase currentUser: { exists: true, uid: "abc123", email: "user@example.com", emailVerified: true }
🔑 Fetching fresh authentication token...
✅ Authentication token obtained successfully
🔑 Token preview: eyJhbGciOiJSUzI1NiIsImtpZCI6IjRhNDEyNWM4NTU...
🔑 Token length: 1234
💰 Creating Razorpay order...
💰 Order details: { userId: "abc123", userEmail: "user@example.com", itemsCount: 3, totalPrice: 1500 }
🔐 Final auth check before creating order...
✅ Final token check passed: { hasToken: true, tokenLength: 1234 }
[DEBUG] 🌐 Making authenticated request to: /api/create-order
[DEBUG] 📤 Request headers prepared: { url: "/api/create-order", method: "POST", hasAuth: true }
[DEBUG] 📥 Response received: { url: "/api/create-order", status: 200, statusText: "OK" }
✅ Razorpay order created: { id: "order_xxx" }
```

### ❌ **FAILED FLOW (401 Error):**

```
🔐 Verifying Firebase authentication...
🔐 Context user: { id: "abc123", email: "user@example.com", name: "John" }
🔐 Firebase currentUser: { exists: false, uid: undefined, email: undefined }
❌ Firebase currentUser is null - user may have been logged out
❌ Auth context user: { id: "abc123", ... }
❌ This indicates an auth state mismatch!
```

OR if user exists but token fails:

```
🔐 Firebase currentUser: { exists: true, uid: "abc123", email: "user@example.com" }
🔑 Fetching fresh authentication token...
❌ Failed to get authentication token: [Error: ...]
❌ Error code: auth/network-request-failed
❌ Error message: Network request failed
```

OR if token is obtained but server rejects it:

```
[DEBUG] 📥 Response received: { url: "/api/create-order", status: 401, statusText: "Unauthorized" }
⚠️ 401 Response body: { error: "Unauthorized", message: "Token verification failed: ...", code: "AUTH_REQUIRED" }
⚠️ 401 Unauthorized - Authentication failed, trying with refreshed token...
🔄 Current user exists: { uid: "abc123", email: "user@example.com", emailVerified: true }
🔑 Forcing token refresh...
✅ New token obtained: { length: 1234, preview: "eyJhbGciOiJSUzI1..." }
🔄 Retrying request with fresh token...
[DEBUG] 📥 Retry response received: { url: "/api/create-order", status: 401, statusText: "Unauthorized" }
❌ Retry 401 Response body: { error: "Unauthorized", message: "...", code: "AUTH_REQUIRED" }
❌ Authentication failed even after token refresh
❌ Server says: {"error":"Unauthorized","message":"..."}
```

## 🐛 Debugging Steps

### 1. **Check Auth State Mismatch**

If you see:
```
🔐 Context user: { id: "abc123", ... }
🔐 Firebase currentUser: { exists: false, ... }
```

**This means**:
- `AuthContext` thinks user is logged in
- But Firebase says no user is authenticated
- **Root cause**: Auth state desync

**Solution**:
1. Log out completely
2. Clear browser cache and cookies
3. Log back in
4. Try again

### 2. **Check Token Fetch Failures**

If you see:
```
❌ Failed to get authentication token
❌ Error code: auth/network-request-failed
```

**Solutions**:
- Check internet connection
- Check if Firebase is accessible (try opening Firebase Console)
- Check browser console for CORS errors
- Try different browser/incognito mode

### 3. **Check Server Rejection**

If you see:
```
⚠️ 401 Response body: { error: "...", message: "...", code: "..." }
```

**Check the message** - it will tell you exactly what the server rejected:

- **"Missing authorization header"**: Token not sent
- **"Invalid authorization format"**: Token malformed
- **"Empty authorization token"**: Token is empty string
- **"Token verification failed"**: Server can't verify token
- **"Token has expired"**: Token expired (should auto-refresh)
- **"Firebase Admin is not configured"**: Server config issue

### 4. **Check Server Environment Variables**

If server says "Firebase Admin is not configured":

1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Verify `FIREBASE_SERVICE_ACCOUNT_KEY` exists
4. Verify it's valid JSON
5. Redeploy after adding/updating

### 5. **Check Token Content**

Paste this in browser console to inspect the token:

```javascript
const user = firebase.auth().currentUser;
if (user) {
  user.getIdToken(true).then(token => {
    console.log('Token:', token);
    
    // Decode token (base64)
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    console.log('Token payload:', payload);
    console.log('Expires at:', new Date(payload.exp * 1000));
    console.log('Issued at:', new Date(payload.iat * 1000));
  });
}
```

## 🔧 Common Issues & Solutions

### Issue 1: User logs in but immediately gets 401

**Symptom**: User can log in, but checkout fails with 401

**Cause**: Auth state hasn't fully propagated

**Solution**:
```javascript
// Wait for auth to stabilize before checkout
import { waitForAuth } from '@/utils/authToken';

const isAuthenticated = await waitForAuth(5000);
if (!isAuthenticated) {
  // Show error
}
```

### Issue 2: Works in dev, fails in production

**Symptom**: Checkout works locally but fails on Vercel

**Cause**: Environment variables not set on Vercel

**Solution**:
1. Check Vercel env vars match local `.env`
2. Verify Firebase project IDs match
3. Check Vercel function logs for specific error

### Issue 3: Token refresh fails silently

**Symptom**: Logs show "Unknown error" during refresh

**Cause**: Network error or Firebase service down

**Solution**:
1. Check Firebase status: https://status.firebase.google.com/
2. Check browser network tab for failed requests
3. Try clearing Firebase cache

### Issue 4: "FIREBASE_SERVICE_ACCOUNT_KEY not configured"

**Symptom**: Server logs show this error

**Cause**: Missing or invalid service account key on server

**Solution**:
```bash
# 1. Get service account key from Firebase Console
# Firebase Console → Project Settings → Service Accounts → Generate New Private Key

# 2. Minify JSON (remove whitespace)
# Use online tool or: cat key.json | jq -c

# 3. Add to Vercel
# Vercel Dashboard → Project Settings → Environment Variables
# Name: FIREBASE_SERVICE_ACCOUNT_KEY
# Value: {"type":"service_account","project_id":"..."}

# 4. Redeploy
vercel --prod
```

## 📋 Pre-Deploy Checklist

Before deploying authentication fixes:

- [ ] Test login flow in development
- [ ] Test checkout with valid user
- [ ] Test with expired token (wait 61 minutes)
- [ ] Test with logged-out user
- [ ] Check all console logs are helpful
- [ ] Verify environment variables on Vercel
- [ ] Test in production after deploy
- [ ] Monitor Vercel logs for errors

## 🚀 Deploy

```bash
# Build
npm run build

# Test locally
npm run preview

# Deploy to Vercel
vercel --prod

# Monitor logs
vercel logs --follow
```

## 📞 Still Having Issues?

### Collect This Information:

1. **Browser Console Logs**
   - Copy all console output from clicking "Place Order"
   - Include all 🔐, 🔑, ✅, ❌ log messages

2. **Network Tab**
   - Find the `/api/create-order` request
   - Copy Request Headers (especially `Authorization`)
   - Copy Response (status code and body)

3. **Vercel Function Logs**
   - Go to Vercel Dashboard → Logs
   - Find the `create-order` function execution
   - Copy the error message

4. **User State**
   - Run this in console:
     ```javascript
     console.log({
       contextUser: /* check React DevTools AuthContext */,
       firebaseUser: firebase.auth().currentUser,
       canGetToken: !!firebase.auth().currentUser
     });
     ```

### Contact Support With:
- Browser console logs
- Network request/response
- Vercel function logs
- User state information
- Steps to reproduce

---

**Last Updated**: November 13, 2025  
**Build Status**: ✅ Built Successfully  
**Next Step**: Deploy and test with real user authentication
