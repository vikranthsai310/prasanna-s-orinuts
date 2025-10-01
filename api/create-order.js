// Vercel Serverless Function for creating Razorpay orders
import Razorpay from 'razorpay';
import { requireAuth } from './_middleware/auth.js';

// Validate environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('CRITICAL: Razorpay credentials not configured in environment variables');
}

// Initialize Razorpay with environment variables ONLY
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function handler(req, res) {
  console.log('🚀 [CREATE-ORDER] Handler invoked');
  console.log('📝 [CREATE-ORDER] Method:', req.method);
  console.log('🔑 [CREATE-ORDER] User object exists:', !!req.user);
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ [CREATE-ORDER] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔐 [CREATE-ORDER] User authenticated:', {
      uid: req.user?.uid,
      email: req.user?.email,
      hasUser: !!req.user
    });
    
    console.log('📦 [CREATE-ORDER] Request body:', JSON.stringify(req.body, null, 2));
    
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;

    console.log('💰 [CREATE-ORDER] Parsed values:', {
      amount,
      currency,
      receipt,
      notes
    });

    // Validate the data
    if (!amount || amount <= 0) {
      console.log('❌ [CREATE-ORDER] Invalid amount:', amount);
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // 🔐 Add user information to order notes
    const enrichedNotes = {
      ...notes,
      userId: req.user.uid,
      userEmail: req.user.email,
      createdAt: new Date().toISOString()
    };

    console.log('📝 [CREATE-ORDER] Enriched notes:', enrichedNotes);

    // Check Razorpay credentials
    console.log('🔑 [CREATE-ORDER] Razorpay Key ID exists:', !!process.env.RAZORPAY_KEY_ID);
    console.log('🔑 [CREATE-ORDER] Razorpay Key Secret exists:', !!process.env.RAZORPAY_KEY_SECRET);

    // Create order
    console.log('🌐 [CREATE-ORDER] Calling Razorpay API...');
    const orderParams = {
      amount: Math.round(amount * 100), // amount in paise (smallest currency unit)
      currency,
      receipt,
      notes: enrichedNotes,
      payment_capture: 1 // Auto-capture payment
    };
    
    console.log('📤 [CREATE-ORDER] Order params:', JSON.stringify(orderParams, null, 2));
    
    const order = await razorpay.orders.create(orderParams);

    console.log('✅ [CREATE-ORDER] Razorpay order created successfully:', order.id);
    console.log('📊 [CREATE-ORDER] Order details:', JSON.stringify(order, null, 2));

    // Return the order details
    return res.status(200).json({ 
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });
  } catch (error) {
    console.error('❌ [CREATE-ORDER] Error occurred:');
    console.error('❌ [CREATE-ORDER] Error message:', error.message);
    console.error('❌ [CREATE-ORDER] Error stack:', error.stack);
    console.error('❌ [CREATE-ORDER] Error code:', error.code);
    console.error('❌ [CREATE-ORDER] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    return res.status(500).json({ 
      error: 'Failed to create order',
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// 🔐 Wrap handler with authentication middleware
export default requireAuth(handler); 