/**
 * Delhivery Fees Service
 * Manages configurable Delhivery shipping fees in Firestore
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

export interface DelhiveryFee {
  id?: string;
  name: string;
  description: string;
  feeType: 'base_rate' | 'per_kg_metro' | 'per_kg_non_metro' | 'cod_charges' | 'packaging' | 'custom';
  amount: number;
  isActive: boolean;
  minWeight?: number;
  maxWeight?: number;
  applicableFor?: 'all' | 'metro' | 'non_metro';
  createdAt?: Date;
  updatedAt?: Date;
}

const COLLECTION_NAME = 'delhiveryFees';

/**
 * Get all Delhivery fees
 */
export const getAllDelhiveryFees = async (): Promise<DelhiveryFee[]> => {
  try {
    const feesCollection = collection(db, COLLECTION_NAME);
    const q = query(feesCollection, orderBy('feeType'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as DelhiveryFee[];
  } catch (error) {
    console.error('Error fetching Delhivery fees:', error);
    throw error;
  }
};

/**
 * Get a single Delhivery fee by ID
 */
export const getDelhiveryFeeById = async (feeId: string): Promise<DelhiveryFee | null> => {
  try {
    const feeDoc = doc(db, COLLECTION_NAME, feeId);
    const snapshot = await getDoc(feeDoc);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate(),
      updatedAt: snapshot.data().updatedAt?.toDate(),
    } as DelhiveryFee;
  } catch (error) {
    console.error('Error fetching Delhivery fee:', error);
    throw error;
  }
};

/**
 * Create a new Delhivery fee
 */
export const createDelhiveryFee = async (feeData: Omit<DelhiveryFee, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const feesCollection = collection(db, COLLECTION_NAME);
    const newFeeRef = doc(feesCollection);
    
    const fee = {
      ...feeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(newFeeRef, fee);
    console.log('✅ Delhivery fee created:', newFeeRef.id);
    return newFeeRef.id;
  } catch (error) {
    console.error('Error creating Delhivery fee:', error);
    throw error;
  }
};

/**
 * Update an existing Delhivery fee
 */
export const updateDelhiveryFee = async (feeId: string, feeData: Partial<DelhiveryFee>): Promise<void> => {
  try {
    const feeRef = doc(db, COLLECTION_NAME, feeId);
    
    const updateData = {
      ...feeData,
      updatedAt: serverTimestamp(),
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    await updateDoc(feeRef, updateData);
    console.log('✅ Delhivery fee updated:', feeId);
  } catch (error) {
    console.error('Error updating Delhivery fee:', error);
    throw error;
  }
};

/**
 * Delete a Delhivery fee
 */
export const deleteDelhiveryFee = async (feeId: string): Promise<void> => {
  try {
    const feeRef = doc(db, COLLECTION_NAME, feeId);
    await deleteDoc(feeRef);
    console.log('✅ Delhivery fee deleted:', feeId);
  } catch (error) {
    console.error('Error deleting Delhivery fee:', error);
    throw error;
  }
};

/**
 * Get active fees by type
 */
export const getActiveFeesByType = async (feeType: DelhiveryFee['feeType']): Promise<DelhiveryFee[]> => {
  try {
    const fees = await getAllDelhiveryFees();
    return fees.filter(fee => fee.feeType === feeType && fee.isActive);
  } catch (error) {
    console.error('Error fetching active fees by type:', error);
    throw error;
  }
};

/**
 * Calculate shipping charges based on saved fees
 */
export const calculateShippingCharges = async (
  weight: number, 
  isMetro: boolean = false
): Promise<{ total: number; breakdown: Record<string, number> }> => {
  try {
    const fees = await getAllDelhiveryFees();
    const activeFees = fees.filter(fee => fee.isActive);
    
    let total = 0;
    const breakdown: Record<string, number> = {};
    
    // Base rate
    const baseRate = activeFees.find(f => f.feeType === 'base_rate');
    if (baseRate) {
      breakdown['Base Rate'] = baseRate.amount;
      total += baseRate.amount;
    }
    
    // Per kg rate based on location
    const perKgFee = isMetro 
      ? activeFees.find(f => f.feeType === 'per_kg_metro')
      : activeFees.find(f => f.feeType === 'per_kg_non_metro');
    
    if (perKgFee) {
      const weightCharge = weight * perKgFee.amount;
      breakdown[`Weight (${weight}kg @ ₹${perKgFee.amount}/kg)`] = weightCharge;
      total += weightCharge;
    }
    
    return { total: Math.round(total), breakdown };
  } catch (error) {
    console.error('Error calculating shipping charges:', error);
    throw error;
  }
};

/**
 * Initialize default fees if collection is empty
 */
export const initializeDefaultFees = async (): Promise<void> => {
  try {
    const fees = await getAllDelhiveryFees();
    
    if (fees.length === 0) {
      console.log('Initializing default Delhivery fees...');
      
      const defaultFees: Omit<DelhiveryFee, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Base Shipping Rate',
          description: 'Base rate applied to all shipments',
          feeType: 'base_rate',
          amount: 50,
          isActive: true,
          applicableFor: 'all',
        },
        {
          name: 'Metro Cities - Per KG',
          description: 'Additional charge per kg for metro cities',
          feeType: 'per_kg_metro',
          amount: 30,
          isActive: true,
          applicableFor: 'metro',
        },
        {
          name: 'Non-Metro - Per KG',
          description: 'Additional charge per kg for non-metro areas',
          feeType: 'per_kg_non_metro',
          amount: 40,
          isActive: true,
          applicableFor: 'non_metro',
        },
        {
          name: 'COD Charges',
          description: 'Cash on Delivery handling charges',
          feeType: 'cod_charges',
          amount: 50,
          isActive: false,
          applicableFor: 'all',
        },
        {
          name: 'Packaging Fee',
          description: 'Standard packaging material cost',
          feeType: 'packaging',
          amount: 15,
          isActive: true,
          applicableFor: 'all',
        },
      ];
      
      for (const fee of defaultFees) {
        await createDelhiveryFee(fee);
      }
      
      console.log('✅ Default Delhivery fees initialized');
    }
  } catch (error) {
    console.error('Error initializing default fees:', error);
    throw error;
  }
};
