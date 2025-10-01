/**
 * Payment Service Configuration Options
 * Centralized payment-related configurations
 */

export const paymentConfig = {
  razorpay: {
    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_DBSSTbBMD0V8N9',
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

export const paymentOptions = {
  // Minimum and maximum order amounts
  limits: {
    minAmount: 100, // Rs. 1.00
    maxAmount: 500000 // Rs. 5000.00
  },

  // Test credentials for development
  test: {
    keyId: 'rzp_test_YOUR_KEY_ID',
    cards: {
      success: '4111 1111 1111 1111',
      failure: '4000 0000 0000 0002'
    }
  }
};