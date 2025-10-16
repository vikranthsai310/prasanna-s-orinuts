# 🚀 Delhivery Setup - Step by Step Instructions

Follow these steps **exactly** to get Delhivery working:

---

## Step 1: Create Delhivery Account (10 minutes)

1. **Go to:** https://www.delhivery.com
2. **Click:** "Sign Up" or "Get Started"
3. **Fill in details:**
   - Business Name: Premium Orchard
   - Your Name
   - Email
   - Phone Number
   - GST Number (if you have)
4. **Submit** and wait for verification email
5. **Verify** your email

---

## Step 2: Get API Token (5 minutes)

1. **Login** to Delhivery Dashboard
2. **Go to:** Settings (top right gear icon)
3. **Click:** API Settings
4. **Find:** Surface Tracking API Token
5. **Copy** the 10-digit token
6. **Save** it somewhere safe (you'll need it next)

**Example:** `1234567890`

---

## Step 3: Add Warehouse Details (5 minutes)

1. **In Delhivery Dashboard, go to:** Warehouse Management
2. **Click:** Add New Warehouse
3. **Fill in:**
   ```
   Warehouse Name: Premium Orchard Warehouse
   Contact Person: [Your Name]
   Phone: [Your Phone]
   Address Line 1: [Your Address]
   Address Line 2: [Building/Landmark]
   City: [Your City]
   State: [Your State]
   Pincode: [Your Pincode]
   Email: [Your Email]
   ```
4. **Click:** Save
5. **Mark** as default pickup location
6. **Note:** Verification takes 1-2 days

---

## Step 4: Create .env File (3 minutes)

1. **Open** your project folder
2. **Find** `.env.example` file
3. **Copy** it and rename to `.env`
4. **Open** `.env` in a text editor
5. **Replace** these values:

```bash
# Replace YOUR_10_DIGIT_TOKEN with the token from Step 2
DELHIVERY_API_TOKEN=1234567890

# Replace with your warehouse details from Step 3
DELHIVERY_WAREHOUSE_NAME=Premium Orchard Warehouse
DELHIVERY_PICKUP_ADDRESS=123 Main Street, Building A
DELHIVERY_PICKUP_CITY=Mumbai
DELHIVERY_PICKUP_STATE=Maharashtra
DELHIVERY_PICKUP_PINCODE=400001
DELHIVERY_PICKUP_PHONE=9876543210
DELHIVERY_PICKUP_CONTACT=John Doe

# Keep these as is for testing
DELHIVERY_API_URL=https://track.delhivery.com/api
VITE_DELHIVERY_PRODUCTION=false
VITE_DELHIVERY_CLIENT_NAME=PremiumOrchard
```

6. **Save** the file

---

## Step 5: Test Locally (5 minutes)

1. **Open Terminal** in your project folder

2. **Install dependencies** (if not already):
   ```bash
   npm install
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```

4. **Open browser:** http://localhost:5173

5. **Test shipping calculator:**
   - Go to a product page
   - Try to add to cart
   - Go to checkout
   - Enter pincode: 400001
   - Should show shipping cost

---

## Step 6: Deploy to Vercel (10 minutes)

### If you're using Vercel:

1. **Go to:** https://vercel.com
2. **Login** to your account
3. **Select** your Premium Orchard project
4. **Go to:** Settings → Environment Variables
5. **Add these variables ONE BY ONE:**

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `DELHIVERY_API_TOKEN` | Your 10-digit token | All |
| `DELHIVERY_API_URL` | https://track.delhivery.com/api | All |
| `DELHIVERY_WAREHOUSE_NAME` | Your warehouse name | All |
| `DELHIVERY_PICKUP_ADDRESS` | Your address | All |
| `DELHIVERY_PICKUP_CITY` | Your city | All |
| `DELHIVERY_PICKUP_STATE` | Your state | All |
| `DELHIVERY_PICKUP_PINCODE` | Your pincode | All |
| `DELHIVERY_PICKUP_PHONE` | Your phone | All |
| `DELHIVERY_PICKUP_CONTACT` | Contact name | All |
| `VITE_DELHIVERY_PRODUCTION` | false | All |
| `VITE_DELHIVERY_CLIENT_NAME` | PremiumOrchard | All |

6. **Click:** Save for each variable
7. **Go to:** Deployments
8. **Click:** Redeploy on latest deployment
9. **Wait** for deployment to complete (2-3 minutes)

---

## Step 7: Deploy to Netlify (10 minutes)

### If you're using Netlify:

1. **Go to:** https://app.netlify.com
2. **Login** to your account
3. **Select** your Premium Orchard site
4. **Go to:** Site Settings → Build & Deploy → Environment
5. **Click:** Edit Variables
6. **Add these variables:**

```
DELHIVERY_API_TOKEN = your_10_digit_token
DELHIVERY_API_URL = https://track.delhivery.com/api
DELHIVERY_WAREHOUSE_NAME = Your warehouse name
DELHIVERY_PICKUP_ADDRESS = Your address
DELHIVERY_PICKUP_CITY = Your city
DELHIVERY_PICKUP_STATE = Your state
DELHIVERY_PICKUP_PINCODE = Your pincode
DELHIVERY_PICKUP_PHONE = Your phone
DELHIVERY_PICKUP_CONTACT = Contact name
VITE_DELHIVERY_PRODUCTION = false
VITE_DELHIVERY_CLIENT_NAME = PremiumOrchard
```

7. **Click:** Save
8. **Go to:** Deploys
9. **Click:** Trigger deploy
10. **Wait** for deployment to complete (2-3 minutes)

---

## Step 8: Test on Live Site (5 minutes)

1. **Open** your live website
2. **Browse** a product
3. **Add to cart**
4. **Go to checkout**
5. **Enter shipping details:**
   - Name: Test User
   - Phone: 9876543210
   - Address: 123 Test Street
   - City: Mumbai
   - State: Maharashtra
   - Pincode: 400001
6. **Check** if shipping cost is calculated
7. **Place** a test order (use test Razorpay card)
8. **Check** Delhivery dashboard for new shipment

---

## Step 9: Verify Shipment Created (5 minutes)

1. **Login** to Delhivery Dashboard
2. **Go to:** Shipments
3. **Look for** your test order
4. **Check:**
   - Waybill number is generated
   - Status shows "Created" or "Pickup Scheduled"
   - All details are correct
5. **Copy** waybill number

---

## Step 10: Test Tracking (3 minutes)

1. **Go to your website**
2. **Login** with test user
3. **Go to:** Orders / My Orders
4. **Find** the test order
5. **Click:** Track Order
6. **Check:**
   - Tracking page loads
   - Status is shown
   - Delhivery tracking link works

---

## ✅ All Done!

Your Delhivery integration is **COMPLETE** and **WORKING**!

### What happens now:

1. ✅ Customer places order
2. ✅ Payment is processed
3. ✅ Shipment automatically created with Delhivery
4. ✅ Waybill number saved to order
5. ✅ Customer can track order
6. ✅ You can see all shipments in Delhivery dashboard

### No manual work needed!

---

## 🔧 Quick Troubleshooting

### Problem: "API token not configured"
**Fix:** 
- Check `.env` file has `DELHIVERY_API_TOKEN`
- Restart dev server: `npm run dev`

### Problem: "Pincode not serviceable"
**Fix:**
- Use test pincode: 400001 (Mumbai) or 110001 (Delhi)
- Check pincode on Delhivery website

### Problem: Shipment not showing in Delhivery
**Fix:**
- Wait 5-10 minutes
- Check warehouse is verified
- Check environment variables are correct
- Contact Delhivery support: 011-4948-4000

### Problem: Can't track order
**Fix:**
- Wait 2-4 hours after shipment creation
- Check waybill number is correct
- Try tracking on Delhivery website directly

---

## 📞 Need Help?

### Delhivery Support:
- **Phone:** 011-4948-4000
- **Email:** support@delhivery.com
- **Available:** 24/7

### Read These Docs:
- `DELHIVERY_SETUP.md` - Complete guide
- `DELHIVERY_QUICK_START.md` - Quick reference
- `DELHIVERY_INTEGRATION_SUMMARY.md` - Overview

---

## 🎉 Congratulations!

You've successfully integrated Delhivery with your Premium Orchard store!

**Happy Shipping!** 📦✨
