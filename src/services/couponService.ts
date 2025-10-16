/**
 * Coupon Service
 * Handles coupon/discount code creation, validation, and application
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Coupon {
  id?: string;
  code: string; // Coupon code (e.g., "SAVE20")
  discountType: 'percentage' | 'fixed'; // Percentage or fixed amount
  discountValue: number; // 20 for 20% or 100 for ₹100
  minOrderAmount?: number; // Minimum order amount to apply
  maxDiscountAmount?: number; // Maximum discount cap (for percentage)
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number; // Total times coupon can be used
  usageCount: number; // Times already used
  perUserLimit?: number; // Times per user
  isActive: boolean;
  description?: string;
  applicableCategories?: string[]; // Specific categories (optional)
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string; // Admin user ID
}

export interface CouponUsage {
  id?: string;
  couponId: string;
  couponCode: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  orderAmount: number;
  usedAt: Date;
}

export interface CouponValidationResult {
  isValid: boolean;
  message: string;
  discountAmount?: number;
  finalAmount?: number;
  coupon?: Coupon;
}

const COUPONS_COLLECTION = 'coupons';
const COUPON_USAGE_COLLECTION = 'couponUsage';

/**
 * Create a new coupon
 */
export const createCoupon = async (couponData: Omit<Coupon, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Check if coupon code already exists
    const existingCoupon = await getCouponByCode(couponData.code);
    if (existingCoupon) {
      throw new Error('Coupon code already exists');
    }

    const couponRef = await addDoc(collection(db, COUPONS_COLLECTION), {
      ...couponData,
      code: couponData.code.toUpperCase(), // Store as uppercase
      usageCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return couponRef.id;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};

/**
 * Get coupon by code
 */
export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
  try {
    const q = query(
      collection(db, COUPONS_COLLECTION),
      where('code', '==', code.toUpperCase())
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      validFrom: doc.data().validFrom?.toDate(),
      validUntil: doc.data().validUntil?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Coupon;
  } catch (error) {
    console.error('Error getting coupon:', error);
    return null;
  }
};

/**
 * Get all coupons (for admin)
 */
export const getAllCoupons = async (): Promise<Coupon[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COUPONS_COLLECTION));
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      validFrom: doc.data().validFrom?.toDate(),
      validUntil: doc.data().validUntil?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Coupon));
  } catch (error) {
    console.error('Error getting coupons:', error);
    return [];
  }
};

/**
 * Get active coupons only
 */
export const getActiveCoupons = async (): Promise<Coupon[]> => {
  try {
    const q = query(
      collection(db, COUPONS_COLLECTION),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const now = new Date();
    
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        validFrom: doc.data().validFrom?.toDate(),
        validUntil: doc.data().validUntil?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Coupon))
      .filter(coupon => {
        const validFrom = new Date(coupon.validFrom);
        const validUntil = new Date(coupon.validUntil);
        return validFrom <= now && validUntil >= now;
      });
  } catch (error) {
    console.error('Error getting active coupons:', error);
    return [];
  }
};

/**
 * Update coupon
 */
export const updateCoupon = async (couponId: string, updates: Partial<Coupon>): Promise<void> => {
  try {
    const couponRef = doc(db, COUPONS_COLLECTION, couponId);
    await updateDoc(couponRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
};

/**
 * Delete coupon
 */
export const deleteCoupon = async (couponId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COUPONS_COLLECTION, couponId));
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

/**
 * Validate coupon for cart
 */
export const validateCoupon = async (
  code: string,
  cartTotal: number,
  userId: string,
  cartItems?: any[]
): Promise<CouponValidationResult> => {
  try {
    // Get coupon
    const coupon = await getCouponByCode(code);
    
    if (!coupon) {
      return {
        isValid: false,
        message: 'Invalid coupon code',
      };
    }

    // Check if active
    if (!coupon.isActive) {
      return {
        isValid: false,
        message: 'This coupon is no longer active',
      };
    }

    // Check validity period
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    
    if (now < validFrom) {
      return {
        isValid: false,
        message: `This coupon is valid from ${validFrom.toLocaleDateString()}`,
      };
    }
    
    if (now > validUntil) {
      return {
        isValid: false,
        message: 'This coupon has expired',
      };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return {
        isValid: false,
        message: 'This coupon has reached its usage limit',
      };
    }

    // Check per-user limit
    if (coupon.perUserLimit) {
      const userUsageCount = await getUserCouponUsageCount(coupon.id!, userId);
      if (userUsageCount >= coupon.perUserLimit) {
        return {
          isValid: false,
          message: 'You have already used this coupon the maximum number of times',
        };
      }
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return {
        isValid: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
      };
    }

    // Calculate discount
    let discountAmount = 0;
    
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      
      // Apply max discount cap if set
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // Fixed amount
      discountAmount = coupon.discountValue;
      
      // Don't exceed cart total
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
      }
    }

    const finalAmount = cartTotal - discountAmount;

    return {
      isValid: true,
      message: `Coupon applied! You saved ₹${discountAmount.toFixed(2)}`,
      discountAmount,
      finalAmount,
      coupon,
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return {
      isValid: false,
      message: 'Error validating coupon',
    };
  }
};

/**
 * Get user's coupon usage count
 */
const getUserCouponUsageCount = async (couponId: string, userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, COUPON_USAGE_COLLECTION),
      where('couponId', '==', couponId),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting user coupon usage:', error);
    return 0;
  }
};

/**
 * Record coupon usage (call after successful order)
 */
export const recordCouponUsage = async (
  couponId: string,
  couponCode: string,
  userId: string,
  orderId: string,
  discountAmount: number,
  orderAmount: number
): Promise<void> => {
  try {
    // Add usage record
    await addDoc(collection(db, COUPON_USAGE_COLLECTION), {
      couponId,
      couponCode,
      userId,
      orderId,
      discountAmount,
      orderAmount,
      usedAt: serverTimestamp(),
    });

    // Increment usage count
    const couponRef = doc(db, COUPONS_COLLECTION, couponId);
    const couponDoc = await getDoc(couponRef);
    
    if (couponDoc.exists()) {
      const currentCount = couponDoc.data().usageCount || 0;
      await updateDoc(couponRef, {
        usageCount: currentCount + 1,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error recording coupon usage:', error);
    throw error;
  }
};

/**
 * Get coupon usage history (for admin)
 */
export const getCouponUsageHistory = async (couponId: string): Promise<CouponUsage[]> => {
  try {
    const q = query(
      collection(db, COUPON_USAGE_COLLECTION),
      where('couponId', '==', couponId)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      usedAt: doc.data().usedAt?.toDate(),
    } as CouponUsage));
  } catch (error) {
    console.error('Error getting coupon usage history:', error);
    return [];
  }
};

/**
 * Generate random coupon code
 */
export const generateCouponCode = (prefix: string = '', length: number = 8): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix.toUpperCase();
  
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return code;
};

export default {
  createCoupon,
  getCouponByCode,
  getAllCoupons,
  getActiveCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  recordCouponUsage,
  getCouponUsageHistory,
  generateCouponCode,
};
