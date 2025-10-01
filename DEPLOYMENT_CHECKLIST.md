# 🚀 Vercel Deployment Checklist & Fix Guide

**Date:** October 1, 2025  
**Project:** Prasanna Premium Orchard  
**Deployment URL:** https://prasanna-premium-orchard.vercel.app

---

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Set in Vercel ✓
All environment variables from `.env` file have been added to Vercel Dashboard.

### 2. Code Pushed to Git ✓
Latest code including all improvements pushed to GitHub.

---

## 🔧 Post-Deployment Issues & Fixes

### ✅ **ISSUE 1: Double /api/api/ Path - FIXED**

**Error Message:**
```
POST https://prasanna-premium-orchard.vercel.app/api/api/create-order 405 (Method Not Allowed)
                                                      ^^^^^^^^
                                                      DUPLICATE!
```

**Root Cause:**
API endpoints were prefixed with `/api` in constants file, then `apiService` was adding `/api` again as base URL.

**Fix Applied:**
Removed `/api` prefix from all endpoint paths in `src/constants/api.ts`:
```typescript
// Before (WRONG):
CREATE_ORDER: `${API_BASE_URL}/create-order`,  // /api/create-order

// After (CORRECT):
CREATE_ORDER: '/create-order',  // Just the endpoint path
```

**Result:**
- apiService baseUrl: `/api`
- Endpoint: `/create-order`
- Final URL: `/api/create-order` ✅

**Status:** ✅ Fixed - Commit and redeploy

---

### ⚠️ **ISSUE 2: Firebase Auth - Unauthorized Domain**

**Error Message:**
```
FirebaseError: Firebase: Error (auth/unauthorized-domain)
The current domain is not authorized for OAuth operations
Domain: prasanna-premium-orchard-hbt8wwy03-vikranthsai310s-projects.vercel.app
```

**Root Cause:**
Your Vercel deployment domains are not added to Firebase's authorized domains list.

**Fix Steps:**

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select project: **orinut-494cc**

2. **Navigate to Authentication:**
   - Click **Authentication** (left sidebar)
   - Click **Settings** tab
   - Scroll to **Authorized domains** section

3. **Add These Domains:**

   ```
   Production URL:
   prasanna-premium-orchard.vercel.app
   
   Preview URL (from your error):
   prasanna-premium-orchard-hbt8wwy03-vikranthsai310s-projects.vercel.app
   
   Git Branch URL:
   prasanna-premium-orchard-git-main-vikranthsai310s-projects.vercel.app
   ```

4. **Already Authorized (Should exist):**
   - ✓ localhost
   - ✓ orinut-494cc.firebaseapp.com
   - ✓ orinut-494cc.web.app

5. **Add Custom Domain (if you have one):**
   - Example: yourdomain.com
   - Example: www.yourdomain.com

6. **Click "Save"**

**Verification:**
After adding domains, refresh your Vercel deployment and try Google Sign-In again.

---

### ✅ **ISSUE 2: Missing Favicon - FIXED**

**Error:**
```
Failed to load resource: the server responded with a status of 404 ()
favicon.ico:1
```

**Fix Applied:**
Added favicon links to `index.html`:
```html
<link rel="icon" type="image/png" href="/Logo.png" />
<link rel="apple-touch-icon" href="/Logo.png" />
```

**Status:** ✅ Fixed in latest commit

---

## 📋 Complete Vercel Environment Variables

Copy these into Vercel Dashboard → Settings → Environment Variables:

### **Firebase (Frontend)**
```env
VITE_FIREBASE_API_KEY=AIzaSyCFGNw-QaL0NeajxgjMcuOxCXzeeHX1nwY
VITE_FIREBASE_AUTH_DOMAIN=orinut-494cc.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=orinut-494cc
VITE_FIREBASE_STORAGE_BUCKET=orinut-494cc.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=369347130599
VITE_FIREBASE_APP_ID=1:369347130599:web:79cd0316f8af76c0a2de42
VITE_FIREBASE_MEASUREMENT_ID=G-MB52LLLTFD
```

### **Razorpay**
```env
VITE_RAZORPAY_KEY_ID=rzp_live_DBSSTbBMD0V8N9
RAZORPAY_KEY_SECRET=PSAZ07MfVPmBeux0JqpX7aEl
```

