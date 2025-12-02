# 📧 Email Notification Setup Guide

This guide explains how to set up email notifications for order confirmations in Prasanna Premium Orchard.

## Overview

When a customer completes a payment, they will automatically receive an order confirmation email with:
- Order details (order ID, date, payment ID)
- List of items ordered with prices
- Shipping address
- Total amount
- Tracking button (once order is shipped)

## Email Service Options

You can use either **Resend** (recommended) or **Gmail SMTP** for sending emails.

---

## Option 1: Resend (Recommended) 🚀

[Resend](https://resend.com) is a modern email API that's easy to set up and has a generous free tier.

### Steps:

1. **Create a Resend Account**
   - Go to [resend.com](https://resend.com) and sign up
   - Verify your email address

2. **Get Your API Key**
   - Go to [API Keys](https://resend.com/api-keys) in the dashboard
   - Click "Create API Key"
   - Copy the API key (starts with `re_`)

3. **Add Domain (Optional but Recommended)**
   - Go to [Domains](https://resend.com/domains) in the dashboard
   - Add your domain (e.g., `prasannaorchards.com`)
   - Add the DNS records to verify ownership
   - This allows sending from your own email address

4. **Set Environment Variables in Vercel**
   - Go to your Vercel project settings
   - Navigate to Environment Variables
   - Add the following:

   ```
   RESEND_API_KEY=re_your_api_key_here
   FROM_EMAIL=orders@yourdomain.com
   ```

   > If you don't verify a domain, use `onboarding@resend.dev` as FROM_EMAIL for testing

---

## Option 2: Gmail SMTP 📬

Use Gmail's SMTP server to send emails. This is free but requires creating an App Password.

### Steps:

1. **Enable 2-Step Verification**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification"

2. **Create an App Password**
   - After enabling 2-Step Verification, go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "Prasanna Orchard Emails" as the name
   - Click "Generate"
   - Copy the 16-character password (no spaces)

3. **Set Environment Variables in Vercel**
   - Go to your Vercel project settings
   - Navigate to Environment Variables
   - Add the following:

   ```
   GMAIL_USER=your-gmail@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   ```

---

## Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key | `re_abc123...` |
| `FROM_EMAIL` | Sender email address | `orders@prasannaorchards.com` |
| `GMAIL_USER` | Gmail address (fallback) | `prasannasorinuts@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail App Password | `abcd efgh ijkl mnop` |
| `SEND_ADMIN_COPY` | Send copy to admin | `true` |
| `BASE_URL` | Your website URL | `https://prasannaorchards.com` |

---

## Setting Up in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable for Production, Preview, and Development environments
5. Redeploy your application

### Example Configuration:

```bash
# Resend (Primary)
RESEND_API_KEY=re_123456789abcdef

# OR Gmail (Fallback)
GMAIL_USER=prasannasorinuts@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop

# Optional
FROM_EMAIL=orders@prasannaorchards.com
SEND_ADMIN_COPY=true
BASE_URL=https://prasannaorchards.com
```

---

## Testing Emails

### Local Testing

1. Create a `.env.local` file (never commit this!):
   ```
   RESEND_API_KEY=your_key
   FROM_EMAIL=onboarding@resend.dev
   ```

2. Start your development server
3. Complete a test checkout
4. Check your email inbox

### Production Testing

1. Deploy to Vercel
2. Place a test order with a small amount
3. Complete the payment
4. Verify the email is received

---

## Email Template

The order confirmation email includes:

✅ Professional branded header  
✅ Order confirmation with green checkmark  
✅ Complete order details  
✅ Itemized product list with images  
✅ Shipping address  
✅ "Track Your Order" button  
✅ Estimated delivery information  
✅ Contact information  

---

## Troubleshooting

### Email not sending?

1. **Check Vercel logs** for error messages
2. **Verify environment variables** are set correctly
3. **Test API keys** are valid and not expired

### Email going to spam?

1. **Verify your domain** in Resend for better deliverability
2. **Add SPF/DKIM records** as suggested by Resend
3. Ask customers to **add your email to contacts**

### Gmail App Password not working?

1. Ensure **2-Step Verification** is enabled
2. Make sure you're using the **App Password**, not your regular password
3. Remove spaces from the App Password

---

## API Endpoint

The email sending endpoint is available at:

```
POST /api/send-order-email
```

**Request Body:**
```json
{
  "orderId": "abc123",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "items": [...],
  "totalAmount": 1500,
  "shippingAddress": {...},
  "paymentId": "pay_123",
  "shippingCharges": 0
}
```

---

## Support

For any issues with email setup, contact:
- Email: prasannasorinuts@gmail.com
- Or create an issue in the repository

---

## ✅ Checklist

Before going live, ensure:

- [ ] Email service (Resend or Gmail) is configured
- [ ] Environment variables are set in Vercel
- [ ] Domain is verified (for Resend)
- [ ] Test email sent successfully
- [ ] Admin copy enabled (optional)
- [ ] Application is redeployed after adding env variables
