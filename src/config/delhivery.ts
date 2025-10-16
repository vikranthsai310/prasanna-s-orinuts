/**
 * Delhivery API Configuration
 * Centralized configuration for Delhivery logistics integration
 */

export const delhiveryConfig = {
  api: {
    // Delhivery API Base URLs
    baseUrl: 'https://track.delhivery.com/api',
    stagingUrl: 'https://staging-express.delhivery.com/api',
    
    // Use staging for testing, production for live
    isProduction: import.meta.env.VITE_DELHIVERY_PRODUCTION === 'true',
    
    // API Token (10-digit surface tracking API token)
    token: import.meta.env.VITE_DELHIVERY_API_TOKEN || '',
    
    // Client name for tracking
    clientName: import.meta.env.VITE_DELHIVERY_CLIENT_NAME || 'PremiumOrchard',
  },

  // Warehouse/Pickup Configuration
  warehouse: {
    name: import.meta.env.VITE_DELHIVERY_WAREHOUSE_NAME || 'Primary Warehouse',
    pincode: import.meta.env.VITE_DELHIVERY_PICKUP_PINCODE || '110001',
    address: import.meta.env.VITE_DELHIVERY_PICKUP_ADDRESS || '',
    city: import.meta.env.VITE_DELHIVERY_PICKUP_CITY || '',
    state: import.meta.env.VITE_DELHIVERY_PICKUP_STATE || '',
    phone: import.meta.env.VITE_DELHIVERY_PICKUP_PHONE || '',
    contactPerson: import.meta.env.VITE_DELHIVERY_PICKUP_CONTACT || '',
  },

  // Default shipment settings
  defaults: {
    paymentMode: 'Prepaid', // 'Prepaid' or 'COD'
    productType: 'Express', // Express for normal delivery
    packageType: 'NON-DOC', // NON-DOC for physical products
    returnAddress: true,
    length: 10, // cm
    breadth: 10, // cm
    height: 5, // cm
    weight: 0.5, // kg
  },

  // Product-specific configurations
  products: {
    hsnCode: '08134000', // HSN code for dried fruits and nuts
    categories: {
      nuts: { 
        weight: 0.3, 
        dimensions: { length: 15, breadth: 10, height: 5 } 
      },
      dates: { 
        weight: 0.4, 
        dimensions: { length: 12, breadth: 8, height: 6 } 
      },
      driedFruits: { 
        weight: 0.2, 
        dimensions: { length: 10, breadth: 8, height: 4 } 
      }
    }
  },

  // Rate calculation settings
  rateCalculation: {
    enableCOD: false, // Enable COD calculations
    insuranceEnabled: false,
    returnShipmentEnabled: false,
  },

  // Shipping options
  shipping: {
    freeShippingThreshold: 500, // Rs. 500
    codCharges: 50, // COD charges if enabled
    
    // Estimated delivery times by region
    deliveryTimes: {
      metro: '1-2 days',
      tier1: '2-3 days',
      tier2: '3-5 days',
      rest: '5-7 days'
    },

    // Metro cities for faster delivery
    metroCities: [
      'Delhi', 'Mumbai', 'Bangalore', 'Bengaluru', 'Chennai', 
      'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'
    ],

    // Tier 1 cities
    tier1Cities: [
      'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 
      'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 
      'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 
      'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali',
      'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 
      'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 
      'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior'
    ]
  },

  // Packaging materials costs (optional)
  packaging: {
    box: {
      small: 10,
      medium: 15,
      large: 25,
    },
    bubbleWrap: 5,
    tape: 2,
  },

  // Service codes
  serviceCodes: {
    express: 'E', // Express delivery
    surface: 'S', // Surface delivery (slower, cheaper)
  }
};

/**
 * Get the appropriate API URL based on environment
 */
export const getDelhiveryApiUrl = (): string => {
  return delhiveryConfig.api.isProduction 
    ? delhiveryConfig.api.baseUrl 
    : delhiveryConfig.api.stagingUrl;
};

/**
 * Get estimated delivery time based on city
 */
export const getEstimatedDeliveryTime = (city: string): string => {
  const normalizedCity = city.trim();
  
  if (delhiveryConfig.shipping.metroCities.some(metro => 
    normalizedCity.toLowerCase().includes(metro.toLowerCase())
  )) {
    return delhiveryConfig.shipping.deliveryTimes.metro;
  }
  
  if (delhiveryConfig.shipping.tier1Cities.some(tier1 => 
    normalizedCity.toLowerCase().includes(tier1.toLowerCase())
  )) {
    return delhiveryConfig.shipping.deliveryTimes.tier1;
  }
  
  // Check if it's a tier 2 city (state capitals not in above lists)
  const tier2Keywords = ['capital', 'nagar', 'pur', 'bad'];
  if (tier2Keywords.some(keyword => normalizedCity.toLowerCase().includes(keyword))) {
    return delhiveryConfig.shipping.deliveryTimes.tier2;
  }
  
  return delhiveryConfig.shipping.deliveryTimes.rest;
};

/**
 * Calculate shipping charges based on weight and distance
 * This is a basic calculation - actual rates come from Delhivery API
 */
export const estimateShippingCharges = (weight: number, isMetro: boolean = false): number => {
  const baseRate = 50; // Base rate in Rs.
  const perKgRate = isMetro ? 30 : 40; // Rate per kg
  
  return Math.round(baseRate + (weight * perKgRate));
};

export default delhiveryConfig;
