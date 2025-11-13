# 🚨 URGENT: Firebase Admin Configuration Issue

## ❌ **Current Error**

```
Firebase Admin is not configured. Check server logs.
```

## 🎯 **Root Cause**

The Vercel serverless function (`api/create-order.js`) cannot initialize Firebase Admin SDK because:
- Missing `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable on Vercel
- Invalid JSON in the environment variable
- Incorrect project ID in the service account key

## ✅ **IMMEDIATE FIX**

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **prasanna-premium-orchard**
3. Click ⚙️ (Settings) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file (e.g., `serviceAccountKey.json`)

### Step 2: Prepare the Key for Vercel

The JSON needs to be **minified** (single line, no spaces):

**Option A: Using Command Line (Recommended)**
```bash
# If you have jq installed
cat serviceAccountKey.json | jq -c

# Or manually copy and minify at: https://codebeautify.org/jsonminifier
```

**Option B: Manual**
Copy the content and remove all newlines and extra spaces. Should look like:
```json
{"type":"service_account","project_id":"prasanna-premium-orchard","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...=\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@prasanna-premium-orchard.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40prasanna-premium-orchard.iam.gserviceaccount.com"}
```

### Step 3: Add to Vercel

#### Using Vercel Dashboard (Easiest):

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **prasanna-premium-orchard**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Set:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value**: Paste the minified JSON (from Step 2)
   - **Environment**: Select **Production**, **Preview**, and **Development**
6. Click **Save**

#### Using Vercel CLI:

```bash
# Navigate to project
cd "d:\Desktop\folder prassanas\prasanna-premium-orchard"

# Add environment variable
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY production

# When prompted, paste the minified JSON and press Enter
```

### Step 4: Verify Other Environment Variables

While in Vercel Environment Variables, verify these also exist:

1. **RAZORPAY_KEY_ID**
   - Example: `rzp_live_xxxxxxxxxxxxx` or `rzp_test_xxxxxxxxxxxxx`
   
2. **RAZORPAY_KEY_SECRET**
   - Example: `xxxxxxxxxxxxxxxxxxxxxxxx`

### Step 5: Redeploy

After adding environment variables, you MUST redeploy:

```bash
# Deploy to production
vercel --prod

# Or trigger redeploy from Vercel Dashboard
# Project → Deployments → Click "..." on latest → Redeploy
```

## 🔍 **Verify the Fix**

### After Redeployment:

1. **Check Vercel Function Logs:**
   ```bash
   vercel logs --follow
   ```

2. **Try Checkout Again:**
   - Log in to your site
   - Add items to cart
   - Go to checkout
   - Try to place order

3. **Expected Console Output:**
   ```
   ✅ Authentication token obtained successfully
   💰 Creating Razorpay order...
   🌐 Making authenticated request to: /api/create-order
   📥 Response received: { status: 200, statusText: "OK" }
   ✅ Razorpay order created
   ```

### If Still Failing:

Check Vercel logs for these messages:

**❌ Bad:**
```
❌ Firebase Admin: FIREBASE_SERVICE_ACCOUNT_KEY not configured
❌ Firebase Admin: Failed to parse service account credentials
```

**✅ Good:**
```
✅ Firebase Admin initialized
✅ Token verification successful
```

## 📋 **Common Issues**

### Issue 1: "Failed to parse service account credentials"

**Cause**: Invalid JSON format

**Solution**:
1. Verify JSON is valid: https://jsonlint.com/
2. Ensure no extra quotes or escaping
3. Make sure `\n` in private key is preserved as `\n` (not actual newlines)

### Issue 2: "Project ID mismatch"

**Cause**: Service account is from different Firebase project

**Solution**:
1. Verify `project_id` in service account JSON matches your Firebase project
2. Download fresh service account key from correct project

### Issue 3: Environment variable not applying

**Cause**: Vercel caches environment variables

**Solution**:
1. After adding env var, do a **fresh deployment** (not just redeploy)
2. Or delete and re-add the environment variable

## 🚀 **Quick Command Reference**

```bash
# Check if environment variable is set locally
echo $env:FIREBASE_SERVICE_ACCOUNT_KEY

# Deploy to Vercel
vercel --prod

# View logs
vercel logs --follow

# View environment variables (from Vercel CLI)
vercel env ls

# Pull environment variables to local
vercel env pull
```

## ✅ **Checklist**

- [ ] Downloaded service account key from Firebase Console
- [ ] Minified JSON to single line
- [ ] Added `FIREBASE_SERVICE_ACCOUNT_KEY` to Vercel
- [ ] Added to Production, Preview, and Development
- [ ] Verified `RAZORPAY_KEY_ID` exists
- [ ] Verified `RAZORPAY_KEY_SECRET` exists
- [ ] Triggered new deployment
- [ ] Waited for deployment to complete
- [ ] Tested checkout flow
- [ ] Checked Vercel logs for errors

## 🎯 **Expected Timeline**

- **Adding env variable**: 2 minutes
- **Redeployment**: 2-3 minutes
- **Testing**: 1 minute
- **Total**: ~5-7 minutes

## 📞 **Need Help?**

If still not working after following these steps:

1. **Screenshot Vercel Environment Variables page** (hide the actual values)
2. **Copy Vercel function logs** during a failed checkout attempt
3. **Check Firebase Console** → Service Accounts → Verify account exists
4. **Verify project ID** matches between:
   - Firebase Console (Project Settings)
   - Service Account JSON (`project_id` field)
   - Frontend `.env` file (`VITE_FIREBASE_PROJECT_ID`)

---

**Status**: 🔴 Server Configuration Issue  
**Priority**: 🚨 HIGH - Blocking all checkout functionality  
**ETA to Fix**: 5-7 minutes (once env variables are added)
