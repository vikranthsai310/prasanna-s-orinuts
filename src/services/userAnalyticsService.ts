/**
 * User Analytics Service
 * Firebase Analytics integration for tracking user behavior and e-commerce events
 */

import { analytics } from '@/lib/firebase';
import { 
  logEvent as firebaseLogEvent,
  setUserId as firebaseSetUserId,
  setUserProperties as firebaseSetUserProperties,
} from 'firebase/analytics';
import type { 
  AnalyticsEvent, 
  PageViewEvent, 
  AddToCartEvent, 
  PurchaseEvent 
} from '@/types/api';

// ============================================================================
// Configuration
// ============================================================================

const ENABLE_ANALYTICS = import.meta.env.PROD; // Only enable in production
const DEBUG_MODE = import.meta.env.DEV;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if analytics is available and enabled
 */
const isAnalyticsAvailable = (): boolean => {
  if (!ENABLE_ANALYTICS) {
    if (DEBUG_MODE) {
      console.log('[Analytics] Disabled in development mode');
    }
    return false;
  }
  
  if (!analytics) {
    console.warn('[Analytics] Firebase Analytics not initialized');
    return false;
  }
  
  return true;
};

/**
 * Log event to console in debug mode
 */
const debugLog = (eventName: string, params?: Record<string, any>) => {
  if (DEBUG_MODE) {
    console.log(`[Analytics] Event: ${eventName}`, params);
  }
};

// ============================================================================
// Core Analytics Functions
// ============================================================================

/**
 * Track a custom event
 */
