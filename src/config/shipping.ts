/**
 * Shipping Service Configuration
 * Using Shiprocket as the shipping provider
 */

import { shiprocketConfig } from './shiprocket';

// Export Shiprocket config as the main shipping config
export const shippingConfig = {
  provider: 'shiprocket',
  shiprocket: shiprocketConfig,
};

export const shippingOptions = {
  // Shipping charges apply based on location
  minimumOrderCharge: 50, // Rs. 50 for orders below certain amount

  // Standard delivery times
  deliveryTimes: {
    hyderabad: '2-3 days',
    telanganaMetro: '3-4 days',
    telanganaTier2: '4-6 days',
    india: '5-7 days',
  },

  // Serviceable regions
  serviceableState: 'All India',
  serviceableMessage: 'We deliver across India via Shiprocket'
};

// Export Shiprocket config as default
export default shiprocketConfig;

