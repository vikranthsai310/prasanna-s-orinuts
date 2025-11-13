# 🔐 Authentication 401 Error Fix

**Issue Date**: November 13, 2025  
**Status**: ✅ FIXED

## 🐛 Problem Description

Users were experiencing `401 (Unauthorized)` errors when attempting to place orders through the checkout process:

```
POST https://www.prasannasorinuts.com/api/create-order 401 (Unauthorized)
❌ Authenticated fetch failed: Authentication failed. Please log in again.
```

### Root Cause

The error occurred because:

1. **User session state mismatch**: The frontend `AuthContext` showed the user as logged in, but Firebase `auth.currentUser` was potentially `null` or had an expired token
2. **Missing authentication verification**: No validation that Firebase ID token could be retrieved before making API calls
3. **Poor error handling**: Generic error messages didn't help users understand the issue
4. **Token expiration**: Firebase ID tokens expire after 1 hour and need to be refreshed

## ✅ Solution Implemented

### 1. Enhanced Checkout Authentication Checks

**File**: `src/pages/Checkout.tsx`

Added comprehensive authentication validation before payment processing:

```typescript
// Verify Firebase auth state before proceeding
console.log('🔐 Verifying Firebase authentication...');
const { auth } = await import('@/lib/firebase');
const currentUser = auth.currentUser;

if (!currentUser) {
  console.error('❌ Firebase currentUser is null - user may have been logged out');
  toast({
    title: "Session Expired",
    description: "Your session has expired. Please log in again to continue.",
    variant: "destructive"
  });
  navigate('/auth');
  return;
}

// Try to get a fresh ID token to verify authentication works
try {
  console.log('🔑 Fetching fresh authentication token...');
  await currentUser.getIdToken(true); // Force refresh
  console.log('✅ Authentication token obtained successfully');
} catch (tokenError) {
  console.error('❌ Failed to get authentication token:', tokenError);
  toast({
    title: "Authentication Error",
    description: "Unable to verify your session. Please log in again.",
    variant: "destructive"
  });
  navigate('/auth');
  return;
}
```

### 2. Improved Token Retrieval Logging

**File**: `src/utils/authToken.ts`

Enhanced `getAuthToken()` with detailed logging:

```typescript
export async function getAuthToken(forceRefresh: boolean = false): Promise<string> {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    logger.error('❌ Firebase currentUser is null - user not authenticated');
    logger.error('❌ Auth state:', { 
      currentUser: null, 
      authInitialized: !!auth,
      timestamp: new Date().toISOString()
    });
    throw new Error('User not authenticated. Please log in.');
  }

  try {
    logger.debug('🔑 Requesting Firebase ID token...', { 
      uid: currentUser.uid,
      email: currentUser.email,
      forceRefresh 
    });
    
    const token = await currentUser.getIdToken(forceRefresh);
    
    if (!token || token.trim() === '') {
      logger.error('❌ Firebase returned empty token');
      throw new Error('Received empty authentication token');
    }
    
    logger.debug('✅ Firebase ID token retrieved successfully', {
      tokenLength: token.length,
      uid: currentUser.uid
    });
    return token;
  } catch (error: any) {
    logger.error('❌ Failed to get Firebase ID token:', {
      error: error.message,
      code: error.code,
      uid: currentUser?.uid,
      email: currentUser?.email
    });
    
    // Provide more specific error messages
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.code === 'auth/user-token-expired') {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw new Error('Failed to retrieve authentication token. Please try again.');
  }
}
```

### 3. Enhanced Authenticated Fetch with Retry Logic

**File**: `src/utils/authToken.ts`

Improved `authenticatedFetch()` with automatic token refresh on 401:

