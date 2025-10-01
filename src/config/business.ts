/**
 * Business Logic Configuration Options
 * Centralized business rules and logic configurations
 */

export const businessConfig = {
  // Address types and options
  address: {
    types: ['Home', 'Work', 'Business', 'Other'] as const,
    maxAddresses: 5,
    defaultType: 'Home' as const
  },

  // Order management
  orders: {
    statusFlow: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'returned'
    ] as const,
    cancellationWindow: 24 * 60 * 60 * 1000, // 24 hours
    returnWindow: 7 * 24 * 60 * 60 * 1000, // 7 days
    autoConfirmDelay: 2 * 60 * 60 * 1000 // 2 hours
  },

  // Product categories and management
  products: {
    categories: ['nuts', 'dates', 'dried-fruits', 'seeds', 'spices'] as const,
    weightOptions: ['250g', '500g', '1kg', '2kg'] as const,
    stockThreshold: 10, // Low stock warning
    maxQuantityPerOrder: 10
  },

  // Pricing and discounts
  pricing: {
    currency: 'INR',
    currencySymbol: '₹',
    minimumOrderValue: 100,
    freeShippingThreshold: 500,
    bulkDiscountThreshold: 1000, // 10% discount above this amount
    memberDiscountPercent: 5
  },

  // Sample and trial options
  samples: {
    enabled: true,
    maxSamplesPerUser: 3,
    sampleWeight: '50g',
    samplePrice: 49,
    cooldownPeriod: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
};

export const businessOptions = {
  // Customer service
  support: {
    phone: '+91-9876543210',
    email: 'support@prasannaorinut.com',
    whatsapp: '919876543210',
    workingHours: '9 AM - 6 PM (Mon-Sat)'
  },

  // Company information
  company: {
    name: 'Prasanna Premium Orchard',
    legalName: 'Prasanna Premium Orchard Pvt. Ltd.',
    address: {
      line1: '123 Orchard Street',
      line2: 'Premium District',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India'
    },
    gst: 'GST_NUMBER_HERE',
    fssai: 'FSSAI_LICENSE_HERE'
  },

  // Social media links
  social: {
    facebook: 'https://facebook.com/prasannaorchard',
    instagram: 'https://instagram.com/prasannaorchard',
    twitter: 'https://twitter.com/prasannaorchard',
    youtube: 'https://youtube.com/prasannaorchard'
  }
};