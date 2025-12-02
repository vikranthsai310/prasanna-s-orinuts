// Vercel Serverless Function for sending order emails (confirmation, shipped, delivered, etc.)
import { logger } from './_utils/logger.js';

// Email configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@prasannaorchards.com';
const BUSINESS_NAME = 'Prasanna Premium Orchard';
const BUSINESS_EMAIL = 'prasannasorinuts@gmail.com';
const WEBSITE_URL = 'https://prasannaorchards.com';

// Status configurations
const STATUS_CONFIG = {
  confirmed: {
    icon: '✓',
    iconBg: '#10b981',
    title: 'Order Confirmed!',
    message: 'Thank you for your order! We have received your payment and will start processing your order shortly.',
    subjectPrefix: 'Order Confirmed! 🎉',
  },
  processing: {
    icon: '📦',
    iconBg: '#f59e0b',
    title: 'Order Being Processed',
    message: 'Great news! Your order is now being processed and will be shipped soon.',
    subjectPrefix: 'Order Processing 📦',
  },
  shipped: {
    icon: '🚚',
    iconBg: '#3b82f6',
    title: 'Order Shipped!',
    message: 'Your order is on its way! Track your shipment using the tracking details below.',
    subjectPrefix: 'Order Shipped! 🚚',
  },
  delivered: {
    icon: '🎉',
    iconBg: '#10b981',
    title: 'Order Delivered!',
    message: 'Your order has been delivered. We hope you enjoy your premium dry fruits!',
    subjectPrefix: 'Order Delivered! 🎉',
  },
  cancelled: {
    icon: '❌',
    iconBg: '#ef4444',
    title: 'Order Cancelled',
    message: 'Your order has been cancelled. If you did not request this, please contact us immediately.',
    subjectPrefix: 'Order Cancelled ❌',
  },
};

/**
 * Generate HTML email template for order status updates
 */
