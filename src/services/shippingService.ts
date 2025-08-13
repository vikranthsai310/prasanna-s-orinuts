import { Order, Address } from './orderService';

// Shiprocket API Configuration
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
const SHIPROCKET_USERNAME = process.env.VITE_SHIPROCKET_USERNAME || 'your_shiprocket_username';
const SHIPROCKET_PASSWORD = process.env.VITE_SHIPROCKET_PASSWORD || 'your_shiprocket_password';

// Types for Shiprocket API
export interface ShiprocketAuth {
  token: string;
  expires_at: string;
}

export interface ShiprocketOrder {
  order_id: string;
  order_date: string;
  pickup_location: string;
  channel_id: string;
  comment?: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: ShiprocketOrderItem[];
  payment_method: 'COD' | 'Prepaid';
  shipping_charges?: number;
  giftwrap_charges?: number;
  transaction_charges?: number;
  total_discount?: number;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: string;
}

export interface ShiprocketResponse {
  status_code: number;
  message: string;
  order_id?: number;
  shipment_id?: number;
  awb_code?: string;
  courier_company_id?: number;
  courier_name?: string;
}

export interface RateCalculationRequest {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number;
  cod: 0 | 1;
}

export interface CourierServiceability {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number;
  cod: 0 | 1;
}

// Store auth token globally (in production, use proper token management)
let authToken: string | null = null;
let tokenExpiry: Date | null = null;

// Authenticate with Shiprocket
export const authenticateShiprocket = async (): Promise<string> => {
  try {
    // Check if we have a valid token
    if (authToken && tokenExpiry && new Date() < tokenExpiry) {
      return authToken;
    }

    const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: SHIPROCKET_USERNAME,
        password: SHIPROCKET_PASSWORD,
      }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.token) {
      authToken = data.token;
      // Token usually expires in 10 days, but we'll refresh it more frequently
      tokenExpiry = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000); // 8 days
      return authToken;
    } else {
      throw new Error('No token received from Shiprocket');
    }
  } catch (error) {
    console.error('Shiprocket authentication error:', error);
    throw error;
  }
};

// Create order in Shiprocket
export const createShiprocketOrder = async (
  order: Order,
  pickupLocation: string = 'Primary'
): Promise<ShiprocketResponse> => {
  try {
    const token = await authenticateShiprocket();
    
    // Calculate package dimensions and weight
    const packageWeight = calculatePackageWeight(order.items);
    const packageDimensions = calculatePackageDimensions(order.items);
    
    // Prepare Shiprocket order data
    const shiprocketOrder: ShiprocketOrder = {
      order_id: order.id,
      order_date: order.createdAt.toDate().toISOString().split('T')[0],
      pickup_location: pickupLocation,
      channel_id: '5043677', // Replace with your channel ID from Shiprocket dashboard
      comment: 'Premium Orchard Order',
      billing_customer_name: order.shippingAddress.name,
      billing_address: order.shippingAddress.street,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: 'India',
      billing_email: 'orders@prasannaorinut.com', // Use business email for billing
      billing_phone: order.shippingAddress.phone,
      shipping_is_billing: true,
      order_items: order.items.map(item => ({
        name: item.name,
        sku: item.id,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: '08134000', // HSN code for dried fruits and nuts
      })),
      payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      sub_total: order.totalAmount,
      length: packageDimensions.length,
      breadth: packageDimensions.breadth,
      height: packageDimensions.height,
      weight: packageWeight,
    };

    const response = await fetch(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(shiprocketOrder),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Shiprocket order creation failed: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating Shiprocket order:', error);
    throw error;
  }
};

// Calculate shipping rates
export const calculateShippingRates = async (
  pickupPincode: string,
  deliveryPincode: string,
  weight: number,
  isCod: boolean = false
): Promise<any> => {
  try {
    const token = await authenticateShiprocket();
    
    const params = new URLSearchParams({
      pickup_postcode: pickupPincode,
      delivery_postcode: deliveryPincode,
      weight: weight.toString(),
      cod: isCod ? '1' : '0',
    });

    const response = await fetch(
      `${SHIPROCKET_BASE_URL}/courier/serviceability/?${params}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to calculate shipping rates: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error calculating shipping rates:', error);
    throw error;
  }
};

// Track shipment
export const trackShipment = async (awbCode: string): Promise<any> => {
  try {
    const token = await authenticateShiprocket();
    
    const response = await fetch(
      `${SHIPROCKET_BASE_URL}/courier/track/awb/${awbCode}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to track shipment: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error tracking shipment:', error);
    throw error;
  }
};

// Check serviceability
export const checkServiceability = async (
  pickupPincode: string,
  deliveryPincode: string,
  weight: number,
  isCod: boolean = false
): Promise<boolean> => {
  try {
    const rates = await calculateShippingRates(pickupPincode, deliveryPincode, weight, isCod);
    return rates && rates.data && rates.data.available_courier_companies && 
           rates.data.available_courier_companies.length > 0;
  } catch (error) {
    console.error('Error checking serviceability:', error);
    return false;
  }
};

// Helper function to calculate package weight
const calculatePackageWeight = (items: any[]): number => {
  // Base weight for packaging
  let totalWeight = 0.1; // 100g base packaging
  
  items.forEach(item => {
    // Estimate weight based on product type and quantity
    let itemWeight = 0;
    
    if (item.weight) {
      // If weight is specified in the item
      const weightValue = parseFloat(item.weight.replace(/[^\d.]/g, ''));
      itemWeight = (weightValue / 1000) * item.quantity; // Convert to kg
    } else {
      // Default weight estimation (300g per item)
      itemWeight = 0.3 * item.quantity;
    }
    
    totalWeight += itemWeight;
  });
  
  return Math.max(totalWeight, 0.5); // Minimum 500g
};

// Helper function to calculate package dimensions
const calculatePackageDimensions = (items: any[]): { length: number; breadth: number; height: number } => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Base dimensions in cm
  if (itemCount <= 2) {
    return { length: 20, breadth: 15, height: 10 };
  } else if (itemCount <= 5) {
    return { length: 25, breadth: 20, height: 15 };
  } else {
    return { length: 30, breadth: 25, height: 20 };
  }
};

// Get pickup locations
export const getPickupLocations = async (): Promise<any> => {
  try {
    const token = await authenticateShiprocket();
    
    const response = await fetch(
      `${SHIPROCKET_BASE_URL}/settings/company/pickup`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get pickup locations: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting pickup locations:', error);
    throw error;
  }
};

// Cancel shipment
export const cancelShipment = async (awbCode: string): Promise<any> => {
  try {
    const token = await authenticateShiprocket();
    
    const response = await fetch(
      `${SHIPROCKET_BASE_URL}/orders/cancel/shipment/awbs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          awbs: [awbCode]
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to cancel shipment: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error cancelling shipment:', error);
    throw error;
  }
};