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
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Validate environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ [CREATE-ORDER] CRITICAL: Razorpay credentials not configured!');
  console.error('   Available env vars:', Object.keys(process.env).filter(k => k.includes('RAZOR')));
  throw new Error('CRITICAL: Razorpay credentials not configured in environment variables');
}

console.log('✅ [CREATE-ORDER] Razorpay credentials validated');

// Initialize Razorpay with environment variables ONLY
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('✅ [CREATE-ORDER] Razorpay instance created successfully');
} catch (initError) {
  console.error('❌ [CREATE-ORDER] Failed to initialize Razorpay:', initError);
  throw initError;
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

    const order = await razorpay.orders.create(orderParams);

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
    
    return res.status(500).json({ 
      error: 'Failed to create order',
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      statusCode: error.statusCode,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// 🔐 Wrap handler with authentication middleware
export default requireAuth(handler); 