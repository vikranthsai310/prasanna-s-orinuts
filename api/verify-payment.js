// Vercel Serverless Function for verifying Razorpay payments
import crypto from 'crypto';
import { requireAuth, verifyOwnership } from './_middleware/auth.js';
import { logger } from './_utils/logger.js';

// Base URL for internal API calls
const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : process.env.BASE_URL || 'https://prasannaorchards.com';

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
    logger.error('VERIFY-PAYMENT', 'Firebase Admin initialization failed', error);
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
        logger.error('VERIFY-PAYMENT', 'Payment ownership verification failed', ownershipError);
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You do not have permission to verify this payment'
        });
      }
    }

    // Get the Razorpay secret key
    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!secret) {
      logger.error('VERIFY-PAYMENT', 'RAZORPAY_KEY_SECRET not configured');
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

    let orderData = null;

    if (isSignatureValid && db && receipt) {
      try {
        const orderRef = db.collection('orders').doc(receipt);
        const orderSnap = await orderRef.get();
        
        if (orderSnap.exists) {
          orderData = { id: orderSnap.id, ...orderSnap.data() };
        }
        
        await orderRef.update({
          paymentStatus: 'paid',
          paymentId: paymentId,
          razorpayOrderId: orderId,
          updatedAt: new Date().toISOString()
        });

        // Send order confirmation email
        if (orderData) {
          try {
            logger.info('VERIFY-PAYMENT', 'Sending order confirmation email', {
              orderId: receipt,
              email: orderData.shippingAddress?.email || req.user?.email
            });

            const emailPayload = {
              orderId: receipt,
              customerName: orderData.shippingAddress?.name || 'Valued Customer',
              customerEmail: orderData.shippingAddress?.email || orderData.userEmail || req.user?.email,
              items: orderData.items || [],
              totalAmount: orderData.totalAmount || 0,
              shippingAddress: orderData.shippingAddress || {},
              paymentId: paymentId,
              orderDate: new Date().toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              shippingCharges: orderData.shippingCharges || 0,
            };

            // Call the send-order-email API
            const emailResponse = await fetch(`${BASE_URL}/api/send-order-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(emailPayload),
            });

            if (emailResponse.ok) {
              logger.success('VERIFY-PAYMENT', 'Order confirmation email sent successfully');
            } else {
              const emailError = await emailResponse.json();
              logger.error('VERIFY-PAYMENT', 'Failed to send order confirmation email', emailError);
            }
          } catch (emailError) {
            // Don't fail payment verification if email fails
            logger.error('VERIFY-PAYMENT', 'Error sending order confirmation email', emailError);
          }
        }
      } catch (dbError) {
        logger.error('VERIFY-PAYMENT', 'Order status update failed', dbError);
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
    logger.error('VERIFY-PAYMENT', 'Error verifying payment', error);
    
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