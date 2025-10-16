# 🎟️ Coupon System - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Create Your First Coupon (2 minutes)
1. Login as admin
2. Click your profile → **"Manage Coupons"**
3. Click **"Create Coupon"** button
4. Fill in:
   ```
   Code: WELCOME10
   Type: Percentage
   Value: 10
   Description: Welcome offer
   ✓ Active
   ```
5. Click **"Create Coupon"**
6. Done! ✅

### Step 2: Test It (2 minutes)
1. Logout (or open incognito)
2. Add items to cart
3. Go to checkout
4. Enter: `WELCOME10`
5. Click **"Apply"**
6. See discount! 🎉

### Step 3: Share It (1 minute)
- Copy the code
- Share with customers via:
  - Email
  - WhatsApp
  - Social media
  - Website banner

---

## 📋 Quick Coupon Templates

### Copy-Paste Ready Coupons:

**New Customer Welcome:**
```
Code: WELCOME15
Type: Percentage
Value: 15
Min Order: None
Per User: 1
Description: Welcome! 15% off your first order
```

**Diwali Special:**
```
Code: DIWALI25
Type: Percentage
Value: 25
Min Order: 500
Max Discount: 200
Valid: Oct 20 - Nov 5
Total Uses: 500
Per User: 1
Description: Diwali Special - 25% off on orders ₹500+
```

**Bulk Order:**
```
Code: BULK100
Type: Fixed
Value: 100
Min Order: 1000
Description: ₹100 off on orders above ₹1000
```

**Flash Sale:**
```
Code: FLASH50
Type: Percentage
Value: 50
Max Discount: 150
Valid: 24 hours
Total Uses: 50
Per User: 1
Description: Flash Sale! 50% off - Today Only!
```

---

## 🎯 Where Everything Is

### **Admin Access:**
- URL: `/admin/coupons`
- Menu: Profile Dropdown → "Manage Coupons"

### **Customer Access:**
- Page: Checkout page
- Section: "Have a Coupon Code?"

### **Files Created/Modified:**
1. `src/services/couponService.ts` - Backend logic
2. `src/pages/admin/AdminCoupons.tsx` - Admin page
3. `src/contexts/CartContext.tsx` - Cart integration
4. `src/pages/Checkout.tsx` - Customer UI
5. `src/App.tsx` - Routing
6. `src/components/Header.tsx` - Navigation

---

## ⚡ Quick Actions

### **Create Coupon:**
Admin Panel → Create Coupon → Fill Form → Save

### **Edit Coupon:**
Find Coupon → Click ✏️ → Modify → Update

### **Deactivate Coupon:**
Find Coupon → Click "Deactivate"

### **Copy Code:**
Find Coupon → Click 📋 icon

### **Delete Coupon:**
Find Coupon → Click 🗑️ → Confirm

---

## 🎨 Coupon Types Quick Guide

| Type | Example | When to Use |
|------|---------|-------------|
| **Percentage** | 20% off | General discounts, sales |
| **Fixed** | ₹100 off | Minimum order incentives |
| **Min Order** | 10% off ₹500+ | Increase cart value |
| **Limited Uses** | 50 uses only | Flash sales, scarcity |
| **Per User Limit** | 1 per customer | Fair distribution |
| **Time-Limited** | Valid 7 days | Urgency, campaigns |

---

## ✅ Daily Checklist

### Morning:
- [ ] Check active coupons
- [ ] Review usage statistics
- [ ] Create today's promotions

### Evening:
- [ ] Deactivate expired coupons
- [ ] Analyze performance
- [ ] Plan tomorrow's offers

---

## 🔥 Pro Tips

### **Marketing:**
1. Create urgency with time limits
2. Use exclusive codes for influencers
3. Reward loyal customers with higher discounts
4. Test different discount amounts
5. Announce flash sales on social media

### **Optimization:**
1. Set minimum orders to increase AOV
2. Use max discount caps to control costs
3. Limit per-user usage to prevent abuse
4. Track which coupons perform best
5. Deactivate underperforming coupons

### **Customer Experience:**
1. Make codes easy to remember (SAVE20 not X7K9M2)
2. Add clear descriptions
3. Communicate savings clearly
4. Make codes shareable
5. Celebrate with emojis! 🎉

---

## 🆘 Quick Troubleshooting

**Coupon not working?**
- ✓ Is it active?
- ✓ Is it expired?
- ✓ Met minimum order?
- ✓ Usage limit reached?

**Can't create coupon?**
- ✓ Code already exists?
- ✓ Valid dates?
- ✓ All fields filled?

**Discount not showing?**
- ✓ Code entered correctly?
- ✓ Applied successfully?
- ✓ Refresh the page?

---

## 📞 Need Help?

Check these docs:
1. `COUPON_SYSTEM_COMPLETE.md` - Full documentation
2. `COUPON_SYSTEM_GUIDE.md` - Detailed guide

---

## 🎉 You're Ready!

Start creating amazing coupon campaigns and boost your sales! 🚀

**First coupon suggestion:** Create WELCOME10 for new customers right now!

---

*Quick Start Guide v1.0*
*Last Updated: October 16, 2025*
