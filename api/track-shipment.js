// Vercel Serverless Function for tracking Shiprocket shipments
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

async function handler(req, res) {
  // Allow both GET and POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔐 Track shipment request from user:', req.user.uid);
    
    let awbCode;
    
    if (req.method === 'GET') {
      awbCode = req.query.awb;
    } else {
      awbCode = req.body.awb;
    }

    // Validate the data
    if (!awbCode) {
      return res.status(400).json({ 
        error: 'Missing required field: awb (tracking number)' 
      });
    }

    // Authenticate with Shiprocket
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
    
    // Process tracking data
    let trackingData = null;
    let currentStatus = 'Unknown';
    let estimatedDelivery = null;
    
    if (result.tracking_data) {
      trackingData = result.tracking_data;
      
      // Extract current status and estimated delivery
      if (trackingData.track_status === 1) {
        currentStatus = trackingData.shipment_status || 'In Transit';
        estimatedDelivery = trackingData.edd;
      }
    }
    
    return res.status(200).json({
      success: true,
      awb_code: awbCode,
      current_status: currentStatus,
      estimated_delivery: estimatedDelivery,
      tracking_data: trackingData,
      track_url: `https://shiprocket.co/tracking/${awbCode}`,
    });
  } catch (error) {
    console.error('❌ Error tracking shipment:', error);
    return res.status(500).json({ 
      error: 'Failed to track shipment',
      message: error.message,
      success: false 
    });
  }
}

// 🔐 Wrap handler with authentication middleware
export default requireAuth(handler);