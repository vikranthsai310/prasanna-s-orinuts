// Vercel Serverless Function for calculating shipping rates via Shiprocket
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

// Store auth token globally (in production, use proper token management like Redis)
let authToken = null;
let tokenExpiry = null;

// Authenticate with Shiprocket
const authenticateShiprocket = async () => {
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
        email: process.env.SHIPROCKET_USERNAME,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.token) {
      authToken = data.token;
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

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      pickupPincode, 
      deliveryPincode, 
      weight, 
      isCod = false 
    } = req.body;

    // Validate the data
    if (!pickupPincode || !deliveryPincode || !weight) {
      return res.status(400).json({ 
        error: 'Missing required fields: pickupPincode, deliveryPincode, weight' 
      });
    }

    // Authenticate with Shiprocket
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
    
    // Process and return shipping options
    const shippingOptions = [];
    
    if (result.data && result.data.available_courier_companies) {
      result.data.available_courier_companies.forEach(courier => {
        shippingOptions.push({
          courier_name: courier.courier_name,
          courier_company_id: courier.courier_company_id,
          freight_charge: courier.freight_charge,
          cod_charges: courier.cod_charges,
          other_charges: courier.other_charges,
          total_charge: courier.rate,
          estimated_delivery_days: courier.estimated_delivery_days,
          pickup_availability: courier.pickup_availability,
          delivery_availability: courier.delivery_availability,
        });
      });
    }
    
    return res.status(200).json({
      success: true,
      serviceable: shippingOptions.length > 0,
      pickup_postcode: pickupPincode,
      delivery_postcode: deliveryPincode,
      weight: weight,
      cod: isCod,
      shipping_options: shippingOptions,
      recommended: shippingOptions.length > 0 ? shippingOptions[0] : null,
    });
  } catch (error) {
    console.error('Error calculating shipping rates:', error);
    return res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
}