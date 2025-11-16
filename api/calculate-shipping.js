// Vercel Serverless Function for calculating shipping rates via Delhivery
import { requireAuth } from './_middleware/auth.js';
import { logger } from './_utils/logger.js';

const DELHIVERY_API_URL = process.env.DELHIVERY_API_URL || 'https://track.delhivery.com/api';
const DELHIVERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN;

/**
 * Check serviceability for a pincode pair
 */
const checkServiceability = async (pickupPincode, deliveryPincode, weight, cod = false) => {
  try {
    if (!DELHIVERY_API_TOKEN) {
      throw new Error('Delhivery API token is not configured');
    }

    const params = new URLSearchParams({
      token: DELHIVERY_API_TOKEN,
      pickup_pincode: pickupPincode,
      delivery_pincode: deliveryPincode,
      weight: weight.toString(),
      cod: cod ? '1' : '0',
    });

    const response = await fetch(`${DELHIVERY_API_URL}/c/api/pin-codes/json/?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Serviceability check failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    logger.error('DELHIVERY', 'Serviceability check error', error);
    throw error;
  }
};

/**
 * Get estimated delivery time based on city
 */
const getEstimatedDeliveryTime = (city) => {
  const metroCities = ['Delhi', 'Mumbai', 'Bangalore', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
  const tier1Cities = ['Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam'];

  const normalizedCity = city.trim().toLowerCase();

  if (metroCities.some(metro => normalizedCity.includes(metro.toLowerCase()))) {
    return '1-2 days';
  }

  if (tier1Cities.some(tier1 => normalizedCity.includes(tier1.toLowerCase()))) {
    return '2-3 days';
  }

  return '3-5 days';
};

/**
 * Calculate shipping rate based on weight and serviceability
 */
const calculateRate = (weight, isODA, isCOD) => {
  const baseRate = 50; // Base rate in Rs.
  const perKgRate = isODA ? 60 : 40; // Higher rate for ODA (Out of Delivery Area)
  const freightCharge = baseRate + (weight * perKgRate);
  
  const codCharges = isCOD ? 50 : 0;
  const totalAmount = freightCharge + codCharges;

  return {
    freight_charge: Math.round(freightCharge),
    cod_charges: codCharges,
    total_amount: Math.round(totalAmount),
  };
};

async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      pickupPincode,
      deliveryPincode,
      weight,
      cod = false,
    } = req.body;

    // Validate required fields
    if (!pickupPincode || !deliveryPincode || !weight) {
      return res.status(400).json({
        error: 'Missing required fields: pickupPincode, deliveryPincode, weight',
      });
    }

    // Validate pincode format (Indian pincodes are 6 digits)
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pickupPincode) || !pincodeRegex.test(deliveryPincode)) {
      return res.status(400).json({
        error: 'Invalid pincode format. Pincode must be 6 digits.',
      });
    }

    // Validate weight
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      return res.status(400).json({
        error: 'Invalid weight. Weight must be a positive number.',
      });
    }

    // Check serviceability
    const serviceability = await checkServiceability(
      pickupPincode,
      deliveryPincode,
      weightNum,
      cod
    );

    if (!serviceability.delivery_codes || serviceability.delivery_codes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Delivery not available for this pincode',
        serviceable: false,
      });
    }

    const pincodeData = serviceability.delivery_codes[0].postal_code;

    // Check if delivery is available
    if (pincodeData.pre_paid !== 'Y' && pincodeData.cash !== 'Y') {
      return res.status(400).json({
        success: false,
        error: 'Delivery not available for this pincode',
        serviceable: false,
      });
    }

    // Check if COD is available when requested
    if (cod && pincodeData.cod !== 'Y') {
      return res.status(400).json({
        success: false,
        error: 'COD not available for this pincode. Please use prepaid payment.',
        serviceable: true,
        codAvailable: false,
      });
    }

    // Calculate rates
    const isODA = pincodeData.is_oda === 'Y';
    const rates = calculateRate(weightNum, isODA, cod);

    // Get estimated delivery time
    const deliveryTime = getEstimatedDeliveryTime(pincodeData.pin);

    // Return shipping options
    const response = {
      success: true,
      serviceable: true,
      codAvailable: pincodeData.cod === 'Y',
      isODA: isODA,
      shippingOptions: [
        {
          id: 'delhivery_express',
          name: 'Delhivery Express',
          provider: 'Delhivery',
          deliveryTime: deliveryTime,
          freight_charge: rates.freight_charge,
          cod_charges: rates.cod_charges,
          total_amount: rates.total_amount,
          currency: 'INR',
          serviceType: 'Express',
        },
      ],
      pincodeInfo: {
        deliveryPincode: pincodeData.pin,
        isODA: isODA,
        codAvailable: pincodeData.cod === 'Y',
        prepaidAvailable: pincodeData.pre_paid === 'Y',
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    logger.error('SHIPPING', 'Error calculating shipping rates', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate shipping rates',
      message: error.message,
    });
  }
}

// 🔐 Wrap handler with authentication middleware
export default requireAuth(handler);