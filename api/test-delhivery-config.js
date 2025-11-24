// Test endpoint to check Delhivery configuration
// This helps debug environment variable issues
// Access: /api/test-delhivery-config (admin only)

import { requireAuth } from './_middleware/auth.js';

async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Only allow admin users
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }

    // Check all environment variables
    const config = {
      delhivery: {
        hasApiToken: !!process.env.DELHIVERY_API_TOKEN,
        tokenLength: process.env.DELHIVERY_API_TOKEN?.length || 0,
        tokenPreview: process.env.DELHIVERY_API_TOKEN 
          ? `${process.env.DELHIVERY_API_TOKEN.substring(0, 10)}...${process.env.DELHIVERY_API_TOKEN.substring(process.env.DELHIVERY_API_TOKEN.length - 5)}`
          : 'MISSING',
        apiUrl: process.env.DELHIVERY_API_URL || 'https://track.delhivery.com/api',
        
        // Check VITE_ prefixed versions
        hasViteApiToken: !!process.env.VITE_DELHIVERY_API_TOKEN,
        viteTokenLength: process.env.VITE_DELHIVERY_API_TOKEN?.length || 0,
        
        // Warehouse config
        warehouseName: process.env.DELHIVERY_WAREHOUSE_NAME || process.env.VITE_DELHIVERY_WAREHOUSE_NAME || 'NOT SET',
        warehouseCity: process.env.DELHIVERY_PICKUP_CITY || process.env.VITE_DELHIVERY_PICKUP_CITY || 'NOT SET',
        warehousePincode: process.env.DELHIVERY_PICKUP_PINCODE || process.env.VITE_DELHIVERY_PICKUP_PINCODE || 'NOT SET',
        warehouseAddress: process.env.DELHIVERY_PICKUP_ADDRESS || process.env.VITE_DELHIVERY_PICKUP_ADDRESS || 'NOT SET',
      },
      firebase: {
        hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        serviceAccountLength: process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length || 0,
      },
      razorpay: {
        hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        vercelUrl: process.env.VERCEL_URL,
      },
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('DELHIVERY') || key.includes('FIREBASE') || key.includes('RAZORPAY')
      ).sort()
    };

    return res.status(200).json({
      success: true,
      config,
      message: 'Environment configuration check complete',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking config:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      success: false 
    });
  }
}

// Wrap handler with authentication middleware
export default requireAuth(handler);
