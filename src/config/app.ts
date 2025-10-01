/**
 * Application Configuration Options
 * Centralized application-wide configurations
 */

export const appConfig = {
  // Application metadata
  app: {
    name: 'Prasanna Premium Orchard',
    version: '1.0.0',
    description: 'Premium dry fruits and nuts e-commerce platform',
    keywords: ['dry fruits', 'nuts', 'premium', 'organic', 'healthy snacks'],
    author: 'Prasanna Premium Orchard Team'
  },

  // SEO and meta configurations
  seo: {
    defaultTitle: 'Prasanna Premium Orchard - Premium Dry Fruits & Nuts',
    titleTemplate: '%s | Prasanna Premium Orchard',
    defaultDescription: 'Shop premium quality dry fruits, nuts, and healthy snacks. Fresh, organic, and delivered to your doorstep.',
    defaultKeywords: 'dry fruits, nuts, almonds, dates, cashews, walnuts, premium quality, organic',
    ogImage: '/Logo.png',
    twitterHandle: '@prasannaorchard'
  },

  // API and external service endpoints
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
  },

  // Environment settings
  environment: {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    enableLogging: import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGGING === 'true',
    enableAnalytics: import.meta.env.PROD && import.meta.env.VITE_ENABLE_ANALYTICS !== 'false'
  },

  // Feature flags
  features: {
    enableSamples: true,
    enableWishlist: false,
    enableReviews: false,
    enableReferrals: false,
    enableLoyaltyProgram: false,
    enableBulkOrders: true,
    enableGuestCheckout: true
  }
};

export const appOptions = {
  // Storage preferences
  storage: {
    prefix: 'prasanna_orchard_',
    version: '1.0',
    encryption: false // Set to true for sensitive data
  },

  // Caching options
  cache: {
    productsCacheDuration: 5 * 60 * 1000, // 5 minutes
    imagesCacheDuration: 24 * 60 * 60 * 1000, // 24 hours
    apiCacheDuration: 2 * 60 * 1000 // 2 minutes
  },

  // Error handling
  errorHandling: {
    enableGlobalErrorBoundary: true,
    enableErrorReporting: import.meta.env.PROD,
    enableFallbackUI: true,
    logErrors: true
  },

  // Performance monitoring
  performance: {
    enableWebVitals: import.meta.env.PROD,
    enableLazyLoading: true,
    enableImageOptimization: true,
    enableCodeSplitting: true
  }
};