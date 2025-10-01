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
      console.log('✅ Firebase Admin initialized successfully');
    } else {
      const { getFirestore } = await import('firebase-admin/firestore');
      db = getFirestore();
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
  }
} else {
  console.log('⚠️ No Firebase service account key provided');
}

async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔐 Payment verification request from user:', req.user.uid);
    
    const { orderId, paymentId, signature, receipt } = req.body;

    // Validate the data
    if (!orderId || !paymentId || !signature) {
      console.error('❌ Missing required parameters:', { orderId, paymentId, signature });
      return res.status(400).json({ error: 'Missing required payment verification parameters' });
    }

    // 🔐 Verify user owns the order (if receipt/orderId provided)
    if (receipt && db) {
      try {
        const orderDoc = await db.collection('orders').doc(receipt).get();
        if (orderDoc.exists) {
          const orderData = orderDoc.data();
          verifyOwnership(req.user, orderData.userId);
          console.log('✅ User ownership verified for order:', receipt);
        }
      } catch (ownershipError) {
        console.error('❌ Ownership verification failed:', ownershipError.message);
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You do not have permission to verify this payment'
        });
      }
    }

    // Get the Razorpay secret key - must be configured in environment
    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!secret) {
      console.error('CRITICAL: RAZORPAY_KEY_SECRET not configured');
      return res.status(500).json({ 
        error: 'Server configuration error. Please contact support.',
        isValid: false 
      });
    }
    
    // Create a signature using the orderId and paymentId
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');
    
    console.log('Expected signature:', expectedSignature);
    console.log('Received signature:', signature);
    
    // Compare the generated signature with the one received from Razorpay
    const isSignatureValid = expectedSignature === signature;
    console.log('Signature validation result:', isSignatureValid);

    if (isSignatureValid) {
      // Payment signature is valid
      console.log('✅ Payment signature verified successfully');
      
      // Note: In development without Firebase Admin, we'll return success
      // and let the frontend update the order status
      if (db) {
        try {
          // Update database if Firebase Admin is available
          const receiptId = req.body.receipt;
          console.log('Receipt ID for database update:', receiptId);
          
          if (receiptId) {
            const orderRef = db.collection('orders').doc(receiptId);
            await orderRef.update({
              paymentStatus: 'paid',
              paymentId: paymentId,
              razorpayOrderId: orderId,
              updatedAt: new Date().toISOString()
            });
            console.log('Order payment status updated successfully:', receiptId);
          }
        } catch (dbError) {
          console.error('Error updating order status in database:', dbError);
          // Continue even if database update fails - payment is still verified
        }
      } else {
        console.log('Firebase Admin not available, payment verified but order status will be updated by frontend');
      }
    } else {
      console.error('❌ Signature validation failed');
    }

    return res.status(200).json({ 
      isValid: isSignatureValid,
      firebaseOrderId: req.body.receipt || null
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