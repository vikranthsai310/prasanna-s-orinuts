/**
 * Shipping Service Configuration Options
 * Centralized shipping and logistics configurations
 */

export const shippingConfig = {
  shiprocket: {
    baseUrl: 'https://apiv2.shiprocket.in/v1/external',
    username: import.meta.env.VITE_SHIPROCKET_USERNAME || '',
    password: import.meta.env.VITE_SHIPROCKET_PASSWORD || '',
    channelId: import.meta.env.VITE_SHIPROCKET_CHANNEL_ID || '',
    pickupPincode: import.meta.env.VITE_SHIPROCKET_PICKUP_PINCODE || '110001',
    pickupLocation: 'Primary', // Default pickup location name
  },

  // Default shipping options
  defaults: {
    courierCompanyId: 0, // Let shiprocket choose best option
    paymentMethod: 'Prepaid',
    length: 10, // cm
    breadth: 10, // cm
    height: 5, // cm
    weight: 0.5 // kg
  },

  // Product-specific configurations
  products: {
    hsnCode: '08134000', // HSN code for dried fruits and nuts
    categories: {
      nuts: { weight: 0.3, dimensions: { l: 15, b: 10, h: 5 } },
      dates: { weight: 0.4, dimensions: { l: 12, b: 8, h: 6 } },
      driedFruits: { weight: 0.2, dimensions: { l: 10, b: 8, h: 4 } }
    }
  },

  // Rate calculation preferences
  rateCalculation: {
    codCharges: 0,
    isCod: false,
    sourceAvailabilityCheck: true,
    destinationAvailabilityCheck: true
  }
};

export const shippingOptions = {
  // Free shipping threshold
  freeShippingThreshold: 500, // Rs. 500

  // Standard delivery times
  deliveryTimes: {
    metro: '2-3 days',
    urban: '3-5 days',
    rural: '5-7 days'
  },

  // Serviceable pincodes (if needed for validation)
  serviceableStates: [
    'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ]
};