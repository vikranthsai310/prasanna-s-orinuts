// Vercel Serverless Function for verifying Razorpay payments
import crypto from 'crypto';
import { requireAuth, verifyOwnership } from './_middleware/auth.js';
import { logger } from './_utils/logger.js';
import { checkRateLimitForRequest } from './_middleware/rateLimit.js';
import { setSecurityHeaders } from './_middleware/securityHeaders.js';

// Base URL for internal API calls
const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.BASE_URL || 'https://prasannaorchards.com';

// Initialize Firebase Firestore for order updates
let db = null;

// Only try to initialize Firebase Admin if service account is provided
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const { initializeApp, cert, getApps } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');

    if (getApps().length === 0) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      const app = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || "orinut-494cc"
      });
      db = getFirestore(app);
    } else {
      const { getFirestore } = await import('firebase-admin/firestore');
      db = getFirestore();
    }
  } catch (error) {
    logger.error('VERIFY-PAYMENT', 'Firebase Admin initialization failed', error);
  }
}

// Shiprocket API Configuration
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
const SHIPROCKET_EMAIL = process.env.VITE_SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.VITE_SHIPROCKET_PASSWORD;
const SHIPROCKET_CHANNEL_ID = process.env.VITE_SHIPROCKET_CHANNEL_ID || '';

// Shiprocket auth token cache
let shiprocketToken = null;
let shiprocketTokenExpiry = null;

/**
 * Authenticate with Shiprocket API
 */
async function authenticateShiprocket() {
  // Check if we have a valid cached token
  if (shiprocketToken && shiprocketTokenExpiry && new Date() < shiprocketTokenExpiry) {
    return shiprocketToken;
  }

  if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
    throw new Error('Shiprocket credentials not configured');
  }

  const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Shiprocket auth failed: ${errorData.message || response.statusText}`);
  }

  const data = await response.json();
  shiprocketToken = data.token;
  shiprocketTokenExpiry = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000); // 8 days
  return shiprocketToken;
}

/**
 * Create Shiprocket order from API
 */
async function createShiprocketOrderFromAPI(orderData, db) {
  try {
    const token = await authenticateShiprocket();

    // Calculate package weight (simplified)
    let totalWeight = 0.1; // Base packaging weight
    if (orderData.items) {
      orderData.items.forEach(item => {
        if (item.weight) {
          const weightValue = parseFloat(item.weight.replace(/[^\d.]/g, ''));
          totalWeight += (weightValue / 1000) * (item.quantity || 1);
        } else {
          totalWeight += 0.3 * (item.quantity || 1);
        }
      });
    }
    totalWeight = Math.max(totalWeight, 0.5);

    // Calculate dimensions based on item count
    const itemCount = orderData.items ? orderData.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 1;
    let dimensions = { length: 20, breadth: 15, height: 10 };
    if (itemCount > 2) dimensions = { length: 25, breadth: 20, height: 15 };
    if (itemCount > 5) dimensions = { length: 30, breadth: 25, height: 20 };

    // Format order date
    const orderDate = orderData.createdAt
      ? (orderData.createdAt._seconds
        ? new Date(orderData.createdAt._seconds * 1000)
        : new Date(orderData.createdAt))
      : new Date();

    const shiprocketOrder = {
      order_id: orderData.id,
      order_date: orderDate.toISOString().split('T')[0],
      pickup_location: 'Primary',
      channel_id: SHIPROCKET_CHANNEL_ID,
      comment: 'Prasannas Orinuts Order',
      billing_customer_name: orderData.shippingAddress?.name || 'Customer',
      billing_address: orderData.shippingAddress?.street || '',
      billing_city: orderData.shippingAddress?.city || '',
      billing_pincode: orderData.shippingAddress?.pincode || '',
      billing_state: orderData.shippingAddress?.state || '',
      billing_country: 'India',
      billing_email: orderData.shippingAddress?.email || 'orders@prasannasorinuts.com',
      billing_phone: orderData.shippingAddress?.phone || '',
      shipping_is_billing: true,
      order_items: (orderData.items || []).map(item => ({
        name: item.name || 'Product',
        sku: item.id || `SKU-${Date.now()}`,
        units: item.quantity || 1,
        selling_price: item.price || 0,
        discount: 0,
        tax: 0,
        hsn: '08134010', // HSN for dry fruits
      })),
      payment_method: orderData.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      sub_total: orderData.totalAmount || 0,
      length: dimensions.length,
      breadth: dimensions.breadth,
      height: dimensions.height,
      weight: totalWeight,
    };

    logger.info('VERIFY-PAYMENT', 'Creating Shiprocket order', {
      orderId: orderData.id,
      weight: totalWeight,
      items: shiprocketOrder.order_items.length
    });

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
      logger.error('VERIFY-PAYMENT', 'Shiprocket order creation failed', errorData);
      throw new Error(`Shiprocket order creation failed: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    logger.success('VERIFY-PAYMENT', 'Shiprocket order created', result);
    return result;
  } catch (error) {
    logger.error('VERIFY-PAYMENT', 'Error creating Shiprocket order', error);
    throw error;
  }
}

