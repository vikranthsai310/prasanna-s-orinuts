/**
 * Shiprocket Fees Service
 * Manages shipping fee calculations for Shiprocket
 */

import { CartItem } from '@/types/product';
import { shiprocketConfig } from '@/config/shiprocket';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Calculate total weight from cart items
 */
export const calculateTotalWeight = (items: CartItem[]): number => {
  if (!items || !Array.isArray(items)) {
    console.warn('Invalid items array provided to calculateTotalWeight');
    return 0.5; // Default minimum weight
  }

  let totalWeight = 0;
  
  items.forEach(item => {
    if (item.price === 0) return; // Skip free samples
    
    // Extract weight from item.weight string (e.g., "250g", "500g", "1kg")
    const weightStr = item.weight.toLowerCase();
    let weightInKg = 0;
    
    if (weightStr.includes('kg')) {
      weightInKg = parseFloat(weightStr.replace('kg', '')) * item.quantity;
    } else if (weightStr.includes('g')) {
      weightInKg = (parseFloat(weightStr.replace('g', '')) / 1000) * item.quantity;
    } else {
      // Default to 250g if no unit specified
      weightInKg = 0.25 * item.quantity;
    }
    
    totalWeight += weightInKg;
  });
  
  return Math.max(totalWeight, 0.5); // Minimum 500g
};

/**
 * Calculate shipping charges based on weight and pincode
 * Supports both new signature (items, pincode) and legacy signature (weight, isMetro)
 */
export const calculateShippingCharges = async (
  itemsOrWeight: CartItem[] | number,
  deliveryPincodeOrIsMetro?: string | boolean
): Promise<number | { total: number; breakdown?: any }> => {
  try {
    let weight: number;
    let isMetro: boolean = false;
    let subtotal: number = 0;

    // Fetch shipping settings from Firestore
    let deliveryFee = 50; // Default
    let freeDeliveryThreshold = 500; // Default
    
    try {
      const settingsRef = doc(db, 'settings', 'shipping');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        deliveryFee = data.deliveryFee || 50;
        freeDeliveryThreshold = data.freeDeliveryThreshold || 500;
      }
    } catch (err) {
      console.warn('Could not fetch shipping settings, using defaults:', err);
    }

    // Handle legacy signature: calculateShippingCharges(weight, isMetro)
    if (typeof itemsOrWeight === 'number') {
      weight = itemsOrWeight;
      isMetro = typeof deliveryPincodeOrIsMetro === 'boolean' ? deliveryPincodeOrIsMetro : false;
      
      return {
        total: deliveryFee
      };
    }

    // New signature: calculateShippingCharges(items, deliveryPincode)
    const items = itemsOrWeight as CartItem[];
    const deliveryPincode = deliveryPincodeOrIsMetro as string || '';
    
    weight = calculateTotalWeight(items);
    subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Free shipping above threshold
    if (subtotal >= freeDeliveryThreshold) {
      return 0;
    }
    
    return deliveryFee;
  } catch (error) {
    console.error('Error calculating shipping charges:', error);
    // Return default shipping charge on error
    return typeof itemsOrWeight === 'number' ? { total: 50 } : 50;
  }
};

/**
 * Get pincode prefix for metro cities (simplified)
 */
const getMetroPincodePrefix = (city: string): string => {
  const prefixes: Record<string, string> = {
    'Delhi': '110',
    'Mumbai': '400',
    'Bangalore': '560',
    'Bengaluru': '560',
    'Chennai': '600',
    'Kolkata': '700',
    'Hyderabad': '500',
    'Pune': '411',
    'Ahmedabad': '380',
  };
  
  return prefixes[city] || '';
};

/**
 * Estimate delivery time based on pincode
 */
export const estimateDeliveryTime = (deliveryPincode: string): string => {
  // Check if metro
  const isMetro = shiprocketConfig.shipping.metroCities.some(city =>
    deliveryPincode.startsWith(getMetroPincodePrefix(city))
  );
  
  if (isMetro) {
    return shiprocketConfig.shipping.deliveryTimes.metro;
  }
  
  // Check if tier 1
  const isTier1 = shiprocketConfig.shipping.tier1Cities.some(city =>
    deliveryPincode.startsWith(getMetroPincodePrefix(city))
  );
  
  if (isTier1) {
    return shiprocketConfig.shipping.deliveryTimes.tier1;
  }
  
  // Default to tier 2
  return shiprocketConfig.shipping.deliveryTimes.tier2;
};

/**
 * Check if pincode is serviceable
 * In production, call Shiprocket's serviceability API
 */
export const checkPincodeServiceability = async (pincode: string): Promise<boolean> => {
  try {
    // For now, accept all 6-digit pincodes
    return /^\d{6}$/.test(pincode);
  } catch (error) {
    console.error('Error checking serviceability:', error);
    return false;
  }
};