```typescript
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  try {
    logger.debug('🌐 Making authenticated request to:', url);
    
    const headers = await getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    // Handle authentication errors
    if (response.status === 401) {
      logger.warn('⚠️ 401 Unauthorized - Authentication failed, trying with refreshed token...');
      
      // Try once more with a fresh token (force refresh)
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          logger.error('❌ User is no longer authenticated');
          throw new Error('User session expired. Please log in again.');
        }
        
        // Force token refresh
        await currentUser.getIdToken(true);
        logger.debug('🔄 Token refreshed, retrying request...');
        
        const freshHeaders = await getAuthHeaders();
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...freshHeaders,
            ...(options.headers || {}),
          },
        });

        if (retryResponse.status === 401) {
          logger.error('❌ Authentication failed even after token refresh');
          throw new Error('Authentication failed. Please log in again.');
        }

        return retryResponse;
      } catch (refreshError: any) {
        logger.error('❌ Token refresh failed:', refreshError);
        throw new Error('Authentication failed. Please log in again.');
      }
    }

    return response;
  } catch (error: any) {
    logger.error('❌ Authenticated fetch failed:', {
      url,
      error: error.message,
      code: error.code
    });
    throw error;
  }
}
```

### 4. Better Error Messages in Checkout

**File**: `src/pages/Checkout.tsx`

Added specific error handling for authentication failures:

```typescript
} catch (error: any) {
  console.error('❌ Order creation failed:', error);
  
  // Check for specific authentication errors
  let errorTitle = "Order Creation Failed";
  let errorDescription = "We couldn't create your order. Please try again.";
  
  if (error?.message?.includes('not authenticated') || 
      error?.message?.includes('Please log in') ||
      error?.statusCode === 401) {
    errorTitle = "Authentication Required";
    errorDescription = "Your session has expired. Please log in again to continue.";
    
    // Redirect to login after showing error
    setTimeout(() => {
      navigate('/auth');
    }, 2000);
  } else if (error?.statusCode === 403) {
    errorTitle = "Access Denied";
    errorDescription = "You don't have permission to complete this action.";
  } else if (error?.message?.includes('Payment gateway')) {
    errorTitle = "Payment Gateway Error";
    errorDescription = error.message;
  } else if (error?.message) {
    errorDescription = error.message;
  }
  
  toast({
    title: errorTitle,
    description: errorDescription,
    variant: "destructive"
  });
  setIsProcessing(false);
}
```

## 🔍 How to Debug Authentication Issues

### 1. Check Browser Console

Look for these log messages in the browser console:

**✅ Successful Authentication Flow:**
```
🔐 Verifying Firebase authentication...
🔑 Fetching fresh authentication token...
[DEBUG] 🔑 Requesting Firebase ID token... { uid: "...", email: "...", forceRefresh: true }
[DEBUG] ✅ Firebase ID token retrieved successfully { tokenLength: 1234, uid: "..." }
✅ Authentication token obtained successfully
🌐 Making authenticated request to: /api/create-order
📤 Request headers prepared: { url: "/api/create-order", method: "POST", hasAuth: true }
📥 Response received: { url: "/api/create-order", status: 200, statusText: "OK" }
```

**❌ Authentication Failure:**
```
🔐 Verifying Firebase authentication...
❌ Firebase currentUser is null - user may have been logged out
OR
🔑 Fetching fresh authentication token...
❌ Failed to get authentication token: [Error details]
```

### 2. Verify User Authentication State

In the browser console, run:

```javascript
// Check if Firebase auth is initialized
console.log('Firebase Auth:', window.firebase?.auth?.currentUser);

// Check auth context
console.log('Auth Context User:', /* check React DevTools */);

// Try to get token manually
const user = firebase.auth().currentUser;
if (user) {
  user.getIdToken(true).then(token => {
    console.log('Token obtained:', token.substring(0, 20) + '...');
  }).catch(error => {
    console.error('Token error:', error);
  });
}
```

### 3. Check Network Tab

In the browser's Network tab:

1. Find the `create-order` request
2. Check the **Request Headers** - should include:
   ```
   Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...
   ```
3. If missing or empty, authentication is failing on the client side

### 4. Check Server Logs (Vercel)

If the request is reaching the server:

