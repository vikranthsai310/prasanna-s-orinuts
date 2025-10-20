# Netlify Deployment Guide - Complete Setup

## ✅ Project is Now Ready for Netlify!

All necessary configuration files have been created:
1. ✅ `netlify.toml` - Main Netlify configuration
2. ✅ `public/_redirects` - SPA routing rules
3. ✅ Build configuration optimized
4. ✅ Headers and caching configured

---

## 🚀 Deploy to Netlify (3 Methods)

### Method 1: Deploy via Netlify Dashboard (EASIEST - RECOMMENDED)

#### Step 1: Login to Netlify
1. Go to https://app.netlify.com/
2. Sign up or log in (can use GitHub account)

#### Step 2: New Site from Git
1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Authorize Netlify to access your GitHub
4. Select repository: **`vikranthsai310/prasanna-premium-orchard`**

#### Step 3: Configure Build Settings
Netlify will auto-detect settings from `netlify.toml`, but verify:

```
Build command: npm run build
Publish directory: dist
```

#### Step 4: Add Environment Variables
Click **"Show advanced"** → **"New variable"**

Add these variables:
```
VITE_FIREBASE_API_KEY=AIzaSyCFGNw-QaL0NeajxgjMcuOxCXzeeHX1nwY
VITE_FIREBASE_AUTH_DOMAIN=orinut-494cc.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=orinut-494cc
VITE_FIREBASE_STORAGE_BUCKET=orinut-494cc.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=369347130599
VITE_FIREBASE_APP_ID=1:369347130599:web:79cd0316f8af76c0a2de42
VITE_FIREBASE_MEASUREMENT_ID=G-MB52LLLTFD
VITE_RAZORPAY_KEY_ID=rzp_live_DBSSTbBMD0V8N9
```

⚠️ **IMPORTANT**: All must start with `VITE_` prefix for Vite to include them.

#### Step 5: Deploy
1. Click **"Deploy site"**
2. Wait 3-5 minutes for build and deployment
3. Your site will be live at: `https://[random-name].netlify.app`

#### Step 6: Custom Domain (Optional)
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow instructions to add your domain

---

### Method 2: Deploy via Netlify CLI

#### Step 1: Install Netlify CLI
```powershell
npm install -g netlify-cli
```

#### Step 2: Login
```powershell
netlify login
```
This opens a browser for authentication.

#### Step 3: Initialize Netlify
```powershell
# Run from project root
netlify init
```

Follow the prompts:
- **Create & configure a new site**: Yes
- **Team**: Choose your team
- **Site name**: Enter custom name or press Enter for random
- **Build command**: `npm run build`
- **Publish directory**: `dist`

#### Step 4: Deploy
```powershell
# Deploy to production
netlify deploy --prod
```

Or build locally first:
```powershell
# Build locally
npm run build

# Deploy the dist folder
netlify deploy --prod --dir=dist
```

---

### Method 3: Drag and Drop (Manual - No CI/CD)

#### Step 1: Build Locally
```powershell
npm run build
```

This creates the `dist` folder.

#### Step 2: Deploy via Netlify Drop
1. Go to https://app.netlify.com/drop
2. Drag the `dist` folder onto the page
3. Wait for upload
4. Site is live!

⚠️ **Note**: This method doesn't auto-deploy on git push.

---

## 📝 Environment Variables Setup

### Option A: Via Dashboard (After deploying)
1. Go to your site in Netlify Dashboard
2. **Site settings** → **Environment variables**
3. Click **"Add a variable"** for each:

```
Key: VITE_FIREBASE_API_KEY
Value: AIzaSyCFGNw-QaL0NeajxgjMcuOxCXzeeHX1nwY

Key: VITE_FIREBASE_AUTH_DOMAIN
Value: orinut-494cc.firebaseapp.com

Key: VITE_FIREBASE_PROJECT_ID
Value: orinut-494cc

Key: VITE_FIREBASE_STORAGE_BUCKET
Value: orinut-494cc.firebasestorage.app

Key: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 369347130599

Key: VITE_FIREBASE_APP_ID
Value: 1:369347130599:web:79cd0316f8af76c0a2de42

Key: VITE_FIREBASE_MEASUREMENT_ID
Value: G-MB52LLLTFD

Key: VITE_RAZORPAY_KEY_ID
Value: rzp_live_DBSSTbBMD0V8N9
```

### Option B: Via CLI
```powershell
netlify env:set VITE_FIREBASE_API_KEY "AIzaSyCFGNw-QaL0NeajxgjMcuOxCXzeeHX1nwY"
netlify env:set VITE_FIREBASE_AUTH_DOMAIN "orinut-494cc.firebaseapp.com"
netlify env:set VITE_FIREBASE_PROJECT_ID "orinut-494cc"
netlify env:set VITE_FIREBASE_STORAGE_BUCKET "orinut-494cc.firebasestorage.app"
netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "369347130599"
netlify env:set VITE_FIREBASE_APP_ID "1:369347130599:web:79cd0316f8af76c0a2de42"
netlify env:set VITE_FIREBASE_MEASUREMENT_ID "G-MB52LLLTFD"
netlify env:set VITE_RAZORPAY_KEY_ID "rzp_live_DBSSTbBMD0V8N9"
```

