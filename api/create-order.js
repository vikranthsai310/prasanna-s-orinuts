// Vercel Serverless Function for creating Razorpay orders
import Razorpay from 'razorpay';
import { requireAuth } from './_middleware/auth.js';

// 🔍 DEBUG: Log environment check at startup
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 [CREATE-ORDER] Environment Check:');
console.log('   RAZORPAY_KEY_ID exists:', !!process.env.RAZORPAY_KEY_ID);
console.log('   RAZORPAY_KEY_ID value:', process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 8)}...` : 'NOT SET');
console.log('   RAZORPAY_KEY_SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET);
console.log('   RAZORPAY_KEY_SECRET length:', process.env.RAZORPAY_KEY_SECRET?.length || 0);
console.log('   FIREBASE_SERVICE_ACCOUNT_KEY exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Initialize Razorpay lazily to avoid startup errors
let razorpay = null;

function getRazorpayInstance() {
  if (razorpay) {
    return razorpay;
  }

  // Validate environment variables
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('❌ [CREATE-ORDER] CRITICAL: Razorpay credentials not configured!');
    console.error('   Available env vars:', Object.keys(process.env).filter(k => k.includes('RAZOR')));
    throw new Error('Payment gateway not configured. Please contact support.');
  }

  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('✅ [CREATE-ORDER] Razorpay instance created successfully');
    return razorpay;
  } catch (initError) {
    console.error('❌ [CREATE-ORDER] Failed to initialize Razorpay:', initError);
    throw new Error('Payment gateway initialization failed. Please contact support.');
  }
}

async function handler(req, res) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 [CREATE-ORDER] Request received');
  console.log('   Method:', req.method);
  console.log('   User:', req.user?.uid || 'NO USER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (req.method !== 'POST') {
    console.log('❌ [CREATE-ORDER] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;

    console.log('📦 [CREATE-ORDER] Request body:', {
      amount,
      currency,
      receipt,
      notesKeys: Object.keys(notes)
    });

    // Validate the data
    if (!amount || amount <= 0) {
      console.log('❌ [CREATE-ORDER] Invalid amount:', amount);
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Add user information to order notes
    const enrichedNotes = {
      ...notes,
      userId: req.user.uid,
      userEmail: req.user.email,
      createdAt: new Date().toISOString()
    };

    // Create order
    const orderParams = {
      amount: Math.round(amount * 100), // amount in paise (smallest currency unit)
      currency,
      receipt,
      notes: enrichedNotes,
      payment_capture: 1 // Auto-capture payment
    };
    
    console.log('📤 [CREATE-ORDER] Creating Razorpay order with params:', {
      amount: orderParams.amount,
      currency: orderParams.currency,
      receipt: orderParams.receipt,
      payment_capture: orderParams.payment_capture
    });

    const razorpayInstance = getRazorpayInstance();
    const order = await razorpayInstance.orders.create(orderParams);

    console.log('✅ [CREATE-ORDER] Order created successfully:', {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });

    // Return the order details
    return res.status(200).json({ 
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ [CREATE-ORDER] ERROR CAUGHT:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('   Status Code:', error.statusCode);
    console.error('   Name:', error.name);
    console.error('   Stack:', error.stack);
    console.error('   Full Error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Provide user-friendly error messages
    const statusCode = error.statusCode || 500;
    let errorMessage = 'Failed to create order';
    
    if (error.message.includes('Payment gateway not configured')) {
      errorMessage = 'Payment service is temporarily unavailable. Please try again later.';
    } else if (error.message.includes('Payment gateway initialization failed')) {
      errorMessage = 'Unable to process payment at this time. Please contact support.';
    } else if (error.code === 'BAD_REQUEST_ERROR') {
      errorMessage = 'Invalid payment information. Please check your details and try again.';
    } else if (statusCode >= 500) {
      errorMessage = 'Server error processing payment. Please try again.';
    }
    
    return res.status(statusCode).json({ 
      error: errorMessage,
      message: error.message,
      code: error.code || 'PAYMENT_ERROR',
      statusCode: statusCode,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// 🔐 Wrap handler with authentication middleware
export default requireAuth(handler); 