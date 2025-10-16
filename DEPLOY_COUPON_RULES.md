# 🔥 URGENT: Deploy Firestore Rules to Fix Coupon Permissions

## ❌ Current Error:
```
FirebaseError: Missing or insufficient permissions.
```

## ✅ Fix Applied:
I've updated `firestore.rules` with coupon permissions.

## 🚀 **YOU NEED TO DEPLOY NOW!**

### **Quick Deploy (Choose One):**

#### **Option 1: Command Line (30 seconds)**
```powershell
firebase deploy --only firestore:rules
```

#### **Option 2: Firebase Console (2 minutes)**
1. Go to: https://console.firebase.google.com/project/orinut-494cc/firestore/rules
2. Copy all contents from your local `firestore.rules` file
3. Paste into the editor
4. Click **"Publish"**
5. Done! ✅

---

## 📋 What Was Added:

### **Coupons Collection:**
- ✅ Read: Everyone (for validation)
- ✅ Create/Update/Delete: Admins only

### **Coupon Usage Collection:**
- ✅ Read: User's own + Admins see all
- ✅ Create: Authenticated users
- ✅ Update/Delete: Admins only

---

## 🧪 After Deployment:

1. **Refresh your website** (Ctrl + Shift + R)
2. **Test admin coupon creation**
3. **Test customer coupon application**
4. **Errors should be gone!** ✅

---

## 🆘 If Firebase Command Doesn't Work:

### **Install Firebase CLI:**
```powershell
npm install -g firebase-tools
```

### **Login:**
```powershell
firebase login
```

### **Set Project:**
```powershell
firebase use orinut-494cc
```

### **Deploy:**
```powershell
firebase deploy --only firestore:rules
```

---

## ✅ Success = No More Permission Errors!

Once deployed, your coupon system will work perfectly! 🎉

**Deploy now and test!** 🚀
