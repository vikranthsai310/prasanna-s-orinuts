/**
 * Example: How to Use the Centralized Configuration System
 * 
 * This file demonstrates how to import and use configurations from the centralized system
 */

// Import specific configurations
import { 
  firebaseConfig, 
  firebaseOptions,
  paymentConfig, 
  shippingConfig,
  authConfig,
  businessConfig,
  uiConfig,
  appConfig
} from '@/config';

// Import commonly used constants
import { 
  ADMIN_EMAILS, 
  ADDRESS_TYPES, 
  PRODUCT_CATEGORIES,
  WEIGHT_OPTIONS 
} from '@/config';

// Import validation utilities
import { validateConfig, getEnvironmentConfig } from '@/config';

// Example 1: Using Firebase Configuration
const initializeFirebaseApp = () => {
  // Instead of hardcoded values, use centralized config
  console.log('Firebase Project ID:', firebaseConfig.projectId);
  console.log('Using emulators:', firebaseOptions.useEmulators);
};

// Example 2: Using Payment Configuration
const processPayment = (amount: number) => {
  const options = {
    key: paymentConfig.razorpay.keyId,
    amount: amount * 100, // Convert to paise
    currency: paymentConfig.razorpay.currency,
    theme: paymentConfig.theme,
    method: paymentConfig.methods
  };
  
  console.log('Payment options:', options);
};

// Example 3: Using Shipping Configuration
const calculateShipping = (pincode: string) => {
  const config = {
    pickup: shippingConfig.shiprocket.pickupPincode,
    delivery: pincode,
    weight: shippingConfig.defaults.weight,
    hsn: shippingConfig.products.hsnCode
  };
  
  console.log('Shipping calculation config:', config);
};

// Example 4: Using Business Rules
const validateOrder = (orderValue: number, userId: string) => {
  const isAdmin = ADMIN_EMAILS.includes(userId);
  const minOrder = businessConfig.pricing.minimumOrderValue;
  const freeShipping = businessConfig.pricing.freeShippingThreshold;
  
  return {
    isValid: orderValue >= minOrder,
    freeShipping: orderValue >= freeShipping,
    adminUser: isAdmin
  };
};

// Example 5: Using UI Configuration
const setupTheme = () => {
  const theme = {
    colors: uiConfig.theme,
    animations: uiConfig.animations.enabled,
    layout: uiConfig.layout
  };
  
  console.log('UI Theme:', theme);
};

// Example 6: Environment-specific behavior
const setupEnvironment = () => {
  // Validate configuration first
  if (!validateConfig()) {
    console.error('Configuration validation failed!');
    return;
  }
  
  // Get environment-specific settings
  const envConfig = getEnvironmentConfig();
  
  if (appConfig.environment.isDevelopment) {
    console.log('Running in development mode');
    console.log('Logging enabled:', envConfig.logging);
  }
  
  if (appConfig.environment.isProduction) {
    console.log('Running in production mode');
    console.log('Analytics enabled:', envConfig.analytics);
  }
};

// Example 7: Feature Flags
const checkFeatures = () => {
  const features = appConfig.features;
  
  if (features.enableSamples) {
    console.log('Samples feature is enabled');
    console.log('Max samples per user:', businessConfig.samples.maxSamplesPerUser);
  }
  
  if (features.enableBulkOrders) {
    console.log('Bulk orders feature is enabled');
  }
};

// Example 8: Dynamic Configuration Updates
const updateConfiguration = () => {
  // In a real app, you might want to update certain configs dynamically
  // This shows how you can access and modify configurations
  
  // Check if user is admin
  const currentUser = 'user@example.com';
  const isAdmin = ADMIN_EMAILS.includes(currentUser);
  
  if (isAdmin) {
    console.log('Admin user detected, enabling advanced features');
  }
  
  // Use address types for form validation
  const addressForm = {
    availableTypes: ADDRESS_TYPES,
    defaultType: businessConfig.address.defaultType
  };
  
  console.log('Address form config:', addressForm);
};

// Example usage
export const exampleUsage = () => {
  console.log('=== Configuration System Examples ===');
  
  initializeFirebaseApp();
  processPayment(500);
  calculateShipping('110001');
  console.log('Order validation:', validateOrder(750, 'vikranthsai310@gmail.com'));
  setupTheme();
  setupEnvironment();
  checkFeatures();
  updateConfiguration();
  
  console.log('=== Available Product Categories ===');
  PRODUCT_CATEGORIES.forEach(category => console.log(`- ${category}`));
  
  console.log('=== Available Weight Options ===');
  WEIGHT_OPTIONS.forEach(weight => console.log(`- ${weight}`));
};