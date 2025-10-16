/**
 * Shipping Service Configuration
 * Using Delhivery as the shipping provider
 */

import { delhiveryConfig } from './delhivery';

// Export Delhivery config as the main shipping config
export const shippingConfig = {
  provider: 'delhivery',
  delhivery: delhiveryConfig,
};

export const shippingOptions = {
  // Free shipping threshold
  freeShippingThreshold: 500, // Rs. 500

  // Standard delivery times (using Delhivery's estimates)
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
