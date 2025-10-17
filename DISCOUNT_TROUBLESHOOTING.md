# Product Discount System - Troubleshooting Guide

## Issues Identified and Fixed

### Issue 1: Firebase Permission Error ❌
**Error Message:**
```
Error fetching product discount: FirebaseError: Missing or insufficient permissions.
Error fetching discounts: FirebaseError: Missing or insufficient permissions.
```

**Root Cause:**
The `productDiscounts` collection was not defined in Firestore security rules.

**Solution:**
Added rules for `productDiscounts` collection in both `firestore.rules` and `firestore-secure.rules`:

```javascript
// ============================================
// PRODUCT DISCOUNTS COLLECTION
// ============================================
match /productDiscounts/{productId} {
  // Anyone can read discounts (needed to display discounted prices)
  allow read: if true;
  
  // Only admins can create/update/delete discounts
  allow create, update, delete: if isAdmin();
}
```

**Action Required:**
Deploy the updated Firestore rules:
```bash
firebase deploy --only firestore:rules
```

---

### Issue 2: Product Dropdown Not Showing ❌
**Problem:**
When clicking "Select a product" in the Add Discount dialog, no products appeared in the dropdown.

**Root Causes:**
1. Products might not be loading due to permission errors
2. No error handling or feedback when products list is empty
3. No debug logging to identify the issue

**Solutions Applied:**

#### A. Added Debug Logging
```typescript
const loadData = async () => {
  console.log('🔄 Loading discounts and products...');
  const [discountsData, productsData] = await Promise.all([
    getAllDiscounts(),
    getAllProducts()
  ]);
  console.log('✅ Loaded discounts:', discountsData.length);
  console.log('✅ Loaded products:', productsData.length);
  console.log('📦 Products:', productsData);
  // ...
};
```

#### B. Enhanced Product Selection UI
Added fallback UI when no products are available:
```tsx
{availableProducts.length === 0 && !editingDiscount ? (
  <div className="p-4 border rounded-md text-center text-muted-foreground">
    <p className="mb-2">No products available</p>
    <p className="text-sm">All products already have discounts or loading failed</p>
  </div>
) : (
  <Select>
    {/* ... */}
  </Select>
)}
```

#### C. Added Selection Logging
```typescript
onValueChange={(value) => {
  console.log('🎯 Selected product:', value);
  setSelectedProductId(value);
}}
```

---

### Issue 3: X-Frame-Options Warning ⚠️
**Warning Message:**
```
-Frame-Options may only be set via an HTTP header sent along with a document. 
It may not be set inside <meta>.
```

**Root Cause:**
This is a browser warning that occurs when trying to set `X-Frame-Options` in a `<meta>` tag instead of as an HTTP header.

**Impact:**
- This is a **non-critical warning**
- Does not affect functionality
- Common in SPAs (Single Page Applications)

**Solution:**
This warning can be safely ignored or fixed by:
1. Removing the X-Frame-Options meta tag if it exists in `index.html`
2. Setting it as an HTTP header in server configuration (Vercel, Firebase Hosting, etc.)

For Vercel, add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

### Issue 4: Dialog Description Warning ⚠️
**Warning Message:**
```
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
```

**Root Cause:**
Accessibility warning - Dialog should have a description for screen readers.

**Solution:**
Add `DialogDescription` to the dialog:
```tsx
<DialogHeader>
  <DialogTitle>
    {editingDiscount ? 'Edit Discount' : 'Add New Discount'}
  </DialogTitle>
  <DialogDescription>
    {editingDiscount 
      ? 'Update the discount percentage for this product'
      : 'Select a product and set a discount percentage'
    }
  </DialogDescription>
</DialogHeader>
```

---

## Step-by-Step Troubleshooting Process

### Step 1: Check Firebase Rules ✅
1. Open Firebase Console → Firestore Database → Rules
2. Verify `productDiscounts` collection rules are present
3. If not, deploy updated rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Step 2: Verify Products Load ✅
1. Open browser console (F12)
2. Navigate to `/admin/discounts`
3. Look for console logs:
   - `🔄 Loading discounts and products...`
   - `✅ Loaded products: X`
   - `📦 Products: [array]`

### Step 3: Check Available Products ✅
1. Click "Add Discount" button
2. Look for console log: `🔓 Opening dialog, available products: X`
3. If count is 0, all products already have discounts

### Step 4: Test Product Selection ✅
1. Click on the product dropdown
2. Products should appear
3. When selecting, console shows: `🎯 Selected product: [id]`

### Step 5: Verify Discount Creation ✅
1. Select a product
2. Enter percentage (e.g., 12)
3. See live preview
4. Click "Add Discount"
5. Toast notification appears
6. Discount appears in the list

---

## Common Issues and Solutions

