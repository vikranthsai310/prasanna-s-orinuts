/**
 * Authentication Configuration Options
 * Centralized authentication-related configurations
 */

export const authConfig = {
  // Admin users configuration
  adminEmails: [
    'vikranthsai310@gmail.com',
    'admin@prasannaorinut.com'
  ],

  // Google Auth configuration
  google: {
    scopes: ['profile', 'email'],
    customParameters: {
      prompt: 'select_account'
    }
  },

  // Phone authentication configuration
  phone: {
    countryCode: '+91',
    otpLength: 6,
    resendTimeout: 60, // seconds
    verificationTimeout: 300 // 5 minutes
  },

  // Session and token configuration
  session: {
    timeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    refreshThreshold: 60 * 60 * 1000, // 1 hour before expiry
    rememberMe: true
  },

  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  }
};

export const authOptions = {
  // Profile completion requirements
  profileRequirements: {
    requiredFields: ['name', 'email', 'phone'],
    optionalFields: ['address', 'dateOfBirth']
  },

  // Login preferences
  loginPreferences: {
    defaultMethod: 'email', // 'email' | 'phone' | 'google'
    allowMultipleMethods: true,
    autoRedirectAfterLogin: true
  }
};