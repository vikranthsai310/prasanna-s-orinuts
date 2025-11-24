/**
 * Delhivery Shipping Service
 * Handles all Delhivery API interactions for shipment creation, tracking, and rate calculation
 */

import { delhiveryConfig, getDelhiveryApiUrl, getEstimatedDeliveryTime } from '@/config/delhivery';

// Types for Delhivery API
export interface DelhiveryAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email?: string;
}

export interface DelhiveryShipment {
  waybill?: string; // AWB number (if pre-generated)
  name: string; // Consignee name
  add: string; // Address
  pin: string; // Pincode
  city: string;
  state: string;
  country?: string;
  phone: string;
  order: string; // Order ID
  payment_mode: 'Prepaid' | 'COD' | 'Pickup';
  return_pin: string; // Return pincode
  return_city: string;
  return_phone: string;
  return_add: string;
  return_state: string;
  return_country?: string;
  products_desc: string; // Product description
  hsn_code?: string;
  cod_amount?: string; // COD amount if payment_mode is COD
  order_date?: string;
  total_amount: string;
  seller_add: string;
  seller_name: string;
  seller_inv?: string; // Invoice number
  quantity: string;
  waybill_num?: string;
  shipment_width?: string; // in cm
  shipment_height?: string; // in cm
  weight: string; // in kg
  seller_gst_tin?: string;
  shipping_mode?: 'Surface' | 'Express';
  address_type?: 'home' | 'office';
}

export interface DelhiveryShipmentResponse {
  success: boolean;
  waybill?: string;
  packages?: Array<{
    waybill: string;
    status: string;
    client: string;
    sort_code?: string;
  }>;
  rmk?: string;
  cash_amount?: number;
  error?: string;
  message?: string;
}

export interface DelhiveryTrackingResponse {
  ShipmentData: Array<{
    Shipment: {
      Status: {
        Status: string;
        StatusDateTime: string;
        Instructions: string;
        StatusLocation: string;
        StatusType: string;
      };
      PickUpDate: string;
      DestRecieveDate: string;
      ExpectedDeliveryDate: string;
      Destination: string;
      Origin: string;
      Consignee: {
        Name: string;
        Address1: string;
        City: string;
        State: string;
        PinCode: string;
      };
      AWB: string;
      ReferenceNo: string;
    };
  }>;
}

export interface ServiceabilityRequest {
  pickup_pincode: string;
  delivery_pincode: string;
  weight: number; // in kg
  cod?: boolean;
}

export interface ServiceabilityResponse {
  delivery_codes: Array<{
    postal_code: {
      pin: string;
      pre_paid: string; // 'Y' or 'N'
      cash: string; // 'Y' or 'N'
      pickup: string; // 'Y' or 'N'
      cod: string; // 'Y' or 'N'
      is_oda: string; // 'Y' or 'N' (Out of Delivery Area)
      is_odc: string; // 'Y' or 'N' (Out of Delivery Coverage)
    };
  }>;
}

export interface RateCalculationRequest {
  origin: string; // Origin pincode
  destination: string; // Destination pincode
  weight: number; // Weight in kg
  length?: number; // in cm
  breadth?: number; // in cm
  height?: number; // in cm
  mode?: 'Surface' | 'Express';
  cod?: boolean;
}

export interface RateCalculationResponse {
  status: boolean;
  data?: {
    freight_charge: number;
    cod_charges: number;
    total_amount: number;
    delivery_time: string;
  };
  error?: string;
}

/**
 * Create a shipment with Delhivery
 */
export const createDelhiveryShipment = async (
  shipmentData: DelhiveryShipment
): Promise<DelhiveryShipmentResponse> => {
  try {
    const apiUrl = getDelhiveryApiUrl();
    const token = delhiveryConfig.api.token;

    console.log('🔍 Delhivery Configuration Check:');
    console.log('- API URL:', apiUrl);
    console.log('- Token exists:', !!token);
    console.log('- Token length:', token?.length || 0);
    console.log('- Is Production:', delhiveryConfig.api.isProduction);
    console.log('- Client Name:', delhiveryConfig.api.clientName);
    console.log('- Warehouse Pincode:', delhiveryConfig.warehouse.pincode);

    if (!token) {
      console.error('❌ Delhivery API token is missing!');
      console.error('Please set VITE_DELHIVERY_API_TOKEN in your .env file');
      console.error('Get your token from: https://www.delhivery.com/ → Settings → API');
      throw new Error('Delhivery API token is not configured');
    }

    // Format the shipment data according to Delhivery's requirements
    const formattedData = {
      shipments: [
        {
          ...shipmentData,
          country: shipmentData.country || 'India',
          return_country: shipmentData.return_country || 'India',
        },
      ],
      pickup_location: {
        name: delhiveryConfig.warehouse.name,
        add: delhiveryConfig.warehouse.address,
        city: delhiveryConfig.warehouse.city,
        pin_code: delhiveryConfig.warehouse.pincode,
        country: 'India',
        phone: delhiveryConfig.warehouse.phone,
      },
    };

    console.log('📦 Creating Delhivery shipment...');
    console.log('- Order ID:', shipmentData.order);
    console.log('- Destination Pincode:', shipmentData.pin);
    console.log('- Weight:', shipmentData.weight);
    console.log('- Payment Mode:', shipmentData.payment_mode);

    const requestUrl = `${apiUrl}/cmu/create.json`;
    const requestBody = { format: 'json', data: formattedData };
    
    console.log('🌐 API Request:', requestUrl);
    console.log('📝 Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Delhivery API Error Response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      throw new Error(errorData.message || `Failed to create shipment: ${response.statusText}`);
    }

    const result: DelhiveryShipmentResponse = await response.json();
    
    console.log('✅ Delhivery API Response:', JSON.stringify(result, null, 2));

    if (!result.success && result.error) {
      console.error('❌ Shipment creation failed:', result.error);
      throw new Error(result.error);
    }

    if (result.waybill) {
      console.log('✅ Shipment created successfully! Waybill:', result.waybill);
    }

    return result;
  } catch (error) {
    console.error('Delhivery shipment creation error:', error);
    throw error;
  }
};