### **Firebase Admin (Backend) - CRITICAL**
**⚠️ IMPORTANT: Must be single-line JSON (no line breaks)**
```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"orinut-494cc","private_key_id":"7b087e3184e61e8695ff3984afd95b18e28365d9","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7koL++9xRcjak\nB/T/wKETPIMaWqbAXKFK3u4Gxcf5hom1cYD1xLv1U7BJWZRG8MiNUmw5pYiUfzxy\nTcclE1X/szxfr3hLIMm21YYNoqa8Ar/3wmN3NorpP3tgu//1LSEgwasAImCwvtWx\ntgXm86redb7aG5hqgJiLOuEDH3lXhLAySiIoG6FwoWbs4oIjxYuojcq9Y/2Zv7e4\njLwY1w/4BouZl7G9LI3dvhA15jp+j5bXTmddLFxCyHk5Z8tboT5XWbrqgygMHCya\nm8NUEQll75XucUwExBIAUY50+uge6O8ImMvmHvfaTdHRiQjQaSGm+C9HjbUefADD\nOEKdr8bTAgMBAAECggEAAMb9anXVCiO2nW2e7SSoq8nupZaB7kQv1GeI1oGbnxYI\nGZVegUpmv4XXiz5Fo1DW3gK2JeK/ZoSSo56Ji+KMINb9Bsdavpbe9LCvLpihod0W\nLyJ2+xm61AfLmWuy5TZ90QXpp28pju/cj37y753s7hujzoGf2y4sl9Tab9DPo89l\nSlGZMrF7EvggsPZ1lFXaDoZQriR6vOehpAxaGsbjdm1DUoNkzy0sgCf1UDaO528J\njpcJ0grSAH18K6xpDFLDujYrO6cFKs0xupRzGdHe0HS0lrGet5LHNd6GmSzibqk6\nkADVSEWXbGFVW5PSxVn34/CJnTexBGkiaBswUCeM9QKBgQDneM9EY/w/saomEDEP\nrb6JguqgGGlFZIIb/61hB8nXdkDOKhiJeF/DBQ+Utq5vruOO9Dh4t4czHq2u/rtr\nGkDzYk3nprZgWbnJxRkxG6Nv0/j72wii/jGD7fpxADkIxwvGAW8haNNmcLNjkhTe\nfFAP9q6fCDtxdLAuZqcRCuhjdQKBgQDPctPoC1NsjRVzL5UrjJeDdlSib8GEg75l\nKx6Hwo4nGWwPU1J3/xAamHrFL8qGEeTsg2xt3TVRTGx1+5X0T7uYlLYJ5k325I4b\nU6a7cPNDKE+oJV4b8az3pfFySSBrz3GdfNyYQWpDwYk4DMrIRqfKKF+0gJCk+8M5\nOjcrLzIgJwKBgGoROvD83CcXs38zpjeoBwqeOgNYjEynDNPlqj4vQneAEZwnQA0m\nYsNLu2MK/w3gVxg3ovT2LHbpVO8+fQVMB30/i7Fd/G5UT0U9ExkksBTbTlmieeeu\nkWQCFePYFUqHY0a9e34UueJUPG+hDf0Re+KEyGnJbOvFa8IneeDeXbTNAoGAfp72\nHRKcrwtGZnJKuLQt3v4hFqzkD8BiPFofXnowTklEHe6bzcaPy8v6U9Wh5keR1ZM6\nYay92IuvQCx6EQ+Bz9YlbtF2ERbcbm2WvZ5pvTojtNxqHuBa1SYiw8FC2stZ6+jE\ntOJovEarPN0CAVCvJcOS9xfqMenB9XJFLkS2cc0CgYEA5HJFjmfdVfOtqG3Gf5m3\n/+xUBEOXk0lbynUxFfoCWK7gyZR/ipumYXDU3WY8N6y0AObZoPCISN/0fZ2TzfGi\nvD0pcm1lF4GImhFOpMU9jTd5M7w4o33C3fB+kX4bY/fQUzkNlBW6nBGJhUSdQ6KN\n3sImSvW9JyuU4marU0w6T4M=\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@orinut-494cc.iam.gserviceaccount.com","client_id":"115062963768523076318","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40orinut-494cc.iam.gserviceaccount.com","universe_domain":"googleapis.com"}
```

### **Environment**
```env
NODE_ENV=production
VITE_NODE_ENV=production
```

