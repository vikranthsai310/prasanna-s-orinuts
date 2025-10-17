import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query,
  where,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ProductDiscount {
  id: string; // product ID
  productName: string;
  discountPercentage: number; // 0-100
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // admin phone number
}

export interface DiscountInput {
  productId: string;
  productName: string;
  discountPercentage: number;
  isActive: boolean;
  createdBy: string;
}

const DISCOUNTS_COLLECTION = 'productDiscounts';

/**
 * Get all product discounts
 */
export const getAllDiscounts = async (): Promise<ProductDiscount[]> => {
  try {
    const discountsRef = collection(db, DISCOUNTS_COLLECTION);
    const snapshot = await getDocs(discountsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ProductDiscount));
  } catch (error) {
    console.error('Error fetching discounts:', error);
    throw error;
  }
};

/**
 * Get active discounts only
 */
export const getActiveDiscounts = async (): Promise<ProductDiscount[]> => {
  try {
    const discountsRef = collection(db, DISCOUNTS_COLLECTION);
    const q = query(discountsRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ProductDiscount));
  } catch (error) {
    console.error('Error fetching active discounts:', error);
    throw error;
  }
};

/**
 * Get discount for a specific product
 */
export const getProductDiscount = async (productId: string): Promise<ProductDiscount | null> => {
  try {
    const discountRef = doc(db, DISCOUNTS_COLLECTION, productId);
    const snapshot = await getDoc(discountRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as ProductDiscount;
  } catch (error) {
    console.error('Error fetching product discount:', error);
    return null;
  }
};

/**
 * Create or update a product discount
 */
export const setProductDiscount = async (input: DiscountInput): Promise<void> => {
  try {
    const discountRef = doc(db, DISCOUNTS_COLLECTION, input.productId);
    const existingDoc = await getDoc(discountRef);
    
    if (existingDoc.exists()) {
      // Update existing discount
      await updateDoc(discountRef, {
        productName: input.productName,
        discountPercentage: input.discountPercentage,
        isActive: input.isActive,
        updatedAt: Timestamp.now()
      });
    } else {
      // Create new discount
      await setDoc(discountRef, {
        productName: input.productName,
        discountPercentage: input.discountPercentage,
        isActive: input.isActive,
        createdBy: input.createdBy,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error setting product discount:', error);
    throw error;
  }
};

/**
 * Toggle discount active status
 */
export const toggleDiscountStatus = async (productId: string, isActive: boolean): Promise<void> => {
  try {
    const discountRef = doc(db, DISCOUNTS_COLLECTION, productId);
    await updateDoc(discountRef, {
      isActive,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error toggling discount status:', error);
    throw error;
  }
};

/**
 * Delete a product discount
 */
export const deleteProductDiscount = async (productId: string): Promise<void> => {
  try {
    const discountRef = doc(db, DISCOUNTS_COLLECTION, productId);
    await deleteDoc(discountRef);
  } catch (error) {
    console.error('Error deleting product discount:', error);
    throw error;
  }
};

/**
 * Calculate discounted price
 */
export const calculateDiscountedPrice = (originalPrice: number, discountPercentage: number): number => {
  return originalPrice - (originalPrice * discountPercentage / 100);
};

/**
 * Get discount map for multiple products (for efficient lookups)
 */
export const getDiscountMap = async (): Promise<Map<string, ProductDiscount>> => {
  try {
    const discounts = await getActiveDiscounts();
    const discountMap = new Map<string, ProductDiscount>();
    
    discounts.forEach(discount => {
      discountMap.set(discount.id, discount);
    });
    
    return discountMap;
  } catch (error) {
    console.error('Error creating discount map:', error);
    return new Map();
  }
};
