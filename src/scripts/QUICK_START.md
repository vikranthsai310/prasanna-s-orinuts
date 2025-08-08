# 🚀 Quick Start: Firebase Migration

**Need to migrate your product data to a new Firebase? Here's the fastest way:**

## ⚡ 5-Minute Setup

### 1. **Download Service Account Keys**
   - **Old Firebase**: [Firebase Console](https://console.firebase.google.com/) → Your Old Project → Settings → Service Accounts → Generate Key
   - **New Firebase**: [Firebase Console](https://console.firebase.google.com/) → Your New Project → Settings → Service Accounts → Generate Key
   - Save as `old-firebase-key.json` and `new-firebase-key.json` in this folder

### 2. **Run Automated Setup**
   ```bash
   cd src/scripts
   npm run setup
   ```

### 3. **Update Project URLs**
   Edit `firebase-migration.js` lines 10 & 16:
   ```javascript
   // Line 10: Update your old project ID
   databaseURL: "https://your-old-project-id.firebaseio.com"
   
   // Line 16: Update your new project ID  
   databaseURL: "https://your-new-project-id.firebaseio.com"
   ```

### 4. **Run Migration**
   ```bash
   npm run migrate
   ```

## 🎯 That's It!
Your data is now migrated to the new Firebase project.

---

## 📋 Alternative Options

**Products Only:**
```bash
npm run export-products  # Export from old Firebase
npm run import-products  # Import to new Firebase
```

**Step by Step:**
```bash
npm run export    # Export all data
npm run import    # Import all data
npm run verify    # Verify migration
```

**Need Help?**
- Check `MIGRATION_GUIDE.md` for detailed instructions
- Run `npm run help` for all available commands

---

## 🔐 Security Notes

- ✅ Keys are automatically excluded from git
- ✅ Delete keys after migration: `rm *-firebase-key.json`
- ✅ Test with small data first

## 🚨 Important

1. **Backup your data** before starting
2. **Test your app** after migration  
3. **Update your app's Firebase config** to use the new project
4. **Deploy Firestore rules** to the new project

---

**Questions? Check the detailed `MIGRATION_GUIDE.md` or contact support.** 