# Delhivery Integration Setup Guide

## ❌ The Error You're Seeing

```
Error: Delhivery API token is not configured
```

## ✅ Solution

This error occurs because the **Delhivery API token is missing** from your environment variables. Follow these steps to fix it:

---

## 📋 Step-by-Step Setup

### 1. Get Your Delhivery API Token

1. **Go to Delhivery Website**: https://www.delhivery.com/
2. **Login** to your Delhivery account
3. Navigate to **Settings → API**
4. Copy your **10-digit Surface Tracking API token**

> **Note**: If you don't have a Delhivery account yet, you'll need to sign up and get approved for their shipping services first.

---

### 2. Create Your `.env` File

1. In your project root folder, create a file named **`.env`** (if it doesn't already exist)
2. Add the following configuration:

```env
# ===================================
# DELHIVERY CONFIGURATION
# ===================================

# Your Delhivery API Token (REQUIRED)
VITE_DELHIVERY_API_TOKEN=your_10_digit_token_here

# Environment Settings
VITE_DELHIVERY_PRODUCTION=false
VITE_DELHIVERY_CLIENT_NAME=Prasannas-orinuts

# Warehouse/Pickup Location Details (REQUIRED)
VITE_DELHIVERY_WAREHOUSE_NAME=Premium Orchard Warehouse
VITE_DELHIVERY_PICKUP_ADDRESS=Your complete warehouse address
VITE_DELHIVERY_PICKUP_CITY=Hyderabad
VITE_DELHIVERY_PICKUP_STATE=Telangana
VITE_DELHIVERY_PICKUP_PINCODE=500001
VITE_DELHIVERY_PICKUP_PHONE=9876543210
VITE_DELHIVERY_PICKUP_CONTACT=Your Name
```

---

### 3. Fill in Your Details

Replace the placeholder values with your actual information:

- **`VITE_DELHIVERY_API_TOKEN`**: Your 10-digit token from Delhivery
- **`VITE_DELHIVERY_PICKUP_ADDRESS`**: Your warehouse/pickup location address
- **`VITE_DELHIVERY_PICKUP_CITY`**: Your city
- **`VITE_DELHIVERY_PICKUP_STATE`**: Your state
- **`VITE_DELHIVERY_PICKUP_PINCODE`**: Your warehouse pincode
- **`VITE_DELHIVERY_PICKUP_PHONE`**: Your contact phone number
- **`VITE_DELHIVERY_PICKUP_CONTACT`**: Contact person name

---

### 4. Restart Your Development Server

After creating/updating the `.env` file:

```bash
# Stop your current dev server (Ctrl+C)
# Then restart it
npm run dev
# or
bun run dev
```

> **Important**: You MUST restart the dev server for environment variables to take effect!

---

## 🔍 Testing Mode vs Production Mode

### Testing (Staging Environment)
```env
VITE_DELHIVERY_PRODUCTION=false
```
- Uses Delhivery's staging/test API
- No real shipments created
- For testing purposes

### Production (Live Environment)
```env
VITE_DELHIVERY_PRODUCTION=true
```
- Uses Delhivery's production API
- **Real shipments will be created**
- Only enable when you're ready to go live!

---

## 🐛 Debug Logging

I've added comprehensive debug logging to help you troubleshoot. When you try to create a shipment, check the browser console for:

- ✅ Configuration status
- ✅ API request details
- ✅ API response
- ❌ Detailed error messages

Look for messages like:
```
🔍 Delhivery Configuration Check:
- API URL: https://staging-express.delhivery.com/api
- Token exists: true
- Token length: 10
- Is Production: false
```

---

## ⚠️ Common Issues

### Issue: "Token is not configured"
**Solution**: Make sure you've added `VITE_DELHIVERY_API_TOKEN` to your `.env` file and restarted the dev server.

### Issue: "API returns 401 Unauthorized"
**Solution**: Your token is invalid or expired. Get a new token from Delhivery.

### Issue: "Warehouse details missing"
**Solution**: Fill in all the `VITE_DELHIVERY_PICKUP_*` variables in your `.env` file.

---

## 📝 Important Notes

1. **Never commit your `.env` file** to git (it's already in `.gitignore`)
2. **All variables MUST start with `VITE_`** for Vite to expose them to the frontend
3. **Keep your API token secret** - don't share it publicly
4. Make sure your Delhivery account is **active and approved** for shipping services

---

## ✅ Verification Checklist

- [ ] Created `.env` file in project root
- [ ] Added `VITE_DELHIVERY_API_TOKEN` with your actual token
- [ ] Filled in all warehouse/pickup details
- [ ] Restarted development server
- [ ] Checked browser console for configuration logs
- [ ] Tried creating a test shipment

---

## 🆘 Still Having Issues?

Check the browser console for detailed error messages. The debug logs will show you exactly what's wrong with your configuration.

If you see network errors or API errors, the issue might be with:
- Your Delhivery account status
- Invalid token
- Incorrect warehouse details
- Network connectivity

Contact Delhivery support if you have account-related issues.
