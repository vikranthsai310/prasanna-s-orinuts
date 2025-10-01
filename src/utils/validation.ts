/**
 * Input Sanitization and Validation Utilities
 * 
 * SECURITY: Protects against XSS attacks, injection, and malicious input
 * Use these utilities for ALL user input before storing or displaying
 */

import DOMPurify from 'dompurify';

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize user input to prevent XSS attacks
 * Removes all HTML tags and malicious scripts
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Remove ALL HTML tags
    ALLOWED_ATTR: [], // Remove ALL attributes
    KEEP_CONTENT: true // Keep text content
  }).trim();
};

/**
 * Sanitize HTML content while allowing specific safe tags
 * Use for rich text content like reviews, descriptions
 */
export const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

/**
 * Sanitize object by sanitizing all string values
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as any;
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  
  return sanitized;
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate email address format
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate Indian mobile phone number
 * Format: 10 digits starting with 6-9
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  const phoneRegex = /^[6-9]\d{9}$/;
  
  return phoneRegex.test(cleaned);
};

/**
 * Validate Indian pincode
 * Format: 6 digits
 */
export const validatePincode = (pincode: string): boolean => {
  if (!pincode || typeof pincode !== 'string') return false;
  
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Validate name (person name, street name, etc.)
 * 2-100 characters, letters and spaces only
 */
export const validateName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const trimmed = name.trim();
  return (
    trimmed.length >= 2 &&
    trimmed.length <= 100 &&
    /^[a-zA-Z\s.',-]+$/.test(trimmed)
  );
};

/**
 * Validate street address
 * 5-200 characters
 */
export const validateStreet = (street: string): boolean => {
  if (!street || typeof street !== 'string') return false;
  
  const trimmed = street.trim();
  return trimmed.length >= 5 && trimmed.length <= 200;
};

/**
 * Validate city name
 * 2-100 characters, letters and spaces
 */
export const validateCity = (city: string): boolean => {
  return validateName(city);
};

/**
 * Validate state name
 * 2-100 characters
 */
export const validateState = (state: string): boolean => {
  return validateName(state);
};

/**
 * Validate password strength
 * Minimum 8 characters, at least one letter and one number
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password should contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate review rating
 * Must be integer between 1 and 5
 */
export const validateRating = (rating: number): boolean => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

/**
 * Validate review comment
 * 10-1000 characters
 */
export const validateComment = (comment: string): boolean => {
  if (!comment || typeof comment !== 'string') return false;
  
  const trimmed = comment.trim();
  return trimmed.length >= 10 && trimmed.length <= 1000;
};

/**
 * Validate product quantity
 * Must be positive integer
 */
export const validateQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 100;
};

/**
 * Validate amount/price
 * Must be positive number with max 2 decimal places
 */
export const validateAmount = (amount: number): boolean => {
  if (typeof amount !== 'number' || isNaN(amount)) return false;
  
  const isPositive = amount > 0;
  const hasValidDecimals = /^\d+(\.\d{1,2})?$/.test(amount.toString());
  
  return isPositive && hasValidDecimals && amount <= 1000000; // Max 10 lakh
};

// ============================================
// DOMAIN-SPECIFIC VALIDATION
// ============================================

/**
 * Validate address object
 */
export interface Address {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  type?: string;
}

export const validateAddress = (address: Address): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  if (!validateName(address.name)) {
    errors.name = 'Name must be 2-100 characters, letters only';
  }
  
  if (!validatePhone(address.phone)) {
    errors.phone = 'Invalid phone number. Must be 10 digits starting with 6-9';
  }
  
  if (!validateStreet(address.street)) {
    errors.street = 'Street address must be 5-200 characters';
  }
  
  if (!validateCity(address.city)) {
    errors.city = 'City name must be 2-100 characters';
  }
  
  if (!validateState(address.state)) {
    errors.state = 'State name must be 2-100 characters';
  }
  
  if (!validatePincode(address.pincode)) {
    errors.pincode = 'Invalid pincode. Must be 6 digits';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitize and validate address
 */
export const sanitizeAddress = (address: Address): Address => {
  return {
    name: sanitizeInput(address.name),
    phone: sanitizeInput(address.phone).replace(/[\s-]/g, ''),
    street: sanitizeInput(address.street),
    city: sanitizeInput(address.city),
    state: sanitizeInput(address.state),
    pincode: sanitizeInput(address.pincode),
    type: address.type ? sanitizeInput(address.type) : undefined
  };
};

/**
 * Validate order data
 */
export const validateOrderData = (order: any): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Order must contain at least one item');
  }
  
  if (!validateAmount(order.totalAmount)) {
    errors.push('Invalid order total amount');
  }
  
  if (order.items && Array.isArray(order.items)) {
    order.items.forEach((item: any, index: number) => {
      if (!validateQuantity(item.quantity)) {
        errors.push(`Invalid quantity for item ${index + 1}`);
      }
      if (!validateAmount(item.price)) {
        errors.push(`Invalid price for item ${index + 1}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================
// EXPORT ALL
// ============================================

export default {
  sanitize: {
    input: sanitizeInput,
    html: sanitizeHTML,
    object: sanitizeObject,
    address: sanitizeAddress
  },
  validate: {
    email: validateEmail,
    phone: validatePhone,
    pincode: validatePincode,
    name: validateName,
    street: validateStreet,
    city: validateCity,
    state: validateState,
    password: validatePassword,
    rating: validateRating,
    comment: validateComment,
    quantity: validateQuantity,
    amount: validateAmount,
    address: validateAddress,
    order: validateOrderData
  }
};
