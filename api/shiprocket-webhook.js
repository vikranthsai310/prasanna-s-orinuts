/**
 * Shiprocket Webhook Handler
 * Automatically updates order status when Shiprocket sends status updates
 * AND sends email notifications to customers
 * 
 * Webhook Events:
 * - order_shipped: When order is picked up and shipped
 * - order_delivered: When order is delivered to customer
 * - order_cancelled: When order is cancelled
 * - order_rto: When order is returned to origin
 */

import { logger } from './_utils/logger.js';

// Base URL for internal API calls
const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : process.env.BASE_URL || 'https://prasannaorchards.com';

// Initialize Firebase Admin
let admin = null;
let db = null;

async function initFirebase() {
  if (admin) return db;
  
  try {
    const adminModule = await import('firebase-admin');
    admin = adminModule.default;
    
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    
    db = admin.firestore();
    return db;
  } catch (error) {
    logger.error('SHIPROCKET-WEBHOOK', 'Firebase initialization failed', error);
    throw error;
  }
}

/**
 * Send email notification to customer about order status change
 */
async function sendStatusEmail(order, emailType, trackingInfo = {}) {
  try {
    const emailPayload = {
      orderId: order.id,
      customerName: order.shippingAddress?.name || 'Valued Customer',
      customerEmail: order.shippingAddress?.email,
      items: order.items || [],
      totalAmount: order.totalAmount || 0,
      shippingAddress: order.shippingAddress || {},
      paymentId: order.paymentId || '',
      orderDate: order.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || 
                 order.createdAt?._seconds ? new Date(order.createdAt._seconds * 1000).toLocaleDateString('en-IN') :
                 new Date().toLocaleDateString('en-IN'),
      shippingCharges: order.shippingCharges || 0,
      trackingId: trackingInfo.awbCode || order.trackingId || order.shiprocketAwbCode || '',
      courierName: trackingInfo.courierName || order.courierName || '',
      estimatedDelivery: trackingInfo.estimatedDelivery || '',
      emailType: emailType,
    };

    // Only send if customer has email
    if (!emailPayload.customerEmail) {
      logger.warn('SHIPROCKET-WEBHOOK', 'No customer email found, skipping email notification');
      return { skipped: true, reason: 'No customer email' };
    }

    logger.info('SHIPROCKET-WEBHOOK', `Sending ${emailType} email`, {
      orderId: order.id,
      email: emailPayload.customerEmail
    });

    const response = await fetch(`${BASE_URL}/api/send-order-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (response.ok) {
      const result = await response.json();
      logger.success('SHIPROCKET-WEBHOOK', `${emailType} email sent successfully`, { emailId: result.emailId });
      return result;
    } else {
      const errorData = await response.json();
      logger.error('SHIPROCKET-WEBHOOK', `Failed to send ${emailType} email`, errorData);
      return { error: errorData };
    }
  } catch (error) {
    logger.error('SHIPROCKET-WEBHOOK', `Error sending ${emailType} email`, error);
    return { error: error.message };
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initFirebase();
    
    logger.info('SHIPROCKET-WEBHOOK', 'Webhook received', req.body);

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
      tracking_url,
      etd // Estimated time of delivery
    } = webhookData;

    if (!order_id) {
      logger.error('SHIPROCKET-WEBHOOK', 'No order_id in webhook data');
      return res.status(400).json({ error: 'Missing order_id' });
    }

    // Map Shiprocket status to our order status and email type
    const statusMapping = {
      'SHIPPED': { orderStatus: 'shipped', emailType: 'shipped' },
      'IN TRANSIT': { orderStatus: 'shipped', emailType: null }, // Don't email for every transit update
      'OUT FOR DELIVERY': { orderStatus: 'shipped', emailType: null },
      'DELIVERED': { orderStatus: 'delivered', emailType: 'delivered' },
      'CANCELLED': { orderStatus: 'cancelled', emailType: 'cancelled' },
      'RTO': { orderStatus: 'cancelled', emailType: 'cancelled' },
      'RTO DELIVERED': { orderStatus: 'cancelled', emailType: null },
      'PICKUP SCHEDULED': { orderStatus: 'processing', emailType: null }
    };

    const statusConfig = statusMapping[current_status] || { orderStatus: 'processing', emailType: null };
    const { orderStatus, emailType } = statusConfig;

    // Find order in Firestore - try by shiprocketOrderId first, then by id
    const ordersRef = db.collection('orders');
    let snapshot = await ordersRef.where('shiprocketOrderId', '==', parseInt(order_id)).limit(1).get();
    
    // If not found, try by document ID
    if (snapshot.empty) {
      snapshot = await ordersRef.where('id', '==', order_id).limit(1).get();
    }
    
    // If still not found, try direct document lookup
    if (snapshot.empty) {
      const directDoc = await ordersRef.doc(order_id).get();
      if (directDoc.exists) {
        snapshot = { docs: [directDoc], empty: false };
      }
    }

    if (snapshot.empty) {
      logger.error('SHIPROCKET-WEBHOOK', 'Order not found', { order_id });
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderDoc = snapshot.docs[0];
    const orderData = { id: orderDoc.id, ...orderDoc.data() };
    const previousStatus = orderData.orderStatus;

    // Prepare update data
    const updateData = {
      orderStatus: orderStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add AWB code if provided
    if (awb_code && !orderData.shiprocketAwbCode) {
      updateData.shiprocketAwbCode = awb_code;
      updateData.trackingId = awb_code; // Also set as tracking ID
    }

    // Add courier name if provided
    if (courier_name && !orderData.courierName) {
      updateData.courierName = courier_name;
    }

    // Add tracking URL if provided
    if (tracking_url) {
      updateData.trackingUrl = tracking_url;
    }

    // Update order in Firestore
    await orderDoc.ref.update(updateData);

    logger.success('SHIPROCKET-WEBHOOK', 'Order status updated', {
      orderId: orderDoc.id,
      previousStatus,
      newStatus: orderStatus,
      awbCode: awb_code,
      courier: courier_name
    });

    // Send email notification if status changed to shipped or delivered
    let emailResult = null;
    if (emailType && previousStatus !== orderStatus) {
      emailResult = await sendStatusEmail(orderData, emailType, {
        awbCode: awb_code,
        courierName: courier_name,
        estimatedDelivery: etd || ''
      });
    }

    // Send success response to Shiprocket
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      orderId: orderDoc.id,
      previousStatus,
      newStatus: orderStatus,
      emailSent: emailResult ? !emailResult.error : false
    });

  } catch (error) {
    logger.error('SHIPROCKET-WEBHOOK', 'Webhook processing error', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
