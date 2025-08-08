# 🔥 Firebase Data Migration Guide

This guide will help you securely migrate all your product data from your old Firebase project to a new one.

## 📋 Prerequisites

1. **Node.js** installed on your system
2. **Access to both Firebase projects** (old and new)
3. **Service account keys** for both projects
4. **Firebase Admin SDK** installed

## 🔐 Security Setup

### Step 1: Install Dependencies
```bash
cd src/scripts
npm install firebase-admin
```

### Step 2: Download Service Account Keys

**For your OLD Firebase project:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your old project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Save the file as `old-firebase-key.json` in `src/scripts/`

**For your NEW Firebase project:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your new project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Save the file as `new-firebase-key.json` in `src/scripts/`

### Step 3: Update Configuration

Edit `firebase-migration.js` and update these URLs:
```javascript
// Line 10: Update with your old Firebase project URL
databaseURL: "https://your-old-project-id.firebaseio.com"

// Line 16: Update with your new Firebase project URL  
databaseURL: "https://your-new-project-id.firebaseio.com"
```

## 🚀 Migration Options

### Option 1: Full Migration (Recommended)
Migrates all data: products, users, and orders
```bash
node firebase-migration.js migrate
```

### Option 2: Products Only
If you only want to migrate product data:
```bash
# Export products from old Firebase
node firebase-migration.js export-products

# Import products to new Firebase
node firebase-migration.js import-products
```

### Option 3: Step-by-Step Migration
For more control over the process:
```bash
# Step 1: Export all data
node firebase-migration.js export

# Step 2: Review the exported data in firebase-backup.json

# Step 3: Import to new Firebase
node firebase-migration.js import

# Step 4: Verify migration
node firebase-migration.js verify
```

## 📊 What Gets Migrated

### Products Collection
- Product ID
- Name, description, category
- Pricing for different weights
- Images and stock information
- Nutritional information

### Users Collection (Optional)
- User profiles and preferences
- Admin roles and permissions
- Account creation dates

### Orders Collection (Optional)
- Order history and details
- Payment information
- Shipping addresses

## ✅ Verification Steps

After migration, verify your data:

1. **Check Firebase Console:**
   - Go to your new Firebase project
   - Navigate to Firestore Database
   - Verify collections exist with correct data

2. **Test Your App:**
   - Update your app's Firebase configuration
   - Test product loading
   - Test user authentication
   - Test order placement

3. **Run Verification Script:**
   ```bash
   node firebase-migration.js verify
   ```

## 🔄 Update Your App Configuration

After successful migration, update your app to use the new Firebase project:

### Step 1: Update Firebase Config
Edit `src/lib/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: "your-new-api-key",
  authDomain: "your-new-project.firebaseapp.com",
  projectId: "your-new-project-id",
  storageBucket: "your-new-project.firebasestorage.app",
  messagingSenderId: "your-new-sender-id",
  appId: "your-new-app-id"
};
```

### Step 2: Update Environment Variables
If using environment variables:
```bash
VITE_FIREBASE_API_KEY=your-new-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-new-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-new-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-new-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-new-sender-id
VITE_FIREBASE_APP_ID=your-new-app-id
```

### Step 3: Deploy Firestore Rules
Copy your Firestore rules to the new project:
```bash
firebase deploy --only firestore:rules --project your-new-project-id
```

## 🛡️ Security Best Practices

1. **Never commit service account keys** to version control
2. **Delete service account keys** after migration
3. **Use environment variables** for production
4. **Test in development** before production migration
5. **Backup your data** before starting migration

## 🚨 Troubleshooting

### Common Issues:

**"Permission denied" errors:**
- Check that service account keys have proper permissions
- Ensure Firestore rules allow admin access

**"Network timeout" errors:**
- Large datasets may take time to migrate
- The script handles this automatically

**"Document already exists" errors:**
- The script overwrites existing documents with same IDs
- This is expected behavior

**Missing data after migration:**
- Run the verification script
- Check Firebase Console manually
- Review migration logs for errors

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify your service account permissions
3. Ensure both Firebase projects are properly configured
4. Review the migration logs in detail

## 🔒 Cleanup After Migration

1. **Delete service account key files:**
   ```bash
   rm old-firebase-key.json
   rm new-firebase-key.json
   ```

2. **Revoke old service accounts** (optional):
   - Go to old Firebase project settings
   - Remove unused service accounts

3. **Update security rules** in new project
4. **Test all app functionality** with new Firebase project

---

## 🎉 Success!

Once migration is complete:
- Your new Firebase project contains all your data
- Your app is configured to use the new project
- All functionality should work as before
- You have a backup of your original data

Remember to update any external integrations or services that reference your Firebase project! 