export const trackEvent = (event: AnalyticsEvent): void => {
  const { name, params = {} } = event;
  
  debugLog(name, params);
  
  if (!isAnalyticsAvailable()) return;
  
  try {
    firebaseLogEvent(analytics, name, {
      ...params,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
  }
};

/**
 * Track page view
 */
export const trackPageView = (page: PageViewEvent): void => {
  debugLog('page_view', page);
  
  if (!isAnalyticsAvailable()) return;
  
  try {
    firebaseLogEvent(analytics, 'page_view', {
      page_path: page.page_path,
      page_title: page.page_title,
      page_location: page.page_location || window.location.href,
    });
  } catch (error) {
    console.error('[Analytics] Error tracking page view:', error);
  }
};

/**
 * Set user ID for analytics
 */
export const setUserId = (userId: string): void => {
  debugLog('set_user_id', { userId });
  
  if (!isAnalyticsAvailable()) return;
  
  try {
    firebaseSetUserId(analytics, userId);
  } catch (error) {
    console.error('[Analytics] Error setting user ID:', error);
  }
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, any>): void => {
  debugLog('set_user_properties', properties);
  
  if (!isAnalyticsAvailable()) return;
  
  try {
    firebaseSetUserProperties(analytics, properties);
  } catch (error) {
    console.error('[Analytics] Error setting user properties:', error);
  }
};

// ============================================================================
// E-commerce Event Tracking
// ============================================================================

/**
 * Track when user views a product
 */
export const trackViewItem = (product: {
  item_id: string;
  item_name: string;
  price: number;
  item_category?: string;
  item_brand?: string;
}): void => {
  trackEvent({
    name: 'view_item',
    params: {
      currency: 'INR',
      value: product.price,
      items: [product],
    },
  });
};

/**
 * Track when user views a list of products
 */
export const trackViewItemList = (items: any[], listName: string = 'Products'): void => {
  trackEvent({
    name: 'view_item_list',
    params: {
      item_list_name: listName,
      items,
    },
  });
};

/**
 * Track when user adds item to cart
 */
export const trackAddToCart = (event: AddToCartEvent): void => {
  debugLog('add_to_cart', event);
  
  if (!isAnalyticsAvailable()) return;
  
  try {
    firebaseLogEvent(analytics, 'add_to_cart', {
      currency: event.currency,
      value: event.value,
      items: event.items,
    });
  } catch (error) {
    console.error('[Analytics] Error tracking add to cart:', error);
  }
};

/**
 * Track when user removes item from cart
 */
export const trackRemoveFromCart = (event: AddToCartEvent): void => {
  trackEvent({
    name: 'remove_from_cart',
    params: {
      currency: event.currency,
      value: event.value,
      items: event.items,
    },
  });
};

/**
 * Track when user views cart
 */
export const trackViewCart = (cartValue: number, items: any[]): void => {
  trackEvent({
    name: 'view_cart',
    params: {
      currency: 'INR',
      value: cartValue,
      items,
    },
  });
};

/**
 * Track when user begins checkout
 */
export const trackBeginCheckout = (cartValue: number, items: any[]): void => {
  trackEvent({
    name: 'begin_checkout',
    params: {
      currency: 'INR',
      value: cartValue,
      items,
    },
  });
};

/**
 * Track when user adds shipping info
 */
export const trackAddShippingInfo = (
  cartValue: number, 
  shippingTier: string,
  items: any[]
): void => {
  trackEvent({
    name: 'add_shipping_info',
    params: {
      currency: 'INR',
      value: cartValue,
      shipping_tier: shippingTier,
      items,
    },
  });
};

/**
 * Track when user adds payment info
 */
export const trackAddPaymentInfo = (
  cartValue: number, 
  paymentType: string,
  items: any[]
): void => {
  trackEvent({
    name: 'add_payment_info',
    params: {
      currency: 'INR',
      value: cartValue,
      payment_type: paymentType,
      items,
    },
  });
};

/**
 * Track successful purchase
 */
export const trackPurchase = (event: PurchaseEvent): void => {
  debugLog('purchase', event);
  
  if (!isAnalyticsAvailable()) return;
  
  try {
    firebaseLogEvent(analytics, 'purchase', {
      currency: event.currency,
      value: event.value,
      transaction_id: event.transaction_id,
      shipping: event.shipping || 0,
      tax: event.tax || 0,
      items: event.items,
    });
  } catch (error) {
    console.error('[Analytics] Error tracking purchase:', error);
  }
};

/**
 * Track refund
 */
export const trackRefund = (transactionId: string, value: number): void => {
  trackEvent({
    name: 'refund',
    params: {
      currency: 'INR',
      value,
      transaction_id: transactionId,
    },
  });
};

// ============================================================================
// User Engagement Events
// ============================================================================

/**
 * Track search
 */
export const trackSearch = (searchTerm: string): void => {
  trackEvent({
    name: 'search',
    params: {
      search_term: searchTerm,
    },
  });
};

/**
 * Track when user clicks a link
 */
export const trackSelectContent = (contentType: string, itemId: string): void => {
  trackEvent({
    name: 'select_content',
    params: {
      content_type: contentType,
      item_id: itemId,
    },
  });
};

/**
 * Track when user shares content
 */
export const trackShare = (contentType: string, itemId: string, method: string): void => {
  trackEvent({
    name: 'share',
    params: {
      content_type: contentType,
      item_id: itemId,
      method,
    },
  });
};

/**
 * Track sign up
 */
export const trackSignUp = (method: string = 'email'): void => {
  trackEvent({
    name: 'sign_up',
    params: {
      method,
    },
  });
};

/**
 * Track login
 */
export const trackLogin = (method: string = 'email'): void => {
  trackEvent({
    name: 'login',
    params: {
      method,
    },
  });
};

// ============================================================================
// Error Tracking
// ============================================================================

/**
 * Track errors and exceptions
 */
export const trackError = (error: Error, context?: string): void => {
  trackEvent({
    name: 'exception',
    params: {
      description: error.message,
      fatal: false,
      context: context || 'unknown',
      stack: error.stack?.substring(0, 150), // Limit stack trace length
    },
  });
};

// ============================================================================
// Export all functions
// ============================================================================

export default {
  trackEvent,
  trackPageView,
  setUserId,
  setUserProperties,
  trackViewItem,
  trackViewItemList,
  trackAddToCart,
  trackRemoveFromCart,
  trackViewCart,
  trackBeginCheckout,
  trackAddShippingInfo,
  trackAddPaymentInfo,
  trackPurchase,
  trackRefund,
  trackSearch,
  trackSelectContent,
  trackShare,
  trackSignUp,
  trackLogin,
  trackError,
};
