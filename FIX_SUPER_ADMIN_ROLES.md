# Fix Super Admin Roles - Quick Guide

## Problem

Both users (+916301308477 and +918555856366) are showing as "Admin" instead of "Super Admin" because their database records still have `adminRole: 'admin'` instead of `adminRole: 'super-admin'`.

---

## Solution 1: Firebase Console (Easiest)

### Steps:

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com/
   - Select project: `orinut-494cc`

2. **Navigate to Firestore Database**
   - Click "Firestore Database" in left sidebar
   - Click on "users" collection

3. **Update First User (+916301308477)**
   - Find the document for phone: `+916301308477`
   - Click on the document
   - Find field `adminRole`
   - Change value from `admin` to `super-admin`
   - Click "Update"

4. **Update Second User (+918555856366)**
   - Find the document for phone: `+918555856366`
   - Click on the document
   - Find field `adminRole`
   - Change value from `admin` to `super-admin`
   - Click "Update"

5. **Both Users Must:**
   - Log out from the website
   - Log back in
   - They will now see "Super Admin" badge with crown icon

---

## Solution 2: Using Browser Console (Quick)

If you're logged in as one of the admins, you can run this in the browser console:

### Steps:

1. **Open Browser Console**
   - Press F12 or Right-click → Inspect
   - Go to "Console" tab

2. **Run this code:**
   ```javascript
   // Update both Super Admins
   async function fixSuperAdmins() {
     const { getFirestore, collection, getDocs, doc, updateDoc } = window.firebase.firestore;
     const db = getFirestore();
     
     const phones = ['+916301308477', '+918555856366'];
     const usersRef = collection(db, 'users');
     const snapshot = await getDocs(usersRef);
     
     for (const docSnap of snapshot.docs) {
       const data = docSnap.data();
       if (phones.includes(data.phone)) {
         await updateDoc(doc(db, 'users', docSnap.id), {
           adminRole: 'super-admin',
           isAdmin: true
         });
         console.log(`✅ Updated ${data.name} to Super Admin`);
       }
     }
     
     console.log('Done! Please log out and log back in.');
   }
   
   fixSuperAdmins();
   ```

3. **Press Enter** to run

4. **Log out and log back in** to see changes

---

## Solution 3: Add Temporary Fix Function

Add this to your Admin Management page temporarily:

### In `src/pages/admin/AdminManagement.tsx`:

Add this function:

```typescript
const fixSuperAdminRoles = async () => {
  try {
    const allUsers = await getAllUsers();
    const superAdminPhones = ['+916301308477', '+918555856366'];
    
    for (const user of allUsers) {
      if (superAdminPhones.includes(user.phone)) {
        await promoteToAdmin(user.id, 'super-admin');
        console.log(`Fixed: ${user.name}`);
      }
    }
    
    toast({
      title: 'Fixed!',
      description: 'Super Admin roles updated. Please log out and log back in.',
    });
    
    await fetchData();
  } catch (error) {
    console.error('Error:', error);
  }
};
```

Add a button:

```tsx
<Button onClick={fixSuperAdminRoles}>
  Fix Super Admin Roles
</Button>
```

Click the button, then log out and back in.

---

## Solution 4: Direct Database Query

If you have access to Firebase CLI:

```bash
# Install firebase-tools if not installed
npm install -g firebase-tools

# Login
firebase login

# Use Firestore
firebase firestore:update --project orinut-494cc
```

Then run these commands in Firestore:

```javascript
db.collection('users')
  .where('phone', 'in', ['+916301308477', '+918555856366'])
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      doc.ref.update({
        adminRole: 'super-admin',
        isAdmin: true
      });
    });
  });
```

---

## Why This Happened

The database records were created before the Super Admin system was implemented, so they have:
- `isAdmin: true` ✅
- `adminRole: 'admin'` ❌ (should be 'super-admin')

The code now checks:
```typescript
SUPER_ADMIN_PHONES.includes(phone) → sets adminRole to 'super-admin'
```

But this only applies on NEW logins after the database is updated.

---

## Verification

After updating, both users should see:

**Before:**
- Badge: "Admin" (blue)
- Icon: Shield
- No "Admin Management" menu

**After:**
- Badge: "Super Admin" (purple)
- Icon: Crown
- "Admin Management" menu visible
- Protected status (cannot be removed)

---

## Quick Fix Summary

**Fastest Method:** Firebase Console
1. Open Firebase Console
2. Go to Firestore → users collection
3. Find both phone numbers
4. Change `adminRole` from `'admin'` to `'super-admin'`
5. Users log out and back in

**Done!** ✅

---

## Need Help?

If you have trouble, I can:
1. Create a proper migration script
2. Guide you through Firebase Console step-by-step
3. Add a one-click fix button to your admin panel

Let me know which solution you prefer!
