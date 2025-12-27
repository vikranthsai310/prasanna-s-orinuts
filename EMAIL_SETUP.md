# 📧 Email Notification Setup Guide

This guide explains how to set up email notifications for **Prasanna Premium Orchard**.

## 🎯 Features

### Customer Emails (Automatic)
- ✅ **Order Confirmed** - When payment is successful
- ✅ **Order Shipped** - When order status changes to shipped (includes tracking info)
- ✅ **Order Delivered** - When order is delivered

### Admin Emails (Automatic)
- ✅ **🚨 New Order - Pack Now!** - You receive an email when a new order comes in
- ✅ **Admin Copy** - Option to receive a copy of all customer emails

---

## 📬 How Emails Are Triggered

| Event | Customer Email | Admin Email |
|-------|----------------|-------------|
| Payment Successful | ✅ Order Confirmed | ✅ New Order - Pack Now! |
| Status → Shipped | ✅ Order Shipped (with tracking) | Optional copy |
| Status → Delivered | ✅ Order Delivered | Optional copy |
| Shiprocket Status Update | ✅ Auto-updates | Via webhook |

---

## 🚀 Quick Setup (5 minutes)

### Option 1: Resend (Recommended)

**Why Resend?** Modern, reliable, 100 free emails/day, easy setup.

1. **Create Account**: Go to [resend.com](https://resend.com) and sign up
2. **Get API Key**: Dashboard → [API Keys](https://resend.com/api-keys) → Create API Key
3. **Add to Vercel/Netlify**:

```bash
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
ADMIN_EMAIL=prasannasorinuts@gmail.com
SEND_ADMIN_COPY=true
```

> **Note**: Use `onboarding@resend.dev` for testing. For production, [verify your domain](https://resend.com/domains).

---

### Option 2: Gmail SMTP (Free backup)

1. **Enable 2-Step Verification**: [Google Security](https://myaccount.google.com/security)
2. **Create App Password**: [App Passwords](https://myaccount.google.com/apppasswords)
3. **Add to Environment**:

```bash
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
ADMIN_EMAIL=prasannasorinuts@gmail.com
```

---

## ⚙️ All Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `RESEND_API_KEY` | Resend API key | Yes* | `re_abc123...` |
| `FROM_EMAIL` | Sender email | No | `orders@prasannaorchards.com` |
| `GMAIL_USER` | Gmail (fallback) | No | `prasannasorinuts@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail App Password | No | `abcdefghijklmnop` |
| `ADMIN_EMAIL` | Your email for notifications | Yes | `prasannasorinuts@gmail.com` |
| `SEND_ADMIN_COPY` | Copy all emails to admin | No | `true` |
| `BASE_URL` | Your website URL | No | `https://prasannaorchards.com` |

*Either Resend OR Gmail is required

---

## 🔧 Setting Up in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Environment Variables**
3. Add each variable for Production, Preview, and Development
4. **Redeploy** your application

### Recommended Production Config:

```bash
# Email Service (use ONE of these)
RESEND_API_KEY=re_your_actual_key

# Admin Settings
ADMIN_EMAIL=prasannasorinuts@gmail.com
SEND_ADMIN_COPY=true

# URLs
BASE_URL=https://prasannaorchards.com
FROM_EMAIL=orders@prasannaorchards.com
```

---

## 🔧 Setting Up in Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site → **Site Settings** → **Environment Variables**
3. Add the variables
4. **Trigger redeploy**

---

## 📧 Email Types & Templates

### 1. Order Confirmed ✅
Sent to customer when payment is successful.
- Green checkmark icon
- Order details, items, total
- Shipping address
- "Track Your Order" button

### 2. New Order - Pack Now! 📦 (Admin)
Sent to YOU when a new order arrives.
- Brown/Orange urgent styling
- Customer name & address
- Items to pack
- Total amount

### 3. Order Shipped 🚚
Sent when you mark order as "Shipped".
- Blue truck icon
- Tracking ID prominently displayed
- Courier name
- Expected delivery date

### 4. Order Delivered 🎉
Sent when order is delivered.
- Green celebration icon
- "Share Feedback" button
- Thank you message

---

## 🔄 How Shiprocket Webhook Works

When you use Shiprocket for shipping, status updates are **automatic**:

1. Shiprocket updates shipment status
2. Webhook receives update at `/api/shiprocket-webhook`
3. Order status is updated in Firebase
4. Customer email is sent automatically

**Shiprocket Status → Email Mapping:**
- `SHIPPED` → Shipped email ✉️
- `DELIVERED` → Delivered email ✉️
- `CANCELLED/RTO` → Cancelled email ✉️

---

## 🧪 Testing Emails

### Local Testing

1. Create `.env.local`:
```bash
RESEND_API_KEY=re_your_test_key
FROM_EMAIL=onboarding@resend.dev
ADMIN_EMAIL=your-email@gmail.com
```

2. Start dev server: `npm run dev`
3. Place a test order
4. Check your inbox!

### Testing Specific Emails

You can test emails via API:

```bash
curl -X POST https://your-site.com/api/send-order-email \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST123",
    "customerName": "Test User",
    "customerEmail": "your-email@gmail.com",
    "items": [{"name": "Almonds", "price": 500, "quantity": 1}],
    "totalAmount": 500,
    "shippingAddress": {
      "name": "Test User",
      "street": "123 Test St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "phone": "9876543210"
    },
    "emailType": "confirmed"
  }'
```

**Email Types**: `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `admin_new_order`

---

## ❓ Troubleshooting

### Email not sending?

1. **Check Vercel/Netlify logs** for error messages
2. **Verify environment variables** are set correctly
3. **Test API keys** are valid and not expired
4. Check if `customerEmail` exists in shipping address

### Email going to spam?

1. **Verify your domain** in Resend for better deliverability
2. **Add SPF/DKIM records** as suggested by Resend
3. Ask customers to add your email to contacts

### Gmail App Password not working?

1. Ensure **2-Step Verification** is enabled
2. Use **App Password**, not regular password
3. Remove spaces from the App Password

### Shiprocket emails not sending?

1. Check webhook is configured in Shiprocket dashboard
2. Verify webhook URL: `https://your-site.com/api/shiprocket-webhook`
3. Check Vercel function logs

---

## ✅ Setup Checklist

Before going live:

- [ ] Email service configured (Resend or Gmail)
- [ ] `ADMIN_EMAIL` set to your email
- [ ] Environment variables added in Vercel/Netlify
- [ ] Domain verified in Resend (for production)
- [ ] Test email sent successfully
- [ ] Shiprocket webhook configured (if using)
- [ ] Application redeployed after adding env variables

---

## 📞 Support

For issues with email setup:
- Email: prasannasorinuts@gmail.com
- Check Vercel Function logs for errors
- Create an issue in the repository
