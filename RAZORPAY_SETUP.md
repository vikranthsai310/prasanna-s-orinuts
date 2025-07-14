# Razorpay Integration Guide

This guide explains how to set up and use Razorpay as a payment gateway for your Premium Orchard e-commerce website.

## Prerequisites

1. A Razorpay account - Sign up at [https://razorpay.com](https://razorpay.com)
2. API Keys (Key ID and Secret Key) from your Razorpay Dashboard

## Setup Instructions

### 1. Update the Razorpay API Keys

Open `src/services/paymentService.ts` and replace the placeholder API key with your actual Razorpay Key ID:

```typescript
// Replace with your actual Razorpay key ID
const RAZORPAY_KEY_ID = 'rzp_test_YOUR_KEY_ID';
```

For testing, use the test mode keys provided by Razorpay. For production, use the live mode keys.

### 2. Set Up Backend Integration

For a complete integration, you'll need to set up server-side code to create orders and verify payments. This implementation currently uses a simulated backend, but for production, you should implement Firebase Cloud Functions:

1. Create a new Firebase Cloud Function project if you don't have one
2. Install the Razorpay Node.js SDK in your Cloud Functions project:
   ```bash
   npm install razorpay
   ```
3. Create the following Cloud Functions:

#### Create Order Function

```javascript
const functions = require('firebase-functions');
const Razorpay = require('razorpay');

exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  // Initialize Razorpay with your key_id and key_secret
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  
  try {
    // Create an order
    const order = await razorpay.orders.create({
      amount: data.amount * 100, // amount in paise
      currency: data.currency || 'INR',
      receipt: data.receipt,
      notes: data.notes || {}
    });
    
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new functions.https.HttpsError('internal', 'Error creating order', error);
  }
});
```

#### Verify Payment Function

```javascript
const crypto = require('crypto');

exports.verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  const { orderId, paymentId, signature } = data;
  
  // Generate a signature using the key_secret
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  
  // Compare the generated signature with the one received from Razorpay
  const isValid = expectedSignature === signature;
  
  return isValid;
});
```

4. Deploy your Cloud Functions:
   ```bash
   firebase deploy --only functions
   ```

5. Update `src/services/razorpayService.ts` to use the actual Cloud Functions instead of the simulated ones.

### 3. Testing the Integration

1. Use Razorpay's test mode and test cards for development:
   - Test Card Number: 4111 1111 1111 1111
   - Expiry: Any future date
   - CVV: Any 3 digits
   - OTP: 1234

2. Go through the checkout process on your website
3. Verify that orders are created correctly in both your Firebase database and Razorpay dashboard
4. Verify that payments are processed and recorded correctly

### 4. Going Live

1. Update the Razorpay API keys to production keys
2. Thoroughly test the entire payment flow
3. Monitor the first few transactions to ensure everything works correctly

## Troubleshooting

- **Payment fails to initialize**: Check if the Razorpay script is loading correctly
- **Order creation fails**: Verify your API keys and ensure the order parameters are correct
- **Payment verification fails**: Check the signature generation logic and ensure the key_secret is correct
- **Webhook events not received**: Verify webhook URL and settings in the Razorpay dashboard

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Razorpay Testing Guide](https://razorpay.com/docs/payments/payments/test-card-details/)

## Support

For any issues with Razorpay integration, contact:
- Razorpay Support: [https://razorpay.com/support/](https://razorpay.com/support/)
- Your development team 