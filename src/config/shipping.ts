/**
 * Shipping Service Configuration Options
 * Now using Delhivery as the primary shipping provider
 * 
 * @deprecated Shiprocket config - Use Delhivery config instead
 */

import { delhiveryConfig } from './delhivery';

// Re-export Delhivery config as the main shipping config
export const shippingConfig = {
  provider: 'delhivery',
  delhivery: delhiveryConfig,
};

// Legacy Shiprocket config (kept for reference, not used)
const legacyShiprocketConfig = {
  shiprocket: {
    baseUrl: 'https://apiv2.shiprocket.in/v1/external',
    username: import.meta.env.VITE_SHIPROCKET_USERNAME || '',
    password: import.meta.env.VITE_SHIPROCKET_PASSWORD || '',
    channelId: import.meta.env.VITE_SHIPROCKET_CHANNEL_ID || '',
    pickupPincode: import.meta.env.VITE_SHIPROCKET_PICKUP_PINCODE || '110001',
    pickupLocation: 'Primary',
  },
};

export const shippingOptions = {
  // Free shipping threshold
  freeShippingThreshold: 500, // Rs. 500

  // Standard delivery times (now using Delhivery's estimates)
  deliveryTimes: {
    metro: '1-2 days',
    tier1: '2-3 days',
    tier2: '3-5 days',
    rest: '5-7 days'
  },

  // Serviceable states
  serviceableStates: [
    'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ]
};

// Export Delhivery config as default
export default delhiveryConfig;