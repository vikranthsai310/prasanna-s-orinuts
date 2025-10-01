/**
 * Payment Service Configuration Options
 * Centralized payment-related configurations
 * 
 * SECURITY WARNING:
 * - ONLY the Razorpay Key ID (public key) should be in the frontend
 * - NEVER expose the Key Secret in frontend code
 * - Key Secret must ONLY exist in backend/server environment
 * - Payment verification must be done server-side
 */

export const paymentConfig = {
  razorpay: {
    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
    scriptUrl: 'https://checkout.razorpay.com/v1/checkout.js',
    currency: 'INR',
    defaultTimeout: 300000, // 5 minutes
  },
  
  // Payment method preferences
  methods: {
    card: true,
    netbanking: true,
    wallet: true,
    upi: true,
    emi: false
  },

  // Payment themes and colors
  theme: {
    color: '#8B4513' // Brown color matching the brand
  },

  // Mobile-specific configurations
  mobile: {
    enableRetry: true,
    hideTopbar: false,
    modalEscape: false
  }
};

// Validation: Ensure Razorpay Key ID is present
const validatePaymentConfig = () => {
  if (!paymentConfig.razorpay.keyId) {
    throw new Error(
      'Missing Razorpay Key ID. Please set VITE_RAZORPAY_KEY_ID in your .env file.'
    );
  }
  
  if (import.meta.env.VITE_RAZORPAY_KEY_SECRET) {
    console.error(
      '⚠️ SECURITY WARNING: Razorpay Key Secret detected in frontend environment! ' +
      'This is a critical security issue. Key Secret should ONLY be on the backend.'
    );
  }
};

// Run validation immediately
if (import.meta.env.MODE !== 'test') {
  validatePaymentConfig();
}

export const paymentOptions = {
  // Minimum and maximum order amounts
  limits: {
    minAmount: 100, // Rs. 1.00
    maxAmount: 500000 // Rs. 5000.00
  },

  // Test mode detection
  isTestMode: import.meta.env.VITE_RAZORPAY_KEY_ID?.startsWith('rzp_test_') || false
};