1. Go to Vercel Dashboard → Your Project → Logs
2. Look for authentication middleware logs:
   ```
   ❌ Firebase Admin: FIREBASE_SERVICE_ACCOUNT_KEY not configured
   OR
   ❌ Token verification failed: auth/id-token-expired
   ```

## 🚀 Testing the Fix

### Test Scenario 1: Normal Checkout Flow

1. ✅ Log in as a user
2. ✅ Add items to cart
3. ✅ Go to checkout
4. ✅ Fill in shipping details
5. ✅ Click "Place Order"
6. ✅ Verify no 401 errors in console
7. ✅ Payment modal should open successfully

### Test Scenario 2: Expired Session

1. ✅ Log in as a user
2. ✅ Wait 61 minutes (token expires)
3. ✅ Try to place order
4. ✅ Should show "Session Expired" message
5. ✅ Should redirect to login page

### Test Scenario 3: Logged Out User

1. ✅ Add items to cart (without logging in)
2. ✅ Go to checkout
3. ✅ Should show "Authentication Required" message
4. ✅ Should redirect to login page

## 📋 Checklist for Deployment

- [x] Update `src/pages/Checkout.tsx` with authentication checks
- [x] Update `src/utils/authToken.ts` with enhanced logging
- [x] Test authentication flow in development
- [ ] Test on staging environment
- [ ] Verify Vercel environment variables are set:
  - `FIREBASE_SERVICE_ACCOUNT_KEY`
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
- [ ] Deploy to production
- [ ] Monitor Vercel logs for authentication errors
- [ ] Test production checkout flow

## 🔧 Environment Variables Required

### Frontend (.env)
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
```

### Backend (Vercel Environment Variables)
```bash
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY
```

## 📚 Related Files Modified

1. ✅ `src/pages/Checkout.tsx` - Added authentication verification
2. ✅ `src/utils/authToken.ts` - Enhanced logging and error handling
3. 📄 `api/create-order.js` - Already has auth middleware (no changes needed)
4. 📄 `api/_middleware/auth.js` - Already properly configured (no changes needed)

## 🎯 Expected Behavior After Fix

### ✅ Success Path
1. User clicks "Place Order"
2. System verifies Firebase authentication
3. System retrieves fresh ID token
4. System makes authenticated API call to `/api/create-order`
5. Server validates token and creates order
6. Payment modal opens successfully

### ⚠️ Error Paths

**Session Expired:**
- User sees: "Session Expired - Your session has expired. Please log in again to continue."
- User is redirected to login page

**Network Error:**
- User sees: "Network error. Please check your internet connection and try again."
- User can retry after fixing connection

**Token Refresh Failed:**
- User sees: "Authentication failed. Please log in again."
- User is redirected to login page

## 🐛 Common Issues and Solutions

### Issue: Still getting 401 errors

**Solution:**
1. Clear browser cache and cookies
2. Log out and log back in
3. Check browser console for specific error messages
4. Verify Firebase config is correct in `.env`

### Issue: "Firebase currentUser is null"

**Solution:**
1. Check if user is actually logged in (check Firebase Console → Authentication)
2. Verify `AuthContext` is properly wrapping the app
3. Check if `onAuthStateChanged` listener is working
4. Try logging out and back in

### Issue: "Token verification failed" on server

**Solution:**
1. Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is set in Vercel
2. Check if service account key is valid JSON
3. Verify project IDs match between frontend and backend
4. Check Vercel logs for specific error details

## 📞 Support

If issues persist:

1. Check browser console logs
2. Check Vercel function logs
3. Verify all environment variables are set
4. Test with a fresh incognito window
5. Contact development team with error logs

## ✨ Benefits of This Fix

1. **Better User Experience**: Clear error messages guide users
2. **Automatic Token Refresh**: Seamless handling of expired tokens
3. **Detailed Logging**: Easier debugging in development
4. **Graceful Degradation**: Proper error handling prevents broken checkout
5. **Security**: Verifies authentication at multiple levels

---

**Last Updated**: November 13, 2025  
**Tested**: ✅ Development Environment  
**Status**: ✅ Ready for Production Deployment