async function handler(req, res) {
  // 🔐 Set security headers
  setSecurityHeaders(req, res);

  // 🚦 Rate limiting for payment endpoints
  const rateLimitResult = checkRateLimitForRequest(req, res, 'payment');
  if (rateLimitResult.limited) {
    logger.warn('VERIFY-PAYMENT', 'Rate limit exceeded', { userId: req.user?.uid });
    return res.status(429).json(rateLimitResult.response.body);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, paymentId, signature, receipt } = req.body;

    // Validate the data
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Missing required payment verification parameters' });
    }

    // Verify user owns the order (if receipt/orderId provided)
    if (receipt && db) {
      try {
        const orderDoc = await db.collection('orders').doc(receipt).get();
        if (orderDoc.exists) {
          const orderData = orderDoc.data();
          verifyOwnership(req.user, orderData.userId);
        }
      } catch (ownershipError) {
        logger.error('VERIFY-PAYMENT', 'Payment ownership verification failed', ownershipError);
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to verify this payment'
        });
      }
    }

    // Get the Razorpay secret key
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      logger.error('VERIFY-PAYMENT', 'RAZORPAY_KEY_SECRET not configured');
      return res.status(500).json({
        error: 'Server configuration error. Please contact support.',
        isValid: false
      });
    }

    // Create and verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    const isSignatureValid = expectedSignature === signature;

    let orderData = null;

    if (isSignatureValid && db && receipt) {
      try {
        const orderRef = db.collection('orders').doc(receipt);
        const orderSnap = await orderRef.get();

        if (orderSnap.exists) {
          orderData = { id: orderSnap.id, ...orderSnap.data() };
        }

        await orderRef.update({
          paymentStatus: 'paid',
          paymentId: paymentId,
          razorpayOrderId: orderId,
          updatedAt: new Date().toISOString()
        });

        // 🚀 AUTO-CREATE SHIPROCKET ORDER after payment is verified
        try {
          logger.info('VERIFY-PAYMENT', 'Creating Shiprocket order automatically', { orderId: receipt });

          const shiprocketResponse = await createShiprocketOrderFromAPI(orderData, db);

          if (shiprocketResponse && shiprocketResponse.order_id) {
            // Update order with Shiprocket details
            await orderRef.update({
              shiprocketOrderId: shiprocketResponse.order_id,
              shiprocketShipmentId: shiprocketResponse.shipment_id || null,
              shiprocketAwbCode: shiprocketResponse.awb_code || null,
              courierName: shiprocketResponse.courier_name || null,
              deliveryMethod: 'shiprocket',
              deliveryAssignedAt: new Date().toISOString(),
              orderStatus: 'processing',
              updatedAt: new Date().toISOString()
            });

            logger.success('VERIFY-PAYMENT', 'Shiprocket order created successfully', {
              shiprocketOrderId: shiprocketResponse.order_id,
              shipmentId: shiprocketResponse.shipment_id
            });
          }
        } catch (shiprocketError) {
          // Log error but don't fail the payment verification
          logger.error('VERIFY-PAYMENT', 'Failed to auto-create Shiprocket order', shiprocketError);
          // Order is still marked as paid, admin can manually create shipment later
        }

        // Send order confirmation email
        if (orderData) {
          try {
            logger.info('VERIFY-PAYMENT', 'Sending order confirmation email', {
              orderId: receipt,
              email: orderData.shippingAddress?.email || req.user?.email
            });

            const emailPayload = {
              orderId: receipt,
              customerName: orderData.shippingAddress?.name || 'Valued Customer',
              customerEmail: orderData.shippingAddress?.email || orderData.userEmail || req.user?.email,
              items: orderData.items || [],
              totalAmount: orderData.totalAmount || 0,
              shippingAddress: orderData.shippingAddress || {},
              paymentId: paymentId,
              orderDate: new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              shippingCharges: orderData.shippingCharges || 0,
            };

            // Call the send-order-email API
            const emailResponse = await fetch(`${BASE_URL}/api/send-order-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(emailPayload),
            });

            if (emailResponse.ok) {
              logger.success('VERIFY-PAYMENT', 'Order confirmation email sent successfully');
            } else {
              const emailError = await emailResponse.json();
              logger.error('VERIFY-PAYMENT', 'Failed to send order confirmation email', emailError);
            }

            // 📦 Send ADMIN notification email - "New Order! Time to Pack!"
            try {
              const adminEmail = process.env.ADMIN_EMAIL || 'prasannasorinuts@gmail.com';

              const adminEmailPayload = {
                orderId: receipt,
                customerName: orderData.shippingAddress?.name || 'Customer',
                customerEmail: adminEmail, // Send to admin
                items: orderData.items || [],
                totalAmount: orderData.totalAmount || 0,
                shippingAddress: orderData.shippingAddress || {},
                paymentId: paymentId,
                orderDate: new Date().toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }),
                shippingCharges: orderData.shippingCharges || 0,
                emailType: 'admin_new_order', // Special type for admin
              };

              const adminEmailResponse = await fetch(`${BASE_URL}/api/send-order-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(adminEmailPayload),
              });

              if (adminEmailResponse.ok) {
                logger.success('VERIFY-PAYMENT', 'Admin notification email sent - New order to pack!');
              } else {
                logger.error('VERIFY-PAYMENT', 'Failed to send admin notification email');
              }
            } catch (adminEmailError) {
              logger.error('VERIFY-PAYMENT', 'Error sending admin notification email', adminEmailError);
            }

          } catch (emailError) {
            // Don't fail payment verification if email fails
            logger.error('VERIFY-PAYMENT', 'Error sending order confirmation email', emailError);
          }
        }
      } catch (dbError) {
        logger.error('VERIFY-PAYMENT', 'Order status update failed', dbError);
      }
    }

    return res.status(200).json({
      success: true,
      verified: isSignatureValid,
      isValid: isSignatureValid, // Keep for backwards compatibility
      orderId: req.body.receipt || null,
      firebaseOrderId: req.body.receipt || null, // Keep for backwards compatibility
      paymentId: paymentId
    });
  } catch (error) {
    logger.error('VERIFY-PAYMENT', 'Error verifying payment', error);

    // Handle different error types
    if (error.message.includes('permission') || error.message.includes('Forbidden')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message
      });
    }

    return res.status(500).json({
      error: 'Payment verification failed',
      message: error.message,
      isValid: false
    });
  }
}

// 🔐 Wrap handler with authentication middleware
export default requireAuth(handler); 