import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SAMPLES_COLLECTION = 'sampleProducts';

export interface SampleProduct {
  id: string;
  productId: string; // Reference to main product
  productName: string;
  productImage: string;
  sampleWeight: string; // e.g., "50g", "100g"
  maxQuantity: number; // Max number of this sample that can be selected
  stock: number; // Available stock quantity
  isActive: boolean;
  order: number; // Display order
  createdAt: Date;
  updatedAt: Date;
}

export interface SampleProductInput {
  productId: string;
  productName: string;
  productImage: string;
  sampleWeight: string;
  maxQuantity: number;
  stock: number;
  isActive: boolean;
  order: number;
}

// Get all sample products
export const getAllSamples = async (): Promise<SampleProduct[]> => {
  try {
    const samplesRef = collection(db, SAMPLES_COLLECTION);
    const q = query(samplesRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as SampleProduct;
    });
  } catch (error) {
    console.error('Error getting samples:', error);
    throw error;
  }
};

// Get active sample products only
export const getActiveSamples = async (): Promise<SampleProduct[]> => {
  try {
    const allSamples = await getAllSamples();
    return allSamples.filter(sample => sample.isActive);
  } catch (error) {
    console.error('Error getting active samples:', error);
    throw error;
  }
};

// Get single sample product
export const getSampleById = async (id: string): Promise<SampleProduct | null> => {
  try {
    const sampleRef = doc(db, SAMPLES_COLLECTION, id);
    const sampleDoc = await getDoc(sampleRef);
    
    if (!sampleDoc.exists()) {
      return null;
    }
    
    const data = sampleDoc.data();
    return {
      id: sampleDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as SampleProduct;
  } catch (error) {
    console.error('Error getting sample:', error);
    throw error;
  }
};

// Add new sample product
export const addSample = async (sampleData: SampleProductInput): Promise<string> => {
  try {
    const now = Timestamp.now();
    const samplesRef = collection(db, SAMPLES_COLLECTION);
    
    const docRef = await addDoc(samplesRef, {
      ...sampleData,
      createdAt: now,
      updatedAt: now
    });
    
    console.log('Sample added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding sample:', error);
    throw error;
  }
};

// Update sample product
export const updateSample = async (
  id: string, 
  updates: Partial<SampleProductInput>
): Promise<void> => {
  try {
    const sampleRef = doc(db, SAMPLES_COLLECTION, id);
    
    await updateDoc(sampleRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    console.log('Sample updated:', id);
  } catch (error) {
    console.error('Error updating sample:', error);
    throw error;
  }
};

// Delete sample product
export const deleteSample = async (id: string): Promise<void> => {
  try {
    const sampleRef = doc(db, SAMPLES_COLLECTION, id);
    await deleteDoc(sampleRef);
    console.log('Sample deleted:', id);
  } catch (error) {
    console.error('Error deleting sample:', error);
    throw error;
  }
};

// Toggle sample active status
export const toggleSampleStatus = async (id: string, isActive: boolean): Promise<void> => {
  try {
    const sampleRef = doc(db, SAMPLES_COLLECTION, id);
    await updateDoc(sampleRef, {
      isActive,
      updatedAt: Timestamp.now()
    });
    console.log('Sample status toggled:', id, isActive);
  } catch (error) {
    console.error('Error toggling sample status:', error);
    throw error;
  }
};

// Reorder samples
export const reorderSamples = async (sampleIds: string[]): Promise<void> => {
  try {
    const promises = sampleIds.map((id, index) => {
      const sampleRef = doc(db, SAMPLES_COLLECTION, id);
      return updateDoc(sampleRef, {
        order: index,
        updatedAt: Timestamp.now()
      });
    });
    
    await Promise.all(promises);
    console.log('Samples reordered');
  } catch (error) {
    console.error('Error reordering samples:', error);
    throw error;
  }
};

// Decrease sample stock (called when sample is ordered)
export const decreaseSampleStock = async (sampleId: string, quantity: number = 1): Promise<void> => {
  try {
    const sample = await getSampleById(sampleId);
    
    if (!sample) {
      throw new Error('Sample not found');
    }
    
    if (sample.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    
    const sampleRef = doc(db, SAMPLES_COLLECTION, sampleId);
    await updateDoc(sampleRef, {
      stock: sample.stock - quantity,
      updatedAt: Timestamp.now()
    });
    
    console.log(`Sample stock decreased: ${sampleId}, remaining: ${sample.stock - quantity}`);
  } catch (error) {
    console.error('Error decreasing sample stock:', error);
    throw error;
  }
};

// Increase sample stock (for restocking or order cancellations)
export const increaseSampleStock = async (sampleId: string, quantity: number = 1): Promise<void> => {
  try {
    const sample = await getSampleById(sampleId);
    
    if (!sample) {
      throw new Error('Sample not found');
    }
    
    const sampleRef = doc(db, SAMPLES_COLLECTION, sampleId);
    await updateDoc(sampleRef, {
      stock: sample.stock + quantity,
      updatedAt: Timestamp.now()
    });
    
    console.log(`Sample stock increased: ${sampleId}, new stock: ${sample.stock + quantity}`);
  } catch (error) {
    console.error('Error increasing sample stock:', error);
    throw error;
  }
};

// Update sample stock directly (for admin stock adjustments)
export const updateSampleStock = async (sampleId: string, newStock: number): Promise<void> => {
  try {
    if (newStock < 0) {
      throw new Error('Stock cannot be negative');
    }
    
    const sampleRef = doc(db, SAMPLES_COLLECTION, sampleId);
    await updateDoc(sampleRef, {
      stock: newStock,
      updatedAt: Timestamp.now()
    });
    
    console.log(`Sample stock updated: ${sampleId}, new stock: ${newStock}`);
  } catch (error) {
    console.error('Error updating sample stock:', error);
    throw error;
  }
};

// Check if sample has sufficient stock
export const checkSampleStock = async (sampleId: string, requestedQuantity: number): Promise<boolean> => {
  try {
    const sample = await getSampleById(sampleId);
    
    if (!sample) {
      return false;
    }
    
    return sample.stock >= requestedQuantity && sample.isActive;
  } catch (error) {
    console.error('Error checking sample stock:', error);
    return false;
  }
};

