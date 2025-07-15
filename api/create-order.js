// Vercel Serverless Function for creating Razorpay orders
import Razorpay from 'razorpay';

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_DBSSTbBMD0V8N9',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'PSAZ07MfVPmBeux0JqpX7aEl'
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;

    // Validate the data
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in paise (smallest currency unit)
      currency,
      receipt,
      notes,
      payment_capture: 1 // Auto-capture payment
    });

    // Return the order details
    return res.status(200).json({ 
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({ error: error.message });
  }
} 