# Admin Setup Scripts

This directory contains scripts to help you set up admin privileges for your Premium Orchard application.

## Available Scripts

### 1. Regular Firebase Client SDK Method (`setAdmin.js`)

This script uses the regular Firebase client SDK to set admin privileges. It reads Firebase configuration from your `.env` file.

**Requirements:**
- Firebase configuration in your `.env` file
- Node.js installed

**Usage:**
```bash
# Run using the npm script
npm run set-admin

# Or run directly
node -r dotenv/config src/scripts/setAdmin.js
```

### 2. Firebase Admin SDK Method (`firebase-admin.js`)

This script uses the Firebase Admin SDK, which provides more powerful administrative capabilities.

**Requirements:**
- Firebase Admin SDK installed (`npm install firebase-admin`)
- Service account key from Firebase Console

**Steps:**
1. Download your service account key:
   - Go to [Firebase Console](https://console.firebase.google.com/) > Your Project
   - Click Project Settings (gear icon) > Service accounts
   - Click "Generate new private key"
   - Save the JSON file as `serviceAccountKey.json` in the `src/scripts` directory

2. Run the script:
```bash
# Run using the npm script
npm run set-admin:sdk

# Or run directly
node src/scripts/firebase-admin.js
```

### 3. Manual Method

If you prefer to set admin privileges manually through the Firebase Console, follow the instructions in `firebase-console-instructions.md`.

## What These Scripts Do

All methods accomplish the same goal: setting `isAdmin: true` for the user with email `vikranthsai310@gmail.com` in your Firestore database.

Choose the method that works best for your workflow and security requirements.

## Security Notes

- Keep your service account key secure and never commit it to version control
- Add `serviceAccountKey.json` to your `.gitignore` file
- The Admin SDK has powerful permissions, so use it carefully 