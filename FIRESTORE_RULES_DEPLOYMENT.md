# Firestore Rules Deployment Guide

## Issue
The application is showing "Missing or insufficient permissions" errors when trying to access address data because the Firestore security rules don't include permissions for the `addresses` collection.

## Solution
The `firestore.rules` file has been updated to include proper permissions for user addresses.

## Updated Rules Added
```javascript
// Allow users to manage their own addresses
match /addresses/{addressId} {
  allow read, write: if request.auth != null && 
    request.auth.uid == resource.data.userId;
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.userId;
  allow read: if isAdmin();
}
```

## Deployment Options

### Option 1: Firebase CLI (Recommended)
If you have Firebase CLI installed and working:
```bash
firebase deploy --only firestore:rules
```

### Option 2: Firebase Console (Manual)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `orinut-494cc`
3. Go to **Firestore Database**
4. Click on **Rules** tab
5. Copy the contents of `firestore.rules` file from this project
6. Paste it into the rules editor
7. Click **Publish**

### Option 3: PowerShell Execution Policy Fix
If you're getting PowerShell execution policy errors:
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try Firebase CLI again
firebase deploy --only firestore:rules
```

## Verification
After deploying the rules, the address-related errors should disappear and users will be able to:
- View their saved addresses
- Add new addresses
- Edit existing addresses
- Set default addresses

## Current Workaround
The application has been updated with better error handling to gracefully handle permission errors until the rules are deployed.
