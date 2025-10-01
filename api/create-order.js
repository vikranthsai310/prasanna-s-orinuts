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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔐 Create order request from user:', req.user.uid);
    
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;

    // Validate the data
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // 🔐 Add user information to order notes
    const enrichedNotes = {
      ...notes,
      userId: req.user.uid,
      userEmail: req.user.email,
      createdAt: new Date().toISOString()
    };

    // Create order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in paise (smallest currency unit)
      currency,
      receipt,
      notes: enrichedNotes,
      payment_capture: 1 // Auto-capture payment
    });

    console.log('✅ Razorpay order created successfully:', order.id);

    // Return the order details
    return res.status(200).json({ 
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    return res.status(500).json({ 
      error: 'Failed to create order',
      message: error.message 
    });
  }
}

// 🔐 Wrap handler with authentication middleware
export default requireAuth(handler); 