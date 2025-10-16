# Quick Fix Guide for Admin Pages

## TypeScript Errors to Fix

### Issue 1: Order Properties
The `Order` interface uses different property names than expected:
- ❌ `order.status` → ✅ `order.orderStatus`
- ❌ `order.total` → ✅ `order.totalAmount`

### Issue 2: Timestamp Conversion
Firestore `Timestamp` objects need conversion:
- ❌ `new Date(order.createdAt)` 
- ✅ `order.createdAt.toDate()` (if Timestamp)
- ✅ `new Date(order.createdAt)` (if string)

### Issue 3: Address Properties
The `Address` interface uses different names:
- Check the actual Address interface in your codebase

---

## Quick Fixes

### Fix 1: UserDetails.tsx

Replace lines 85-88:
```typescript
// OLD CODE:
const completed = orders.filter((o) => o.status === 'delivered').length;
const pending = orders.filter((o) => ['pending', 'confirmed', 'processing'].includes(o.status)).length;
const cancelled = orders.filter((o) => o.status === 'cancelled').length;
const avgOrderValue = total > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / total : 0;

// NEW CODE:
const completed = orders.filter((o) => o.orderStatus === 'delivered').length;
const pending = orders.filter((o) => ['pending', 'confirmed', 'processing'].includes(o.orderStatus)).length;
const cancelled = orders.filter((o) => o.orderStatus === 'cancelled').length;
const avgOrderValue = total > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / total : 0;
```

Replace line 162:
```typescript
// OLD:
<span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>

// NEW (handle both Date and Timestamp):
<span>Joined {(user.createdAt instanceof Date ? user.createdAt : user.createdAt.toDate()).toLocaleDateString()}</span>
```

Replace order.status → order.orderStatus throughout the file
Replace order.total → order.totalAmount throughout the file

Replace order.createdAt Date conversion:
```typescript
// OLD:
{new Date(order.createdAt).toLocaleString()}

// NEW:
{order.createdAt.toDate().toLocaleString()}
```

### Fix 2: Analytics.tsx

Replace all instances:
- `order.total` → `order.totalAmount`
- `order.status` → `order.orderStatus`
- `new Date(order.createdAt)` → `order.createdAt.toDate()`

---

## Automated Search & Replace

Run these in VS Code (Ctrl+H):

### Search & Replace 1:
**Find:** `o\.status`
**Replace:** `o.orderStatus`
**Files:** `src/pages/admin/*.tsx`

### Search & Replace 2:
**Find:** `order\.status`
**Replace:** `order.orderStatus`
**Files:** `src/pages/admin/*.tsx`

### Search & Replace 3:
**Find:** `o\.total`
**Replace:** `o.totalAmount`
**Files:** `src/pages/admin/*.tsx`

### Search & Replace 4:
**Find:** `order\.total`
**Replace:** `order.totalAmount`
**Files:** `src/pages/admin/*.tsx`

### Search & Replace 5:
**Find:** `new Date\(order\.createdAt\)`
**Replace:** `order.createdAt.toDate()`
**Files:** `src/pages/admin/*.tsx`
**Use:** Regex mode

---

## After Fixes

Run:
```bash
# Check for errors
npm run build

# or
npm run type-check
```

All TypeScript errors should be resolved! ✅
