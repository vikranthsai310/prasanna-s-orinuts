/**
 * Shiprocket API Configuration
 * Centralized configuration for Shiprocket logistics integration
 */

export const shiprocketConfig = {
  api: {
    // Shiprocket API Base URL
    baseUrl: 'https://apiv2.shiprocket.in/v1/external',
    
    // Authentication credentials
    email: import.meta.env.VITE_SHIPROCKET_EMAIL || '',
    password: import.meta.env.VITE_SHIPROCKET_PASSWORD || '',
    
    // Channel ID from Shiprocket dashboard
    channelId: import.meta.env.VITE_SHIPROCKET_CHANNEL_ID || '',
  },

  // Warehouse/Pickup Configuration
  warehouse: {
    name: 'Prasannas Orinuts Warehouse',
    pincode: '500018',
    address: 'Shiv Nivas Opposite Road no-7 Pragathinagar moosapet',
    address2: '',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    phone: '9398649506',
    email: 'prasannasorinuts@gmail.com',
    contactPerson: 'Prasanna',
  },

  // Default shipment settings
  defaults: {
    paymentMode: 'Prepaid', // 'Prepaid' or 'COD'
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

  // Shipping options
  shipping: {
    freeShippingThreshold: 500, // Rs. 500
    
    // Estimated delivery times by region
    deliveryTimes: {
      metro: '2-3 days',
      tier1: '3-4 days',
      tier2: '4-6 days',
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

  // Packaging preferences
  packaging: {
    // Eco-friendly packaging
    ecoFriendly: true,
    // Fragile item handling
    fragileHandling: false,
  },

  // Service preferences
  services: {
    // Enable shipment tracking
    trackingEnabled: true,
    // Enable pickup scheduling
    pickupEnabled: true,
    // Enable COD
    codEnabled: true,
    // Insurance
    insuranceEnabled: false,
  }
};

// Helper function to get pickup location name
export const getPickupLocationName = (): string => {
  return shiprocketConfig.warehouse.name;
};

// Helper function to get estimated delivery time based on city
export const getEstimatedDeliveryTime = (city: string): string => {
  const normalizedCity = city.trim();
  
  if (shiprocketConfig.shipping.metroCities.some(c => 
    normalizedCity.toLowerCase().includes(c.toLowerCase())
  )) {
    return shiprocketConfig.shipping.deliveryTimes.metro;
  }
  
  if (shiprocketConfig.shipping.tier1Cities.some(c => 
    normalizedCity.toLowerCase().includes(c.toLowerCase())
  )) {
    return shiprocketConfig.shipping.deliveryTimes.tier1;
  }
  
  // Default to tier2 for other cities
  return shiprocketConfig.shipping.deliveryTimes.tier2;
};

// Validate Shiprocket configuration
export const validateShiprocketConfig = (): boolean => {
  const { email, password, channelId } = shiprocketConfig.api;
  
  if (!email || !password) {
    console.error('❌ Shiprocket credentials are not configured');
    return false;
  }
  
  if (!channelId) {
    console.warn('⚠️ Shiprocket channel ID is not configured');
  }
  
  return true;
};

export default shiprocketConfig;