After setting env vars, trigger a redeploy:
```powershell
netlify deploy --prod
```

---

## 🔄 Continuous Deployment

Once you connect GitHub to Netlify:
- ✅ Every push to `main` branch auto-deploys
- ✅ Pull requests get preview deployments
- ✅ Build logs available in dashboard
- ✅ Instant rollback if needed

---

## 🎯 What's Configured

### Build Settings (netlify.toml)
- ✅ Build command: `npm run build`
- ✅ Publish directory: `dist`
- ✅ Node version: 18
- ✅ NPM version: 10

### Security Headers
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: enabled
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy: restricted

### Caching Strategy
- ✅ Static assets: 1 year cache
- ✅ HTML files: no cache (for SPA routing)
- ✅ Immutable assets in `/assets/*`

### SPA Routing (_redirects)
- ✅ All routes redirect to index.html
- ✅ React Router will handle client-side routing
- ✅ Direct URL access works (e.g., `/products`, `/cart`)

---

## 📊 Verify Deployment

After deployment, test these:

### 1. Homepage
Visit: `https://your-site.netlify.app/`
- ✅ Should load homepage

### 2. Direct Route Access
Visit: `https://your-site.netlify.app/products`
- ✅ Should load products page (not 404)

### 3. Product Detail
Visit: `https://your-site.netlify.app/products/some-id`
- ✅ Should load product detail

### 4. Mobile Add to Cart
Test on mobile:
- ✅ Product cards show "Add to Cart" button
- ✅ Home page "Quick Add" buttons visible (if you re-applied that fix)

### 5. Assets Loading
- ✅ Images load correctly
- ✅ CSS styles applied
- ✅ Fonts render properly

---

## 🔧 Troubleshooting

### Issue: "Page not found" on direct URL access
**Fix**: Check that `_redirects` file is in `public` folder and contains:
```
/* /index.html 200
```

### Issue: Environment variables not working
**Fix**: 
1. Ensure they start with `VITE_` prefix
2. Redeploy after adding env vars
3. Check Netlify dashboard → Site settings → Environment variables

### Issue: Build fails
**Fix**:
```powershell
# Test build locally first
npm run build

# If it works locally, check Netlify build logs
# Usually it's missing env vars
```

### Issue: Assets not loading (404)
**Fix**: Verify `netlify.toml` has:
```toml
publish = "dist"
```

### Issue: Slow build times
**Fix**: Enable build cache in Netlify dashboard:
1. Site settings → Build & deploy → Build settings
2. Enable "Cache node_modules"

---

## 💡 Netlify Features You Get

### Free Tier Includes:
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Continuous deployment
- ✅ Deploy previews for PRs
- ✅ Instant rollbacks
- ✅ Form handling
- ✅ Serverless functions (if needed)

### Deploy Previews
Every pull request gets a unique URL like:
`https://deploy-preview-123--your-site.netlify.app`

### Branch Deploys
Deploy from any branch:
`https://branch-name--your-site.netlify.app`

---

## 📱 Testing Checklist

After deployment, test:

- [ ] Homepage loads
- [ ] Navigation works
- [ ] Product listing loads
- [ ] Product details load
- [ ] Add to cart works
- [ ] Cart page works
- [ ] Checkout flow works
- [ ] Authentication works (Firebase)
- [ ] Images load
- [ ] Mobile view works
- [ ] Desktop view works
- [ ] Direct URL access works (refresh on /products)
- [ ] 404 page shows for invalid routes

---

## 🚀 Quick Deploy Commands

**Using Git + Auto-deploy:**
```powershell
git add .
git commit -m "feat: configure for Netlify deployment"
git push origin main
```
Netlify auto-deploys in 3-5 minutes.

**Using Netlify CLI:**
```powershell
npm run build
netlify deploy --prod
```

**Check deployment status:**
```powershell
netlify status
netlify open
```

---

## 🔗 Useful Links

- **Netlify Dashboard**: https://app.netlify.com/
- **Netlify Status**: https://www.netlifystatus.com/
- **Netlify Docs**: https://docs.netlify.com/
- **Netlify Community**: https://answers.netlify.com/

---

## 🎉 Next Steps

1. **Now**: Push code to GitHub
2. **Then**: Connect GitHub to Netlify
3. **Set**: Environment variables in Netlify dashboard
4. **Deploy**: Automatically deploys on push
5. **Test**: Visit your Netlify URL
6. **Optional**: Add custom domain

---

## 📝 Files Created/Modified

1. ✅ **netlify.toml** - Main configuration file
2. ✅ **public/_redirects** - Updated SPA routing rules

That's it! Your project is now **100% ready for Netlify deployment**! 🎊

Choose your preferred deployment method above and follow the steps.
