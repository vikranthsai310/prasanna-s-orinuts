/**
 * Main Configuration Index
 * Central export point for all configuration modules
 */

// Import all configuration modules
import { firebaseConfig } from './firebase';
import { paymentConfig } from './payment';
import { shippingConfig } from './shipping';

export { firebaseConfig, firebaseOptions, firebaseStorageUrls, localImageUrls } from './firebase';
export { paymentConfig, paymentOptions } from './payment';
export { shippingConfig, shippingOptions } from './shipping';
export { authConfig, authOptions } from './auth';
export { uiConfig, uiOptions } from './ui';
export { businessConfig, businessOptions } from './business';
export { appConfig, appOptions } from './app';

// Re-export specific commonly used configurations for easy access
export const ADMIN_EMAILS = ['vikranthsai310@gmail.com', 'admin@prasannaorinut.com'];
export const ADDRESS_TYPES = ['Home', 'Work', 'Business', 'Other'] as const;
export const PRODUCT_CATEGORIES = ['nuts', 'dates', 'dried-fruits', 'seeds', 'spices'] as const;
export const WEIGHT_OPTIONS = ['250g', '500g', '1kg', '2kg'] as const;

// Configuration validation helper
export const validateConfig = () => {
  const errors: string[] = [];
  
  // Check Firebase configuration
  if (!firebaseConfig.apiKey) {
    errors.push('Firebase API key is missing');
  }
  
  // Check payment configuration
  if (!paymentConfig.razorpay.keyId || paymentConfig.razorpay.keyId.includes('YOUR_KEY_ID')) {
    errors.push('Razorpay key ID is not configured');
  }
  
  // Check shipping configuration
  if (!shippingConfig.shiprocket.username || !shippingConfig.shiprocket.password) {
    errors.push('Shiprocket credentials are missing');
  }
  
  if (errors.length > 0) {
    console.warn('Configuration validation errors:', errors);
    return false;
  }
  
  return true;
};

// Environment-specific configuration override
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        logging: false,
        analytics: true,
        errorReporting: true
      };
    case 'staging':
      return {
        logging: true,
        analytics: false,
        errorReporting: true
      };
    default:
      return {
        logging: true,
        analytics: false,
        errorReporting: false
      };
  }
};