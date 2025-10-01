/**
 * API Constants
 * Centralized API endpoints, error messages, and configuration
 */

// ============================================================================
// API Base URLs
// ============================================================================

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// ============================================================================
// API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  // Payment endpoints
  PAYMENT: {
    CREATE_ORDER: `${API_BASE_URL}/create-order`,
    VERIFY_PAYMENT: `${API_BASE_URL}/verify-payment`,
  },
  
  // Shipping endpoints
  SHIPPING: {
    CALCULATE: `${API_BASE_URL}/calculate-shipping`,
    CREATE_SHIPMENT: `${API_BASE_URL}/create-shipment`,
    TRACK_SHIPMENT: `${API_BASE_URL}/track-shipment`,
  },
  
  // Order endpoints (future)
  ORDERS: {
    CREATE: `${API_BASE_URL}/orders`,
    GET: (orderId: string) => `${API_BASE_URL}/orders/${orderId}`,
    LIST: `${API_BASE_URL}/orders`,
    UPDATE: (orderId: string) => `${API_BASE_URL}/orders/${orderId}`,
    CANCEL: (orderId: string) => `${API_BASE_URL}/orders/${orderId}/cancel`,
  },
  
  // Product endpoints (future)
  PRODUCTS: {
    LIST: `${API_BASE_URL}/products`,
    GET: (productId: string) => `${API_BASE_URL}/products/${productId}`,
    SEARCH: `${API_BASE_URL}/products/search`,
  },
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH: {
    NOT_AUTHENTICATED: 'You must be logged in to perform this action',
    INVALID_TOKEN: 'Invalid or expired authentication token',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    SESSION_EXPIRED: 'Your session has expired. Please log in again',
  },
  
  // Payment errors
  PAYMENT: {
    CREATE_ORDER_FAILED: 'Failed to create payment order. Please try again',
    VERIFICATION_FAILED: 'Payment verification failed. Please contact support',
    INVALID_AMOUNT: 'Invalid payment amount',
    PAYMENT_DECLINED: 'Payment was declined. Please try another payment method',
  },
  
  // Shipping errors
  SHIPPING: {
    CALCULATE_FAILED: 'Failed to calculate shipping rates. Please try again',
    CREATE_SHIPMENT_FAILED: 'Failed to create shipment. Please contact support',
    TRACK_FAILED: 'Failed to track shipment. Please try again later',
    INVALID_PINCODE: 'Invalid pincode provided',
    SERVICE_UNAVAILABLE: 'Shipping service is temporarily unavailable',
  },
  
  // Order errors
  ORDER: {
    CREATE_FAILED: 'Failed to create order. Please try again',
    NOT_FOUND: 'Order not found',
    UPDATE_FAILED: 'Failed to update order',
    CANCEL_FAILED: 'Failed to cancel order',
    ALREADY_SHIPPED: 'Order has already been shipped and cannot be cancelled',
  },
  
  // Product errors
  PRODUCT: {
    NOT_FOUND: 'Product not found',
    OUT_OF_STOCK: 'Product is out of stock',
    INVALID_QUANTITY: 'Invalid quantity specified',
  },
  
  // Network errors
  NETWORK: {
    REQUEST_FAILED: 'Network request failed. Please check your connection',
    TIMEOUT: 'Request timed out. Please try again',
    SERVER_ERROR: 'Server error occurred. Please try again later',
  },
  
  // Validation errors
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Invalid email address',
    INVALID_PHONE: 'Invalid phone number',
    INVALID_ADDRESS: 'Invalid address provided',
    INVALID_INPUT: 'Invalid input provided',
  },
  
  // Generic errors
  GENERIC: {
    UNKNOWN_ERROR: 'An unknown error occurred. Please try again',
    SOMETHING_WENT_WRONG: 'Something went wrong. Please try again',
  },
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  PAYMENT: {
    ORDER_CREATED: 'Payment order created successfully',
    PAYMENT_VERIFIED: 'Payment verified successfully',
  },
  
  SHIPPING: {
    RATES_CALCULATED: 'Shipping rates calculated successfully',
    SHIPMENT_CREATED: 'Shipment created successfully',
  },
  
  ORDER: {
    CREATED: 'Order placed successfully',
    UPDATED: 'Order updated successfully',
    CANCELLED: 'Order cancelled successfully',
  },
} as const;

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// Request Configuration
// ============================================================================

export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    ACCEPT: 'application/json',
  },
} as const;

// ============================================================================
// Razorpay Configuration
// ============================================================================

export const RAZORPAY_CONFIG = {
  KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID,
  CURRENCY: 'INR',
  PAYMENT_METHODS: ['card', 'netbanking', 'wallet', 'upi'],
  THEME_COLOR: '#10b981', // emerald-500
} as const;

// ============================================================================
// Shiprocket Configuration
// ============================================================================

export const SHIPROCKET_CONFIG = {
  DEFAULT_PICKUP_PINCODE: '560001', // Update with your warehouse pincode
  DEFAULT_WEIGHT: 0.5, // Default weight in kg
  DEFAULT_DIMENSIONS: {
    LENGTH: 10,
    BREADTH: 10,
    HEIGHT: 10,
  },
  COUNTRY: 'India',
} as const;

// ============================================================================
// Order Status Configuration
// ============================================================================

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
} as const;

export const PAYMENT_METHOD = {
  PREPAID: 'Prepaid',
  COD: 'COD',
} as const;

// ============================================================================
// Type Exports for Constants
// ============================================================================

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
export type PaymentMethod = typeof PAYMENT_METHOD[keyof typeof PAYMENT_METHOD];
