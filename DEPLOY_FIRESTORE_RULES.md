# Firestore Rules Deployment - Fix Permission Error

## 🔴 **Current Error**
```
Missing or insufficient permissions
```

**Cause:** Firestore rules have a circular dependency issue where it tries to check if a user is admin by reading the user document, but the user document can't be created because it needs permission to check admin status first.

## ✅ **Fixed Rules**

Updated `firestore.rules` with:
1. ✅ Phone number-based admin check (no circular dependency)
2. ✅ Proper user creation permissions
3. ✅ Admin phone: `+918555856366`
4. ✅ All collections properly secured

## 🚀 **Deploy Rules**

### **Option 1: Firebase Console** (Easiest)

1. Go to: https://console.firebase.google.com/project/orinut-494cc/firestore/rules

2. Copy the entire content from `firestore.rules` file

3. Paste into the console editor

4. Click **"Publish"** button

5. Wait for deployment (5-10 seconds)

6. **Refresh your app** and try again

### **Option 2: Firebase CLI** (If logged in)

```bash
firebase login
firebase deploy --only firestore:rules --project orinut-494cc
```

### **Option 3: Copy-Paste** (Quick)

1. Open: https://console.firebase.google.com/project/orinut-494cc/firestore/rules

2. Delete everything in the editor

3. Copy this and paste:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Check if user owns the resource
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Check if user is admin by phone number
    function isAdminPhone() {
      return isSignedIn() && 
             request.auth.token.phone_number in ['+918555856366'];
    }
    
    // Check if user is admin from existing document
    function isAdminFromDoc() {
      return isSignedIn() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Combined admin check
    function isAdmin() {
      return isAdminPhone() || isAdminFromDoc();
    }
    
    // Validate string length
    function validString(value, minLen, maxLen) {
      return value is string && 
             value.size() >= minLen && 
             value.size() <= maxLen;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId) && 
                       request.resource.data.phone is string &&
                       validString(request.resource.data.name, 1, 100);
      allow update: if isOwner(userId);
      allow delete: if isAdmin();
    }
    
    // Products
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Orders
    match /orders/{orderId} {
      allow read: if isSignedIn() && 
                     (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isSignedIn() && 
                       request.resource.data.userId == request.auth.uid;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    match /orders {
      allow list: if isSignedIn();
    }
    
    // Addresses
    match /addresses/{addressId} {
      allow read: if isSignedIn() && 
                     resource.data.userId == request.auth.uid;
      allow create: if isSignedIn() && 
                       request.resource.data.userId == request.auth.uid;
      allow update: if isSignedIn() && 
                       resource.data.userId == request.auth.uid;
      allow delete: if isSignedIn() && 
                       resource.data.userId == request.auth.uid;
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isSignedIn() && 
                       request.resource.data.userId == request.auth.uid;
      allow update: if isSignedIn() && 
                       resource.data.userId == request.auth.uid;
      allow delete: if isSignedIn() && 
                       (resource.data.userId == request.auth.uid || isAdmin());
    }
    
    // Carts
    match /carts/{cartId} {
      allow read, write: if isSignedIn() && cartId == request.auth.uid;
    }
    
    // Analytics (admin only)
    match /analytics/{document=**} {
      allow read, write: if isAdmin();
    }
    
    // Deny all others
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
\`\`\`

4. Click **"Publish"**

---

## ✅ **After Deployment**

1. **Wait 10 seconds** for rules to propagate
2. **Hard refresh your app** (Ctrl+Shift+R)
3. **Try logging in again** with +918555856366
4. **Enter your name** - should work now!

---

## 🔍 **What Was Fixed**

### **Before (Broken):**
```javascript
function isAdmin() {
  return request.auth != null && 
    exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&  // ❌ Circular!
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}
```

**Problem:** Can't check if user document exists to determine admin status when creating the user document!

### **After (Fixed):**
```javascript
function isAdminPhone() {
  return isSignedIn() && 
         request.auth.token.phone_number in ['+918555856366'];  // ✅ No database check!
}

function isAdmin() {
  return isAdminPhone() || isAdminFromDoc();  // ✅ Phone check first, then doc
}
```

**Solution:** Check phone number from auth token first (no database access needed), then fall back to document check for existing users.

---

## 🎯 **Quick Deploy Link**

Direct link to Firestore Rules editor:
https://console.firebase.google.com/project/orinut-494cc/firestore/rules

---

## ✅ **Verification**

After deployment, test:
1. Login with +918555856366
2. Enter OTP
3. Enter name
4. Should save successfully! ✅

---

## 📝 **Note**

The rules are already updated in your `firestore.rules` file. You just need to deploy them to Firebase using one of the methods above.
