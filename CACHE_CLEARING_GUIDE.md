# Browser Cache Clearing Guide - Fix Deployment Issues

## 🚨 Problem
After deploying the API endpoint fix, you're still seeing:
```
POST /api/api/create-order 405 (Method Not Allowed)
```

**Root Cause**: Your browser is serving the **OLD cached JavaScript bundle** that still has the wrong API paths.

## ✅ Solution: Clear Browser Cache

### Method 1: Hard Refresh (Quickest)

1. **Chrome/Edge** (Windows):
   - Press: `Ctrl + Shift + Delete`
   - OR Press: `Ctrl + F5` (hard refresh)
   - OR Press: `Shift + F5`

2. **Alternative**: Right-click the refresh button → Select "Empty Cache and Hard Reload"

### Method 2: DevTools Cache Clear (Most Reliable)

1. Open Chrome DevTools: `F12`
2. Go to **Network** tab
3. Check "**Disable cache**" checkbox
4. Keep DevTools **open**
5. Refresh the page: `Ctrl + R`
6. Try checkout again

### Method 3: Manual Cache Clear (Nuclear Option)

1. Press `Ctrl + Shift + Delete`
2. Select **Time range**: "All time"
3. Check:
   - ✅ Cached images and files
   - ✅ Cookies and site data
4. Click **Clear data**
5. Refresh: `Ctrl + F5`

### Method 4: Incognito/Private Window (Testing)

1. Open Incognito: `Ctrl + Shift + N`
2. Go to: `https://prasanna-premium-orchard.vercel.app`
3. Test checkout flow
4. This proves if it's a cache issue

## 🔍 Verify Fix is Working

After clearing cache, check DevTools Console:

### ✅ CORRECT (After cache clear):
```
POST https://prasanna-premium-orchard.vercel.app/api/create-order 200 OK
```

### ❌ WRONG (Still cached):
```
POST https://prasanna-premium-orchard.vercel.app/api/api/create-order 405
```

## 📋 Complete Testing Checklist

After clearing cache:

1. ✅ Open browser DevTools (F12) → Network tab
2. ✅ Enable "Disable cache" in Network tab
3. ✅ Hard refresh: `Ctrl + F5`
4. ✅ Add product to cart
5. ✅ Go to checkout
6. ✅ Click "Place Order"
7. ✅ Check Network tab - URL should be `/api/create-order` (NOT `/api/api/create-order`)
8. ✅ Verify 200 OK response
9. ✅ Razorpay modal should open

## 🎯 Expected Behavior (After Fix)

### Console Logs:
```
📦 Items count: 3
📄 Creating order in database...
✅ Firebase order created: <order-id>
🌐 Creating Razorpay order on server...
🔐 Creating authenticated Razorpay order on server...
💰 Amount: 1495
💳 Currency: INR
🧾 Receipt: <order-id>
✅ Razorpay order created successfully
```

### Network Requests:
```
POST /api/create-order
Status: 200 OK
Response: { success: true, orderId: "...", ... }
```

## 🔧 Why This Happens

Vercel serves assets with aggressive caching headers:

```http
Cache-Control: public, max-age=31536000, immutable
```

This means:
- JavaScript bundles are cached for **1 year**
- Browser doesn't check for updates
- Even after new deployment, old code runs

## 🚀 Production Cache-Busting Strategy

Vercel automatically adds **content hashes** to filenames:
- Old: `paymentService-IQDMVtl5.js`
- New: `paymentService-XYZ123.js` (different hash after build)

**BUT**: The main `index.html` must be fetched fresh to get new filenames.

### Force Browser to Fetch Fresh index.html:

1. Clear cache OR
2. Hard refresh OR
3. Use incognito mode

## 💡 Pro Tips

### For Development:
- Keep DevTools open with "Disable cache" checked
- Use incognito mode for testing production
- Clear cache after every deployment

### For Users:
- Vercel automatically serves new bundles
- Users get updates on next visit (after ~5 minutes)
- No action needed from end users

### Vercel Cache Headers:
```http
# index.html - Short cache (Vercel default)
Cache-Control: public, max-age=0, must-revalidate

# JS/CSS bundles - Long cache (content-hashed)
Cache-Control: public, max-age=31536000, immutable
```

## 🐛 Still Not Working?

If after clearing cache you STILL see `/api/api/create-order`:

### 1. Check Deployment Domain
Make sure you're on the correct domain:
```
https://prasanna-premium-orchard.vercel.app  ✅ Production
```

NOT:
```
https://prasanna-premium-orchard-hbt8wwy03-vikranthsai310s-projects.vercel.app  ⚠️  Preview
```

### 2. Check Build Output
In Vercel dashboard:
- Go to Deployment → Build Logs
- Search for: "src/constants/api.ts"
- Verify no build errors

### 3. Check Source Code
In DevTools:
- Press `Ctrl + P`
- Type: `api.ts`
- Open `constants/api.ts`
- Verify it shows: `CREATE_ORDER: '/create-order'`
- NOT: `CREATE_ORDER: '${API_BASE_URL}/create-order'`

### 4. Nuclear Option - Force Rebuild
```bash
# Trigger empty commit to force rebuild
git commit --allow-empty -m "chore: Force Vercel rebuild"
git push origin main
```

## ✅ Success Indicators

You'll know it's working when:

1. ✅ No more `/api/api/` double paths in Network tab
2. ✅ All API calls show 200 OK (or appropriate status)
3. ✅ Razorpay modal opens successfully
4. ✅ Orders save to Firestore
5. ✅ No 405 Method Not Allowed errors

## 📞 Need Help?

If clearing cache doesn't fix it:
1. Share screenshot of Network tab showing the API request
2. Share DevTools Console logs (all of them)
3. Confirm which domain you're testing (production vs preview)
4. Share Vercel build logs if there are errors

---

**Remember**: After EVERY deployment, clear your browser cache or use hard refresh to see changes immediately! 🔄
