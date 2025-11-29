/**
 * Shiprocket Webhook Handler
 * Automatically updates order status when Shiprocket sends status updates
 * 
 * Webhook Events:
 * - order_shipped: When order is picked up and shipped
 * - order_delivered: When order is delivered to customer
 * - order_cancelled: When order is cancelled
 * - order_rto: When order is returned to origin
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Shiprocket webhook received:', req.body);

    const webhookData = req.body;
    
    // Extract order information from webhook
    const {
      order_id,
      awb_code,
      shipment_id,
      current_status,
      courier_name,
      delivered_date,
      pickup_scheduled_date,
      status,
      tracking_url
    } = webhookData;

    if (!order_id) {
      console.error('❌ No order_id in webhook data');
      return res.status(400).json({ error: 'Missing order_id' });
    }

    // Map Shiprocket status to our order status
    const statusMapping = {
      'SHIPPED': 'shipped',
      'OUT FOR DELIVERY': 'shipped',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled',
      'RTO': 'cancelled',
      'RTO DELIVERED': 'cancelled',
      'PICKUP SCHEDULED': 'processing'
    };

    const orderStatus = statusMapping[current_status] || 'processing';

    // Find order in Firestore by order_id
    const ordersRef = db.collection('orders');
    const snapshot = await ordersRef.where('id', '==', order_id).limit(1).get();

    if (snapshot.empty) {
      console.error('❌ Order not found:', order_id);
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderDoc = snapshot.docs[0];
    const updateData = {
      orderStatus: orderStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add AWB code if provided
    if (awb_code && !orderDoc.data().shiprocketAwbCode) {
      updateData.shiprocketAwbCode = awb_code;
    }

    // Add courier name if provided
    if (courier_name && !orderDoc.data().courierName) {
      updateData.courierName = courier_name;
    }

    // Add tracking URL if provided
    if (tracking_url && !orderDoc.data().trackingId) {
      updateData.trackingId = tracking_url;
    }

    // Update order in Firestore
    await orderDoc.ref.update(updateData);

    console.log('✅ Order updated successfully:', {
      orderId: order_id,
      status: orderStatus,
      awbCode: awb_code,
      courier: courier_name
    });

    // Send success response to Shiprocket
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      orderId: order_id,
      status: orderStatus
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
