// Vercel Serverless Function for creating Delhivery shipments
import { requireAuth } from './_middleware/auth.js';
import { logger } from './_utils/logger.js';

// Backend environment variables (no VITE_ prefix)
const DELHIVERY_API_URL = process.env.DELHIVERY_API_URL || 'https://track.delhivery.com/api';
const DELHIVERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN || process.env.VITE_DELHIVERY_API_TOKEN;

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
    const { order } = req.body;

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

    if (!DELHIVERY_API_TOKEN) {
      throw new Error('Delhivery API token is not configured');
    }

    // Calculate package dimensions and weight
    const packageWeight = calculatePackageWeight(order.items);
    const packageDimensions = calculatePackageDimensions(order.items);
    
    // Prepare product description
    const productDesc = order.items.map(item => `${item.name} (${item.quantity})`).join(', ');
    
    // Get warehouse details from environment (try both with and without VITE_ prefix)
    const warehouseName = process.env.DELHIVERY_WAREHOUSE_NAME || process.env.VITE_DELHIVERY_WAREHOUSE_NAME || 'Premium Orchard';
    const warehouseAddress = process.env.DELHIVERY_PICKUP_ADDRESS || process.env.VITE_DELHIVERY_PICKUP_ADDRESS || '';
    const warehouseCity = process.env.DELHIVERY_PICKUP_CITY || process.env.VITE_DELHIVERY_PICKUP_CITY || '';
    const warehouseState = process.env.DELHIVERY_PICKUP_STATE || process.env.VITE_DELHIVERY_PICKUP_STATE || '';
    const warehousePincode = process.env.DELHIVERY_PICKUP_PINCODE || process.env.VITE_DELHIVERY_PICKUP_PINCODE || '110001';
    const warehousePhone = process.env.DELHIVERY_PICKUP_PHONE || process.env.VITE_DELHIVERY_PICKUP_PHONE || '';

    // Prepare Delhivery shipment data
    const delhiveryShipment = {
      name: order.shippingAddress.name,
      add: order.shippingAddress.street,
      pin: order.shippingAddress.pincode,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      country: 'India',
      phone: order.shippingAddress.phone,
      order: order.id,
      payment_mode: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      return_pin: warehousePincode,
      return_city: warehouseCity,
      return_phone: warehousePhone,
      return_add: warehouseAddress,
      return_state: warehouseState,
      return_country: 'India',
      products_desc: productDesc,
      hsn_code: '08134000', // HSN code for dried fruits and nuts
      cod_amount: order.paymentMethod === 'cod' ? order.totalAmount.toString() : '0',
      order_date: new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : Date.now()).toISOString().split('T')[0],
      total_amount: order.totalAmount.toString(),
      seller_add: warehouseAddress,
      seller_name: warehouseName,
      seller_inv: order.id,
      quantity: order.items.reduce((sum, item) => sum + item.quantity, 0).toString(),
      weight: packageWeight.toString(),
      shipment_width: packageDimensions.breadth.toString(),
      shipment_height: packageDimensions.height.toString(),
      shipping_mode: 'Express',
      address_type: 'home',
    };

    // Format the data for Delhivery API
    const formData = {
      format: 'json',
      data: {
        shipments: [delhiveryShipment],
        pickup_location: {
          name: warehouseName,
          add: warehouseAddress,
          city: warehouseCity,
          pin_code: warehousePincode,
          country: 'India',
          phone: warehousePhone,
        },
      },
    };

    // Create shipment in Delhivery
    const response = await fetch(`${DELHIVERY_API_URL}/cmu/create.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${DELHIVERY_API_TOKEN}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('CREATE-SHIPMENT', `Delhivery API error: ${response.statusText}`, null, { errorText });
      throw new Error(`Delhivery shipment creation failed: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    // Check if shipment was successful
    if (!result.success && result.error) {
      throw new Error(result.error);
    }

    // Extract waybill number
    const waybill = result.waybill || (result.packages && result.packages[0]?.waybill);
    
    // Return the shipment details
    return res.status(200).json({
      success: true,
      data: result,
      waybill: waybill,
      order_id: order.id,
      message: result.rmk || 'Shipment created successfully',
    });
  } catch (error) {
    logger.error('CREATE-SHIPMENT', 'Error creating Delhivery shipment', error);
    
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