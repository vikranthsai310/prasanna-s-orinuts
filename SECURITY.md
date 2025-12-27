# 🔐 Security Guide for Prasanna Premium Orchard

This document outlines the security measures implemented in the project.

## ✅ Security Features Implemented

### 1. Authentication & Authorization
- **Firebase Auth** - Phone number (OTP) authentication
- **Token Verification** - All API endpoints verify Firebase ID tokens
- **Admin Role Check** - Dynamic admin check via Firestore document
- **Ownership Verification** - Users can only access their own data

### 2. Firestore Security Rules (`firestore.rules`)
- Users can only read/write their own data
- Products are publicly readable, admin-only writable
- Orders are owner/admin accessible
- Analytics and settings are admin-only

### 3. Firebase Storage Rules (`storage.rules`)
- File type validation (images only)
- File size limits (max 5MB)
- User-level access control

### 4. Input Validation & XSS Protection
- **DOMPurify** sanitizes all HTML input
- Email, phone, pincode validation
- Order data validation
- Address sanitization

### 5. Rate Limiting (`api/_middleware/rateLimit.js`)
| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Payment APIs | 10 requests | 1 minute |
| Email APIs | 5 requests | 1 minute |
| Standard APIs | 60 requests | 1 minute |
| Auth APIs | 10 requests | 5 minutes |

### 6. Security Headers (`api/_middleware/securityHeaders.js`)
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (HTTPS enforcement)
- `Content-Security-Policy` (CSP)

### 7. CORS Protection (`api/_middleware/cors.js`)
- Whitelist of allowed origins
- Credentials handling
- Preflight caching

### 8. Payment Security
- Razorpay signature verification (HMAC-SHA256)
- Server-side secret key (never exposed to frontend)

---

## 🚀 Best Practices

### Environment Variables
```bash
# ✅ NEVER commit .env to Git
# ✅ Use different keys for dev/staging/production
# ✅ Rotate keys periodically
# ✅ Use Vercel/Netlify for production secrets
```

### API Keys
```bash
# ❌ Don't do this:
const API_KEY = 'sk-xxxxx';  // Hardcoded!

# ✅ Do this:
const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error('API key not configured');
```

---

## 🔧 Security Checklist for Production

- [x] `.env` in `.gitignore`
- [x] No hardcoded API keys
- [x] Rate limiting on critical endpoints
- [x] Security headers configured
- [x] Input sanitization implemented
- [x] Firestore security rules deployed
- [x] Storage security rules deployed
- [ ] Enable HTTPS (via Vercel/Netlify)
- [ ] Set up monitoring/alerting
- [ ] Regular security audits

---

## 🚨 Reporting Security Issues

If you discover a security vulnerability, please email: prasannasorinuts@gmail.com

---

## 📚 Resources

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)
- [Razorpay Security](https://razorpay.com/docs/payments/server-integration/nodejs/signature-verification/)
