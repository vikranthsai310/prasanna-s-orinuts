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
  // Shipping charges apply based on location
  minimumOrderCharge: 50, // Rs. 50 for orders below certain amount

  // Standard delivery times (Telangana only)
  deliveryTimes: {
    hyderabad: '1-2 days',
    telanganaMetro: '2-3 days',
    telanganaTier2: '3-5 days',
  },

  // Serviceable state
  serviceableState: 'Telangana',
  serviceableCities: [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 
    'Khammam', 'Nalgonda', 'Mahabubnagar', 'Adilabad', 'Medak'
  ]
};

// Export Delhivery config as default
export default delhiveryConfig;