### Issue: "No products available" message
**Causes:**
1. All products already have discounts
2. Products failed to load from Firestore
3. Firebase rules blocking product reads

**Solutions:**
1. Delete an existing discount to free up a product
2. Check console for error messages
3. Verify products collection has read permission for admins
4. Check network tab for failed requests

---

### Issue: Dropdown opens but is empty
**Causes:**
1. `availableProducts` array is empty
2. Products loaded but filtered out
3. React rendering issue

**Solutions:**
1. Check `availableProducts.length` in console
2. Verify filtering logic:
   ```typescript
   const availableProducts = products.filter(product => 
     !discounts.find(d => d.id === product.id) || 
     editingDiscount?.id === product.id
   );
   ```
3. Clear browser cache and reload

---

### Issue: "Failed to load data" toast
**Causes:**
1. Firebase connection issue
2. Permission denied errors
3. Network error

**Solutions:**
1. Check Firebase connection status
2. Verify user is authenticated as admin
3. Check browser console for detailed error
4. Verify Firebase project configuration in `.env`

---

### Issue: Discount not appearing on product cards
**Causes:**
1. Discount is inactive
2. ProductCard not fetching discount
3. Cache issue

**Solutions:**
1. Verify discount `isActive` is true
2. Check console for "Error loading discount"
3. Hard refresh browser (Ctrl+Shift+R)
4. Check ProductCard `useEffect` is running

---

## Firebase Deployment Commands

### Deploy Only Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Everything
```bash
firebase deploy
```

### Check Current Rules
```bash
firebase firestore:rules get
```

### Test Rules Locally
```bash
firebase emulators:start --only firestore
```

---

## Testing Checklist

### Admin Page Tests
- [ ] Page loads without errors
- [ ] Statistics display correctly
- [ ] "Add Discount" button opens dialog
- [ ] Product dropdown shows available products
- [ ] Can select a product
- [ ] Percentage input accepts 0-100
- [ ] Live preview shows correct calculation
- [ ] Can create discount successfully
- [ ] Discount appears in list
- [ ] Can edit existing discount
- [ ] Can toggle discount on/off
- [ ] Can delete discount
- [ ] Search works correctly

### Product Display Tests
- [ ] Discount badge shows on product cards
- [ ] Original price has strikethrough
- [ ] Discounted price in green
- [ ] ProductDetail shows discount
- [ ] All weights show discounted prices
- [ ] Cart uses discounted price
- [ ] Checkout shows discounted total

### Permission Tests
- [ ] Non-admin cannot access `/admin/discounts`
- [ ] Non-admin cannot read discounts (should work - public read)
- [ ] Non-admin cannot create/update/delete discounts
- [ ] Admin can perform all operations

---

## Console Output Reference

### Successful Load
```
🔄 Loading discounts and products...
✅ Loaded discounts: 0
✅ Loaded products: 8
📦 Products: [Array of 8 products]
```

### Dialog Open
```
🔓 Opening dialog, available products: 8
📦 Available products: [Array of 8 products]
```

### Product Selection
```
🎯 Selected product: abc123xyz
```

### Error Cases
```
❌ Error loading data: FirebaseError: Missing or insufficient permissions.
❌ Error fetching discounts: FirebaseError: Permission denied
❌ Failed to load data (toast notification)
```

---

## Quick Fix Summary

### If nothing works, try this sequence:
1. **Deploy Firebase rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Clear browser cache:**
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
   - Or hard refresh: Ctrl+Shift+R

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

4. **Check Firebase Console:**
   - Verify rules are deployed
   - Check if productDiscounts collection exists
   - Verify you're logged in as admin

5. **Check browser console:**
   - Look for error messages
   - Verify products are loading
   - Check network requests

---

## Support and Debugging

### Enable Verbose Logging
Add to `src/services/discountService.ts`:
```typescript
const DEBUG = true;

export const getAllDiscounts = async () => {
  if (DEBUG) console.log('📥 Fetching all discounts...');
  try {
    const discountsRef = collection(db, DISCOUNTS_COLLECTION);
    const snapshot = await getDocs(discountsRef);
    if (DEBUG) console.log('📦 Received', snapshot.docs.length, 'discounts');
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ProductDiscount));
  } catch (error) {
    console.error('❌ Error fetching discounts:', error);
    throw error;
  }
};
```

### Network Debugging
1. Open DevTools → Network tab
2. Filter by "firestore"
3. Look for failed requests (red)
4. Check response status codes
5. Examine error messages

---

## Expected Behavior After Fixes

1. ✅ No permission errors in console
2. ✅ Products load successfully
3. ✅ Product dropdown shows all available products
4. ✅ Can create, edit, and delete discounts
5. ✅ Discounts display on product cards
6. ✅ Discounted prices show correctly
7. ✅ Cart uses discounted prices

## Status: READY FOR TESTING 🚀
