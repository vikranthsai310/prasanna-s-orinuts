// Vercel Serverless Function for verifying Razorpay payments
import crypto from 'crypto';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (bypasses security rules)
let app;
try {
  // Try to get existing app instance
  app = getFirestore().app;
} catch (error) {
  // Initialize new app if it doesn't exist
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || "orinut-494cc"
    });
  } else {
    // Fallback for development
    app = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "orinut-494cc"
    });
  }
}

const db = getFirestore(app);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, paymentId, signature } = req.body;

    // Validate the data
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Missing required payment verification parameters' });
    }

    // Get the Razorpay secret key
    const secret = process.env.RAZORPAY_KEY_SECRET || 'PSAZ07MfVPmBeux0JqpX7aEl';
    
    // Create a signature using the orderId and paymentId
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');
    
    // Compare the generated signature with the one received from Razorpay
    const isSignatureValid = expectedSignature === signature;

    if (isSignatureValid) {
      try {
        // Find the order by using the receipt field if provided, otherwise skip DB update
        const receiptId = req.body.receipt;
        if (receiptId) {
          // Use the receipt (which should be the Firebase order ID) to update the order
          const orderRef = db.collection('orders').doc(receiptId);
          await orderRef.update({
            paymentStatus: 'paid',
            paymentId: paymentId,
            razorpayOrderId: orderId,
            updatedAt: new Date().toISOString()
          });
          console.log('Order payment status updated successfully:', receiptId);
        } else {
          console.log('No receipt provided, skipping database update');
        }
      } catch (dbError) {
        console.error('Error updating order status in database:', dbError);
        // Continue even if database update fails - payment is still verified
      }
    }

    return res.status(200).json({ 
      isValid: isSignatureValid 
    });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return res.status(500).json({ error: error.message });
  }
} 