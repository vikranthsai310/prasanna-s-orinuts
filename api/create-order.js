// Vercel Serverless Function for creating Razorpay orders
import Razorpay from 'razorpay';
import { requireAuth } from './_middleware/auth.js';
import { logger } from './_utils/logger.js';
import { checkRateLimitForRequest } from './_middleware/rateLimit.js';
import { setSecurityHeaders } from './_middleware/securityHeaders.js';

// Environment check at startup
logger.envCheck('CREATE-ORDER', {
  'RAZORPAY_KEY_ID exists': !!process.env.RAZORPAY_KEY_ID,
  'RAZORPAY_KEY_ID value': process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 8)}...` : 'NOT SET',
  'RAZORPAY_KEY_SECRET exists': !!process.env.RAZORPAY_KEY_SECRET,
  'RAZORPAY_KEY_SECRET length': process.env.RAZORPAY_KEY_SECRET?.length || 0,
  'FIREBASE_SERVICE_ACCOUNT_KEY exists': !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY
});

// Initialize Razorpay lazily to avoid startup errors
let razorpay = null;

function getRazorpayInstance() {
  if (razorpay) {
    return razorpay;
  }

  // Validate environment variables
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    logger.error('CREATE-ORDER', 'CRITICAL: Razorpay credentials not configured', null, {
      availableEnvVars: Object.keys(process.env).filter(k => k.includes('RAZOR'))
    });
    throw new Error('Payment gateway not configured. Please contact support.');
  }

  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    logger.success('CREATE-ORDER', 'Razorpay instance created successfully');
    return razorpay;
  } catch (initError) {
    logger.error('CREATE-ORDER', 'Failed to initialize Razorpay', initError);
    throw new Error('Payment gateway initialization failed. Please contact support.');
  }
}

async function handler(req, res) {
  // 🔐 Set security headers
  setSecurityHeaders(req, res);

  // 🚦 Rate limiting for payment endpoints (10 requests/minute)
  const rateLimitResult = checkRateLimitForRequest(req, res, 'payment');
  if (rateLimitResult.limited) {
    logger.warn('CREATE-ORDER', 'Rate limit exceeded', { userId: req.user?.uid });
    return res.status(429).json(rateLimitResult.response.body);
  }

  logger.request('CREATE-ORDER', req.method, '/api/create-order', req.user?.uid);

  if (req.method !== 'POST') {
    logger.warn('CREATE-ORDER', `Method not allowed: ${req.method}`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;

    logger.debug('CREATE-ORDER', 'Request body received', {
      amount,
      currency,
      receipt,
      notesKeys: Object.keys(notes)
    });

    // Validate the data
    if (!amount || amount <= 0) {
      logger.warn('CREATE-ORDER', `Invalid amount: ${amount}`);
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Additional validations
    if (amount > 10000000) { // 1 crore limit
      logger.warn('CREATE-ORDER', `Amount too large: ${amount}`);
      return res.status(400).json({ error: 'Amount exceeds maximum limit' });
    }

    if (!receipt || receipt.length === 0) {
      logger.warn('CREATE-ORDER', 'Receipt/Order ID missing');
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Validate currency
    const validCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
    if (!validCurrencies.includes(currency)) {
      logger.warn('CREATE-ORDER', `Invalid currency: ${currency}`);
      return res.status(400).json({ error: 'Invalid currency' });
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

    logger.debug('CREATE-ORDER', 'Creating Razorpay order with params', {
      amount: orderParams.amount,
      amountInRupees: amount,
      currency: orderParams.currency,
      receipt: orderParams.receipt,
      payment_capture: orderParams.payment_capture,
      notesCount: Object.keys(orderParams.notes).length
    });

    // Validate amount is not 0 after conversion
    if (orderParams.amount === 0 || orderParams.amount < 100) {
      logger.error('CREATE-ORDER', 'Amount too small after conversion', {
        originalAmount: amount,
        convertedAmount: orderParams.amount,
        minimumRequired: 100
      });
      return res.status(400).json({
        error: 'Order amount is too small. Minimum amount is ₹1.00'
      });
    }

    const razorpayInstance = getRazorpayInstance();
    const order = await razorpayInstance.orders.create(orderParams);

    logger.success('CREATE-ORDER', 'Order created successfully', {
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
    logger.error('CREATE-ORDER', 'Error creating order', error, {
      code: error.code,
      statusCode: error.statusCode,
      name: error.name
    });

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