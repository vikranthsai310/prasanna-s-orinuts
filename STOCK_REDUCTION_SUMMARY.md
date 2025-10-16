# Stock Reduction - Quick Reference

## 🎯 Yes! Stock WILL get reduced when orders are placed!

### ✅ What Happens When Order is Placed:

1. **Check Stock** → Verify all items have sufficient stock
2. **Create Order** → Save order to Firestore
3. **Reduce Stock** → Automatically subtract ordered quantity from product stock
4. **Confirm Order** → Customer receives confirmation

### Example:
```
Before Order:
  - Premium Almonds: 50 in stock
  
Customer Orders:
  - 5 units of Premium Almonds
  
After Order:
  - Premium Almonds: 45 in stock ✅
```

---

## 🔄 What Happens When Order is Cancelled:

1. **Admin Cancels** → Changes order status to 'cancelled'
2. **Restore Stock** → Automatically adds back the quantity to product stock
3. **Update Status** → Order marked as cancelled

### Example:
```
Before Cancellation:
  - Premium Almonds: 45 in stock
  
Order Cancelled:
  - 5 units of Premium Almonds
  
After Cancellation:
  - Premium Almonds: 50 in stock ✅
```

---

## ⚠️ Stock Protection:

### Won't Allow Orders If:
- Product is out of stock (stock = 0)
- Requested quantity > available stock
- Product doesn't exist

### Error Message:
```
"Insufficient stock for Premium Almonds. Available: 45, Requested: 50"
```

---

## 📊 Where to Monitor Stock:

1. **Admin Dashboard** → Products page
   - Real-time stock display
   - Color-coded warnings (red if < 20)
   - "In Stock" / "Out of Stock" badges

2. **Product Edit Page**
   - Manual stock adjustment
   - Immediate updates

---

## 🔍 Code Location:

**File:** `src/services/orderService.ts`

**Functions:**
- `createOrder()` - Reduces stock when order is created
- `updateOrderStatus()` - Triggers stock restoration on cancellation
- `restoreStock()` - Restores stock for cancelled orders

---

## 💡 Key Features:

✅ **Automatic** - No manual intervention needed
✅ **Real-time** - Stock updates immediately
✅ **Safe** - Validates stock before allowing order
✅ **Reversible** - Restores stock on cancellation
✅ **Accurate** - Always shows current available stock

---

## 🚀 Status: IMPLEMENTED ✅

Stock reduction is now fully functional and working!
