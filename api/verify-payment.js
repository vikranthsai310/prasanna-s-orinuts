// Vercel Serverless Function for verifying Razorpay payments
import crypto from 'crypto';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyB-XnyhYJEnJKKgpu6XE7Ti58D7e9UoH0M",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "prassanas-orinut.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "prassanas-orinut",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "prassanas-orinut.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "352359366381",
  appId: process.env.FIREBASE_APP_ID || "1:352359366381:web:1f95ed0eec665ab8bd96e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
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
        // Update the order status in Firestore
        const orderRef = doc(db, 'orders', req.body.receipt || orderId);
        await updateDoc(orderRef, {
          paymentStatus: 'paid',
          paymentId: paymentId,
          updatedAt: new Date().toISOString()
        });
      } catch (dbError) {
        console.error('Error updating order status in database:', dbError);
        // Continue even if database update fails
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