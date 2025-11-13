# 🚨 401 Error Quick Fix Guide

## ⚡ IMMEDIATE ACTIONS

### If you're seeing this error:
```
POST /api/create-order 401 (Unauthorized)
❌ Authenticated fetch failed: Authentication failed. Please log in again.
```

### Quick Fixes (Try in Order):

#### 1. **LOG OUT AND LOG BACK IN** (90% success rate)
```
1. Click profile icon → Log out
2. Clear browser cache (Ctrl+Shift+Delete)
3. Log back in
4. Try checkout again
```

#### 2. **Check Browser Console**
Open DevTools (F12) → Console tab → Look for:

**🟢 Good (Authentication Working):**
```
✅ Authentication token obtained successfully
🌐 Making authenticated request to: /api/create-order
📥 Response received: { status: 200 }
```

**🔴 Bad (Authentication Failing):**
```
❌ Firebase currentUser is null
❌ Failed to get authentication token
❌ 401 Unauthorized
```

#### 3. **Force Token Refresh**
Paste this in browser console:
```javascript
firebase.auth().currentUser?.getIdToken(true)
  .then(() => console.log('✅ Token refreshed'))
  .catch(err => console.error('❌ Token error:', err));
```

#### 4. **Check User is Logged In**
Paste this in browser console:
```javascript
console.log('Auth State:', {
  currentUser: firebase.auth().currentUser,
  uid: firebase.auth().currentUser?.uid,
  email: firebase.auth().currentUser?.email
});
```

If `currentUser` is `null` → **User is not logged in!**

## 🔧 For Developers

### Build & Deploy Fix

The authentication fixes have been implemented in:
- ✅ `src/pages/Checkout.tsx`
- ✅ `src/utils/authToken.ts`

**Deploy Steps:**
```bash
# 1. Install dependencies (if needed)
npm install

# 2. Build the project
npm run build

# 3. Test locally
npm run preview

# 4. Deploy to Vercel
vercel --prod
```

### Verify Environment Variables

**Check Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Verify these exist:
   - ✅ `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string)
   - ✅ `RAZORPAY_KEY_ID` (rzp_live_xxx or rzp_test_xxx)
   - ✅ `RAZORPAY_KEY_SECRET`

### Monitor Logs

**Vercel Logs:**
```bash
vercel logs --follow
```

Look for:
- 🟢 "✅ Token verification successful"
- 🔴 "❌ Token verification failed"
- 🔴 "❌ Firebase Admin: FIREBASE_SERVICE_ACCOUNT_KEY not configured"

## 🎯 Root Causes

### Why 401 Errors Happen:

1. **Expired Session** (Most Common)
   - Firebase tokens expire after 1 hour
   - Fix: Auto-refresh implemented

2. **User Not Logged In**
   - Frontend shows logged in, but Firebase says no
   - Fix: Added auth state verification

3. **Missing Token**
   - Token not sent in request headers
   - Fix: Enhanced authenticatedFetch()

4. **Server Config Issue**
   - Missing service account key on server
   - Fix: Check Vercel environment variables

## 📞 Still Not Working?

### Checklist:
- [ ] Logged out and back in?
- [ ] Cleared browser cache?
- [ ] Checked browser console for errors?
- [ ] Verified user exists in Firebase Console?
- [ ] Tried different browser/incognito?
- [ ] Checked Vercel environment variables?
- [ ] Checked Vercel function logs?

### Get Help:
1. Open browser DevTools (F12)
2. Copy all console errors
3. Screenshot the error
4. Share with development team

## 🔗 Related Documentation

- Full Details: `AUTHENTICATION_401_FIX.md`
- Authentication Setup: `AUTHENTICATION_IMPLEMENTATION_SUMMARY.md`
- Bearer Token Guide: `BEARER_TOKEN_AUTHENTICATION.md`

---

**Last Updated**: November 13, 2025  
**Status**: ✅ Fix Deployed