function generateOrderEmail(orderData, emailType = 'confirmed') {
  const {
    orderId,
    customerName,
    customerEmail,
    items,
    totalAmount,
    shippingAddress,
    paymentId,
    orderDate,
    shippingCharges = 0,
    trackingId,
    courierName,
    estimatedDelivery,
  } = orderData;

  const status = STATUS_CONFIG[emailType] || STATUS_CONFIG.confirmed;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;">` : ''}
          <div>
            <strong>${item.name}</strong>
            ${item.weight ? `<br><span style="color: #666; font-size: 12px;">Weight: ${item.weight}</span>` : ''}
          </div>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Tracking section for shipped orders
  const trackingSection = (emailType === 'shipped' && trackingId) ? `
          <!-- Tracking Details -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px;">
                <h3 style="color: #1d4ed8; margin: 0 0 15px 0; font-size: 18px;">📍 Tracking Information</h3>
                <table width="100%" style="font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Tracking ID:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; font-family: monospace; color: #1a1a1a;">${trackingId}</td>
                  </tr>
                  ${courierName ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Courier:</td>
                    <td style="padding: 8px 0; text-align: right; color: #1a1a1a;">${courierName}</td>
                  </tr>
                  ` : ''}
                  ${estimatedDelivery ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Expected Delivery:</td>
                    <td style="padding: 8px 0; text-align: right; color: #1a1a1a;">${estimatedDelivery}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
            </td>
          </tr>
  ` : '';

  // Delivery confirmation for delivered orders
  const deliveredSection = (emailType === 'delivered') ? `
          <!-- Feedback Request -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center;">
                <h3 style="color: #059669; margin: 0 0 10px 0; font-size: 18px;">🌟 How was your experience?</h3>
                <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">We'd love to hear your feedback!</p>
                <a href="${WEBSITE_URL}/contact" 
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                  Share Feedback
                </a>
              </div>
            </td>
          </tr>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${status.title} - ${BUSINESS_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5A2B 0%, #A0522D 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🌿 ${BUSINESS_NAME}</h1>
              <p style="color: #f5deb3; margin: 10px 0 0 0; font-size: 14px;">Premium Quality Dry Fruits & Nuts</p>
            </td>
          </tr>
          
          <!-- Status Icon & Message -->
          <tr>
            <td style="padding: 40px 30px 20px 30px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: ${status.iconBg}; border-radius: 50%; margin: 0 auto 20px; line-height: 80px;">
                <span style="font-size: 40px;">${status.icon}</span>
              </div>
              <h2 style="color: #1a1a1a; margin: 0 0 10px 0; font-size: 24px;">${status.title}</h2>
              <p style="color: #666; margin: 0; font-size: 16px;">${status.message.replace('{customerName}', customerName)}</p>
            </td>
          </tr>
          
          ${trackingSection}
          
          <!-- Order Details -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #faf9f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #8B5A2B; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #8B5A2B; padding-bottom: 10px;">📦 Order Details</h3>
                <table width="100%" style="font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Order ID:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${orderId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Order Date:</td>
                    <td style="padding: 8px 0; text-align: right; color: #1a1a1a;">${orderDate || new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                  ${paymentId ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Payment ID:</td>
                    <td style="padding: 8px 0; text-align: right; font-family: monospace; color: #1a1a1a;">${paymentId}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Status:</td>
                    <td style="padding: 8px 0; text-align: right;"><span style="background-color: ${status.iconBg}; color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${emailType.toUpperCase()}</span></td>
                  </tr>
                </table>
              </div>
              
              <!-- Items Table -->
              <div style="margin-bottom: 20px;">
                <h3 style="color: #8B5A2B; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #8B5A2B; padding-bottom: 10px;">🛒 Items Ordered</h3>
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                  <thead>
                    <tr style="background-color: #faf9f6;">
                      <th style="padding: 12px; text-align: left; color: #666;">Product</th>
                      <th style="padding: 12px; text-align: center; color: #666;">Qty</th>
                      <th style="padding: 12px; text-align: right; color: #666;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
                
                <!-- Order Summary -->
                <table width="100%" style="margin-top: 20px; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Subtotal:</td>
                    <td style="padding: 8px 0; text-align: right; color: #1a1a1a;">₹${subtotal.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Shipping:</td>
                    <td style="padding: 8px 0; text-align: right; color: #1a1a1a;">${shippingCharges > 0 ? `₹${shippingCharges.toLocaleString('en-IN')}` : 'FREE'}</td>
                  </tr>
                  <tr style="border-top: 2px solid #8B5A2B;">
                    <td style="padding: 12px 0; font-weight: 700; font-size: 18px; color: #1a1a1a;">Total:</td>
                    <td style="padding: 12px 0; text-align: right; font-weight: 700; font-size: 18px; color: #8B5A2B;">₹${totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Shipping Address -->
              <div style="background-color: #faf9f6; border-radius: 8px; padding: 20px;">
                <h3 style="color: #8B5A2B; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #8B5A2B; padding-bottom: 10px;">📍 Shipping Address</h3>
                <p style="margin: 0; color: #1a1a1a; line-height: 1.6;">
                  <strong>${shippingAddress.name}</strong><br>
                  ${shippingAddress.street}<br>
                  ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br>
                  📞 ${shippingAddress.phone}
                </p>
              </div>
            </td>
          </tr>
          
          ${deliveredSection}
          
          <!-- Track Order Button -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <a href="${WEBSITE_URL}/track-order?orderId=${orderId}" 
                 style="display: inline-block; background: linear-gradient(135deg, #8B5A2B 0%, #A0522D 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Track Your Order
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #faf9f6; padding: 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                Need help? Contact us at<br>
                <a href="mailto:${BUSINESS_EMAIL}" style="color: #8B5A2B; text-decoration: none;">${BUSINESS_EMAIL}</a>
              </p>
              <p style="margin: 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} ${BUSINESS_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate plain text version of the email
 */
function generatePlainTextEmail(orderData, emailType = 'confirmed') {
  const {
    orderId,
    customerName,
    items,
    totalAmount,
    shippingAddress,
    paymentId,
    orderDate,
    shippingCharges = 0,
    trackingId,
    courierName,
  } = orderData;

  const status = STATUS_CONFIG[emailType] || STATUS_CONFIG.confirmed;

  const itemsList = items.map(item => 
    `  - ${item.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString('en-IN')}`
  ).join('\n');

  const trackingInfo = (emailType === 'shipped' && trackingId) ? `
TRACKING INFORMATION
--------------------
Tracking ID: ${trackingId}
${courierName ? `Courier: ${courierName}` : ''}
` : '';

  return `
${BUSINESS_NAME}
========================

${status.title} ${status.icon}

${status.message}

${trackingInfo}
ORDER DETAILS
-------------
Order ID: ${orderId}
Order Date: ${orderDate || new Date().toLocaleDateString('en-IN')}
${paymentId ? `Payment ID: ${paymentId}` : ''}
Status: ${emailType.toUpperCase()}

ITEMS ORDERED
-------------
${itemsList}

Subtotal: ₹${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('en-IN')}
Shipping: ${shippingCharges > 0 ? `₹${shippingCharges.toLocaleString('en-IN')}` : 'FREE'}
Total: ₹${totalAmount.toLocaleString('en-IN')}

SHIPPING ADDRESS
----------------
${shippingAddress.name}
${shippingAddress.street}
${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}
Phone: ${shippingAddress.phone}

Track your order: ${WEBSITE_URL}/track-order?orderId=${orderId}

Need help? Contact us at ${BUSINESS_EMAIL}

© ${new Date().getFullYear()} ${BUSINESS_NAME}. All rights reserved.
  `;
}

/**
 * Send email using Resend API
 */
async function sendEmailWithResend(to, subject, htmlContent, textContent) {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject: subject,
      html: htmlContent,
      text: textContent,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Resend API error: ${errorData.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Fallback: Send email using Nodemailer with Gmail SMTP
 */
async function sendEmailWithNodemailer(to, subject, htmlContent, textContent) {
  // Dynamic import for nodemailer
  const nodemailer = await import('nodemailer');
  
  const transporter = nodemailer.default.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
  });

  const mailOptions = {
    from: `"${BUSINESS_NAME}" <${process.env.GMAIL_USER}>`,
    to: to,
    subject: subject,
    html: htmlContent,
    text: textContent,
  };

  return await transporter.sendMail(mailOptions);
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const orderData = req.body;
    const emailType = orderData.emailType || 'confirmed'; // confirmed, processing, shipped, delivered, cancelled

    // Validate required fields
    const requiredFields = ['orderId', 'customerName', 'customerEmail', 'items', 'totalAmount', 'shippingAddress'];
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.customerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate email type
    if (!STATUS_CONFIG[emailType]) {
      return res.status(400).json({ error: `Invalid email type: ${emailType}. Valid types: ${Object.keys(STATUS_CONFIG).join(', ')}` });
    }

    logger.info('SEND-ORDER-EMAIL', `Sending ${emailType} email`, {
      orderId: orderData.orderId,
      customerEmail: orderData.customerEmail,
      emailType: emailType,
    });

    // Generate email content based on type
    const status = STATUS_CONFIG[emailType];
    const subject = `${status.subjectPrefix} - Your ${BUSINESS_NAME} Order #${orderData.orderId}`;
    const htmlContent = generateOrderEmail(orderData, emailType);
    const textContent = generatePlainTextEmail(orderData, emailType);

    let emailResult;

    // Try Resend first, then fallback to Nodemailer
    if (RESEND_API_KEY) {
      try {
        emailResult = await sendEmailWithResend(
          orderData.customerEmail,
          subject,
          htmlContent,
          textContent
        );
        logger.success('SEND-ORDER-EMAIL', 'Email sent via Resend', { id: emailResult.id });
      } catch (resendError) {
        logger.error('SEND-ORDER-EMAIL', 'Resend failed, trying Nodemailer', resendError);
        
        // Fallback to Nodemailer
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
          emailResult = await sendEmailWithNodemailer(
            orderData.customerEmail,
            subject,
            htmlContent,
            textContent
          );
          logger.success('SEND-ORDER-EMAIL', 'Email sent via Nodemailer', { messageId: emailResult.messageId });
        } else {
          throw resendError;
        }
      }
    } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      // Use Nodemailer with Gmail
      emailResult = await sendEmailWithNodemailer(
        orderData.customerEmail,
        subject,
        htmlContent,
        textContent
      );
      logger.success('SEND-ORDER-EMAIL', 'Email sent via Nodemailer', { messageId: emailResult.messageId });
    } else {
      throw new Error('No email service configured. Please set RESEND_API_KEY or GMAIL_USER and GMAIL_APP_PASSWORD.');
    }

    // Also send a copy to business email (optional)
    if (process.env.SEND_ADMIN_COPY === 'true') {
      try {
        const adminSubject = `[${emailType.toUpperCase()}] Order #${orderData.orderId} - ₹${orderData.totalAmount.toLocaleString('en-IN')}`;
        
        if (RESEND_API_KEY) {
          await sendEmailWithResend(BUSINESS_EMAIL, adminSubject, htmlContent, textContent);
        } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
          await sendEmailWithNodemailer(BUSINESS_EMAIL, adminSubject, htmlContent, textContent);
        }
        
        logger.success('SEND-ORDER-EMAIL', 'Admin copy sent', { to: BUSINESS_EMAIL });
      } catch (adminEmailError) {
        // Don't fail the entire request if admin email fails
        logger.error('SEND-ORDER-EMAIL', 'Failed to send admin copy', adminEmailError);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Order ${emailType} email sent successfully`,
      emailId: emailResult.id || emailResult.messageId,
      emailType: emailType,
    });

  } catch (error) {
    logger.error('SEND-ORDER-EMAIL', 'Error sending email', error);
    
    return res.status(500).json({
      error: 'Failed to send email',
      message: error.message,
    });
  }
}
