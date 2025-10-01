// Vercel Serverless Function for creating Shiprocket shipments
import { requireAuth } from './_middleware/auth.js';

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

// Helper function to calculate package weight
const calculatePackageWeight = (items) => {
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
const calculatePackageDimensions = (items) => {
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

async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔐 Create shipment request from user:', req.user.uid);
    
    const { order, pickupLocation = 'Primary' } = req.body;

    // Validate the data
    if (!order || !order.id || !order.items || !order.shippingAddress) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    // 🔐 Verify user owns the order
    if (order.userId && order.userId !== req.user.uid && !req.user.isAdmin) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You do not have permission to create shipment for this order'
      });
    }

    // Authenticate with Shiprocket
    const token = await authenticateShiprocket();
    
    // Calculate package dimensions and weight
    const packageWeight = calculatePackageWeight(order.items);
    const packageDimensions = calculatePackageDimensions(order.items);
    
    // Prepare Shiprocket order data
    const shiprocketOrder = {
      order_id: order.id,
      order_date: new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : Date.now()).toISOString().split('T')[0],
      pickup_location: pickupLocation,
      channel_id: process.env.SHIPROCKET_CHANNEL_ID || '5043677', // Replace with your channel ID
      comment: 'Premium Orchard Order',
      billing_customer_name: order.shippingAddress.name,
      billing_address: order.shippingAddress.street,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: 'India',
      billing_email: order.userId,
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

    // Create order in Shiprocket
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
    
    // Return the shipment details
    return res.status(200).json({
      success: true,
      data: result,
      order_id: result.order_id,
      shipment_id: result.shipment_id,
      awb_code: result.awb_code,
      courier_name: result.courier_name,
    });
  } catch (error) {
    console.error('❌ Error creating Shiprocket shipment:', error);
    
    if (error.message.includes('permission') || error.message.includes('Forbidden')) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: error.message,
        success: false
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to create shipment',
      message: error.message,
      success: false 
    });
  }
}

// 🔐 Wrap handler with authentication middleware
export default requireAuth(handler);