### **Feature Flags**
```env
VITE_SECURITY_ENABLED=true
VITE_CSP_ENABLED=true
VITE_RATE_LIMITING_ENABLED=true
VITE_ANALYTICS_ENABLED=true
VITE_ERROR_REPORTING_ENABLED=true
VITE_PAYMENT_ENABLED=true
VITE_SHIPPING_ENABLED=true
VITE_DEBUG_MODE=false
VITE_API_TIMEOUT=30000
```

### **❌ DO NOT SET**
```env
# Leave empty - Vercel uses relative paths automatically
VITE_API_BASE_URL=
```

---

## 🔄 Deployment Steps

### 1. Push Latest Changes
```bash
git add .
git commit -m "fix: Add favicon and update deployment config"
git push origin main
```

### 2. Verify Vercel Auto-Deploy
- Go to https://vercel.com/dashboard
- Check deployment status
- Wait for build to complete

### 3. Configure Firebase (CRITICAL)
- Add Vercel domains to Firebase Console
- See "Issue 1" section above

### 4. Test Deployment
- Visit your production URL
- Test email/password login
- Test Google Sign-In ✅
- Test product browsing
- Test add to cart
- Test checkout flow
- Test payment (use test mode)

---

## 🧪 Post-Deployment Testing Checklist

### Authentication
- [ ] Email/password sign up
- [ ] Email/password sign in
- [ ] Google Sign-In (after Firebase domain fix)
- [ ] Logout functionality
- [ ] Profile page access

### Product Features
- [ ] Product listing page loads
- [ ] Product images display
- [ ] Product detail page works
- [ ] Search functionality

### Shopping Cart
- [ ] Add items to cart
- [ ] Update quantities
- [ ] Remove items
- [ ] Cart persists on refresh

### Checkout & Payment
- [ ] Checkout page loads
- [ ] Shipping calculator works
- [ ] Razorpay payment gateway opens
- [ ] Payment completes successfully
- [ ] Order saved to Firestore
- [ ] Order confirmation displayed

### Admin Panel (if applicable)
- [ ] Admin login works
- [ ] Dashboard loads
- [ ] Order management works
- [ ] Analytics display correctly

---

## 🔒 Security Verification

### Check These After Deployment:

1. **No Secrets Exposed:**
   - View page source - no secrets visible ✓
   - Check browser console - no API keys logged ✓
   - Check network tab - authorization headers present ✓

2. **HTTPS Enabled:**
   - URL starts with https:// ✓
   - Green padlock in browser ✓

3. **Security Headers Present:**
   ```bash
   # Check security headers
   curl -I https://prasanna-premium-orchard.vercel.app
   ```
   Should see:
   - Strict-Transport-Security
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection
   - Referrer-Policy

4. **CSP Working:**
   - No CSP violations in console (after fixing Firebase domain)
   - External resources load correctly

---

## 🐛 Common Issues & Solutions

### Issue: "Firebase: Error (auth/unauthorized-domain)"
**Solution:** Add Vercel domain to Firebase Console (see Issue 1 above)

### Issue: API calls failing with 401
**Solution:** Check FIREBASE_SERVICE_ACCOUNT_KEY is set correctly in Vercel

### Issue: Payment not working
**Solution:** 
- Verify RAZORPAY_KEY_SECRET is set in Vercel
- Check Razorpay dashboard for test/live mode
- Ensure VITE_RAZORPAY_KEY_ID matches the secret

### Issue: Images not loading
**Solution:** Check Firestore Storage rules and bucket configuration

### Issue: Environment variables not updating
**Solution:** 
- Re-deploy after setting env vars
- Clear Vercel cache: Settings → Clear Build Cache

---

## 📞 Support & Resources

- **Firebase Console:** https://console.firebase.google.com/project/orinut-494cc
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Razorpay Dashboard:** https://dashboard.razorpay.com/
- **GitHub Repo:** https://github.com/vikranthsai310/prasanna-premium-orchard

---

## ✅ Final Verification

Once Firebase domain is added:

1. ✅ Site loads without errors
2. ✅ Google Sign-In works
3. ✅ Email login works
4. ✅ Products display
5. ✅ Cart functions
6. ✅ Checkout works
7. ✅ Payments process
8. ✅ Orders save
9. ✅ No console errors
10. ✅ No security warnings

---

**Status:** 🟡 Awaiting Firebase Domain Configuration  
**Next Step:** Add Vercel domains to Firebase Console  
**ETA:** 5 minutes after domain configuration

---

Made with ❤️ for Prasanna Premium Orchard
