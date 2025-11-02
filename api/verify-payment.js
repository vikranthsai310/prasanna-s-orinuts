// Vercel Serverless Function for verifying Razorpay payments
import crypto from 'crypto';
import { requireAuth, verifyOwnership } from './_middleware/auth.js';

// Initialize Firebase Firestore for order updates
let db = null;

// Only try to initialize Firebase Admin if service account is provided
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const { initializeApp, cert, getApps } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    
    if (getApps().length === 0) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      const app = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || "orinut-494cc"
      });
      db = getFirestore(app);
    } else {
      const { getFirestore } = await import('firebase-admin/firestore');
      db = getFirestore();
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
  }
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, paymentId, signature, receipt } = req.body;

    // Validate the data
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Missing required payment verification parameters' });
    }

    // Verify user owns the order (if receipt/orderId provided)
    if (receipt && db) {
      try {
        const orderDoc = await db.collection('orders').doc(receipt).get();
        if (orderDoc.exists) {
          const orderData = orderDoc.data();
          verifyOwnership(req.user, orderData.userId);
        }
      } catch (ownershipError) {
        console.error('❌ Payment ownership verification failed:', ownershipError.message);
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You do not have permission to verify this payment'
        });
      }
    }

    // Get the Razorpay secret key
    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!secret) {
      console.error('❌ RAZORPAY_KEY_SECRET not configured');
      return res.status(500).json({ 
        error: 'Server configuration error. Please contact support.',
        isValid: false 
      });
    }
    
    // Create and verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');
    
    const isSignatureValid = expectedSignature === signature;

    if (isSignatureValid && db && receipt) {
      try {
        const orderRef = db.collection('orders').doc(receipt);
        await orderRef.update({
          paymentStatus: 'paid',
          paymentId: paymentId,
          razorpayOrderId: orderId,
          updatedAt: new Date().toISOString()
        });
      } catch (dbError) {
        console.error('❌ Order status update failed:', dbError.message);
      }
    }

    return res.status(200).json({ 
      success: true,
      verified: isSignatureValid,
      isValid: isSignatureValid, // Keep for backwards compatibility
      orderId: req.body.receipt || null,
      firebaseOrderId: req.body.receipt || null, // Keep for backwards compatibility
      paymentId: paymentId
    });
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    
    // Handle different error types
    if (error.message.includes('permission') || error.message.includes('Forbidden')) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: error.message
      });
    }
    
    return res.status(500).json({ 
      error: 'Payment verification failed',
      message: error.message,
      isValid: false 
    });
  }
}

// 🔐 Wrap handler with authentication middleware
export default requireAuth(handler); 