/**
 * Track a shipment by waybill number
 */
export const trackShipment = async (waybill: string): Promise<DelhiveryTrackingResponse> => {
  try {
    const apiUrl = getDelhiveryApiUrl();
    const token = delhiveryConfig.api.token;

    if (!token) {
      throw new Error('Delhivery API token is not configured');
    }

    const response = await fetch(
      `${apiUrl}/v1/packages/json/?waybill=${waybill}&token=${token}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to track shipment: ${response.statusText}`);
    }

    const result: DelhiveryTrackingResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Delhivery tracking error:', error);
    throw error;
  }
};

/**
 * Check serviceability for a pincode
 */
export const checkServiceability = async (
  request: ServiceabilityRequest
): Promise<ServiceabilityResponse> => {
  try {
    const apiUrl = getDelhiveryApiUrl();
    const token = delhiveryConfig.api.token;

    if (!token) {
      throw new Error('Delhivery API token is not configured');
    }

    const params = new URLSearchParams({
      token,
      pickup_pincode: request.pickup_pincode,
      delivery_pincode: request.delivery_pincode,
      weight: request.weight.toString(),
      cod: request.cod ? '1' : '0',
    });

    const response = await fetch(`${apiUrl}/c/api/pin-codes/json/?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check serviceability: ${response.statusText}`);
    }

    const result: ServiceabilityResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Delhivery serviceability check error:', error);
    throw error;
  }
};

/**
 * Calculate shipping rates
 */
export const calculateShippingRate = async (
  request: RateCalculationRequest
): Promise<RateCalculationResponse> => {
  try {
    const apiUrl = getDelhiveryApiUrl();
    const token = delhiveryConfig.api.token;

    if (!token) {
      throw new Error('Delhivery API token is not configured');
    }

    // Check serviceability first
    const serviceability = await checkServiceability({
      pickup_pincode: request.origin,
      delivery_pincode: request.destination,
      weight: request.weight,
      cod: request.cod,
    });

    if (!serviceability.delivery_codes || serviceability.delivery_codes.length === 0) {
      return {
        status: false,
        error: 'Delivery not available for this pincode',
      };
    }

    const pincodeData = serviceability.delivery_codes[0].postal_code;

    // Check if COD is available
    if (request.cod && pincodeData.cod === 'N') {
      return {
        status: false,
        error: 'COD not available for this pincode',
      };
    }

    // Calculate estimated charges
    // Note: Delhivery doesn't have a direct rate API, so we use estimates
    const baseRate = 50;
    const perKgRate = pincodeData.is_oda === 'Y' ? 60 : 40;
    const freightCharge = baseRate + request.weight * perKgRate;

    const codCharges = request.cod ? delhiveryConfig.shipping.codCharges : 0;
    const totalAmount = freightCharge + codCharges;

    // Estimate delivery time based on city
    const deliveryTime = getEstimatedDeliveryTime(pincodeData.pin);

    return {
      status: true,
      data: {
        freight_charge: Math.round(freightCharge),
        cod_charges: codCharges,
        total_amount: Math.round(totalAmount),
        delivery_time: deliveryTime,
      },
    };
  } catch (error) {
    console.error('Delhivery rate calculation error:', error);
    return {
      status: false,
      error: error instanceof Error ? error.message : 'Failed to calculate rates',
    };
  }
};

/**
 * Generate waybill (AWB) number
 * Note: This requires a separate Delhivery API call and account setup
 */
export const generateWaybill = async (count: number = 1): Promise<string[]> => {
  try {
    const apiUrl = getDelhiveryApiUrl();
    const token = delhiveryConfig.api.token;

    if (!token) {
      throw new Error('Delhivery API token is not configured');
    }

    const params = new URLSearchParams({
      token,
      count: count.toString(),
    });

    const response = await fetch(`${apiUrl}/waybill/api/bulk/json/?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to generate waybill: ${response.statusText}`);
    }

    const result = await response.json();
    return result.waybills || [];
  } catch (error) {
    console.error('Delhivery waybill generation error:', error);
    throw error;
  }
};

/**
 * Calculate package weight based on items
 */
export const calculatePackageWeight = (items: any[]): number => {
  let totalWeight = 0.1; // Base packaging weight

  items.forEach((item) => {
    let itemWeight = 0;

    if (item.weight) {
      const weightValue = parseFloat(item.weight.replace(/[^\d.]/g, ''));
      itemWeight = (weightValue / 1000) * item.quantity;
    } else {
      itemWeight = 0.3 * item.quantity; // Default 300g per item
    }

    totalWeight += itemWeight;
  });

  return Math.max(totalWeight, 0.5); // Minimum 500g
};

/**
 * Calculate package dimensions based on items
 */
export const calculatePackageDimensions = (items: any[]): { length: number; breadth: number; height: number } => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (itemCount <= 2) {
    return { length: 20, breadth: 15, height: 10 };
  } else if (itemCount <= 5) {
    return { length: 25, breadth: 20, height: 15 };
  } else {
    return { length: 30, breadth: 25, height: 20 };
  }
};

export default {
  createDelhiveryShipment,
  trackShipment,
  checkServiceability,
  calculateShippingRate,
  generateWaybill,
  calculatePackageWeight,
  calculatePackageDimensions,
};
