const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Firebase Admin
admin.initializeApp();

// Set environment configuration for local development
// In production, set these using: firebase functions:config:set razorpay.key_id="YOUR_KEY_ID" razorpay.key_secret="YOUR_KEY_SECRET"
const runtimeConfig = {
  razorpay: {
    key_id: 'rzp_live_DBSSTbBMD0V8N9',
    key_secret: 'PSAZ07MfVPmBeux0JqpX7aEl'
  }
};

// Get config, preferring environment variables in production
const getRazorpayConfig = () => {
  try {
    return functions.config().razorpay || runtimeConfig.razorpay;
  } catch (error) {
    console.log('Using fallback configuration');
    return runtimeConfig.razorpay;
  }
};

// Create Razorpay order
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  // Verify authentication if needed
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  // }

  try {
    const { amount, currency, receipt, notes } = data;

    // Validate the data
    if (!amount || amount <= 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid amount');
    }

    // Initialize Razorpay with key_id and key_secret
    const config = getRazorpayConfig();
    const razorpay = new Razorpay({
      key_id: config.key_id,
      key_secret: config.key_secret
    });

    // Create order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in paise (smallest currency unit)
      currency: currency || 'INR',
      receipt: receipt,
      notes: notes || {},
      payment_capture: 1 // Auto-capture payment
    });

    return { 
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Verify Razorpay payment
exports.verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  try {
    const { orderId, paymentId, signature } = data;

    // Validate the data
    if (!orderId || !paymentId || !signature) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required payment verification parameters');
    }

    // Get the Razorpay secret key
    const config = getRazorpayConfig();
    
    // Create a signature using the orderId and paymentId
    const expectedSignature = crypto
      .createHmac('sha256', config.key_secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');
    
    // Compare the generated signature with the one received from Razorpay
    const isSignatureValid = expectedSignature === signature;

    if (isSignatureValid) {
      // Update the order status in Firestore if needed
      const db = admin.firestore();
      const orderRef = db.collection('orders').doc(receipt || orderId);
      
      await orderRef.update({
        paymentStatus: 'paid',
        paymentId: paymentId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return { 
      isValid: isSignatureValid 
    };
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
}); 