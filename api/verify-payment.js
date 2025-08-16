// Vercel Serverless Function for verifying Razorpay payments
import crypto from 'crypto';

// For development, we'll skip Firebase Admin and just verify payment signature
// In production, you should set up proper Firebase Admin with service account
let db = null;

// Only try to initialize Firebase Admin if service account is provided
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const { initializeApp, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    const app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || "orinut-494cc"
    });
    db = getFirestore(app);
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
  }
} else {
  console.log('No Firebase service account key provided, skipping Firebase Admin initialization');
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Payment verification request received:', req.body);
    
    const { orderId, paymentId, signature } = req.body;

    // Validate the data
    if (!orderId || !paymentId || !signature) {
      console.error('Missing required parameters:', { orderId, paymentId, signature });
      return res.status(400).json({ error: 'Missing required payment verification parameters' });
    }

    // Get the Razorpay secret key
    const secret = process.env.RAZORPAY_KEY_SECRET || 'PSAZ07MfVPmBeux0JqpX7aEl';
    console.log('Using Razorpay secret (length):', secret.length);
    
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
    console.error('Error verifying Razorpay payment:', error);
    return res.status(500).json({ error: error.message });
  }
} 