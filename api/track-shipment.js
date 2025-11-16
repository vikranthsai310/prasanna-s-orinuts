// Vercel Serverless Function for tracking Delhivery shipments
import { requireAuth } from './_middleware/auth.js';
import { logger } from './_utils/logger.js';

const DELHIVERY_API_URL = process.env.DELHIVERY_API_URL || 'https://track.delhivery.com/api';
const DELHIVERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN;

async function handler(req, res) {
  // Allow both GET and POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let waybill;
    
    if (req.method === 'GET') {
      waybill = req.query.waybill || req.query.awb;
    } else {
      waybill = req.body.waybill || req.body.awb;
    }

    // Validate the data
    if (!waybill) {
      return res.status(400).json({ 
        error: 'Missing required field: waybill (tracking number)' 
      });
    }

    if (!DELHIVERY_API_TOKEN) {
      throw new Error('Delhivery API token is not configured');
    }

    const response = await fetch(
      `${DELHIVERY_API_URL}/v1/packages/json/?waybill=${waybill}&token=${DELHIVERY_API_TOKEN}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
    let trackingHistory = [];
    
    if (result.ShipmentData && result.ShipmentData.length > 0) {
      const shipmentData = result.ShipmentData[0].Shipment;
      trackingData = shipmentData;
      
      // Extract current status
      if (shipmentData.Status) {
        currentStatus = shipmentData.Status.Status || 'Unknown';
        estimatedDelivery = shipmentData.ExpectedDeliveryDate;
        
        // Build tracking history
        trackingHistory.push({
          status: currentStatus,
          date: shipmentData.Status.StatusDateTime,
          location: shipmentData.Status.StatusLocation,
          instructions: shipmentData.Status.Instructions,
        });
      }
      
    }
    
    return res.status(200).json({
      success: true,
      waybill: waybill,
      current_status: currentStatus,
      estimated_delivery: estimatedDelivery,
      tracking_history: trackingHistory,
      tracking_data: trackingData,
      track_url: `https://www.delhivery.com/track/package/${waybill}`,
    });
  } catch (error) {
    logger.error('TRACK-SHIPMENT', 'Error tracking shipment', error);
    return res.status(500).json({ 
      error: 'Failed to track shipment',
      message: error.message,
      success: false 
    });
  }
}

// 🔐 Wrap handler with authentication middleware
export default requireAuth(handler);