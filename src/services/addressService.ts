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
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Predefined address types
import { ADDRESS_TYPES } from '@/config';
export { ADDRESS_TYPES };
export type AddressType = typeof ADDRESS_TYPES[number];

export interface Address {
  id?: string;
  userId: string;
  type: AddressType;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const ADDRESSES_COLLECTION = 'addresses';

// Get all addresses for a user
export const getUserAddresses = async (userId: string): Promise<Address[]> => {
  try {
    const addressesRef = collection(db, ADDRESSES_COLLECTION);
    const q = query(
      addressesRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Address));
  } catch (error: any) {
    console.error('Error fetching addresses:', error);
    
    // If it's a permissions error, provide helpful feedback
    if (error.code === 'permission-denied') {
      console.warn('Firestore permissions not configured for addresses collection. Please deploy updated rules.');
      // Return empty array for now to prevent app from crashing
      return [];
    }
    
    return [];
  }
};

// Get a single address by ID
export const getAddressById = async (addressId: string): Promise<Address | null> => {
  try {
    const docRef = doc(db, ADDRESSES_COLLECTION, addressId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Address;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching address:', error);
    return null;
  }
};

// Add a new address
export const addAddress = async (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // If this is the default address, unset any existing default addresses
    if (address.isDefault) {
      await unsetDefaultAddresses(address.userId);
    }
    
    const addressWithTimestamps = {
      ...address,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, ADDRESSES_COLLECTION), addressWithTimestamps);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding address:', error);
    
    if (error.code === 'permission-denied') {
      throw new Error('Address permissions not configured. Please deploy updated Firestore rules.');
    }
    
    throw error;
  }
};

// Update an existing address
export const updateAddress = async (addressId: string, addressData: Partial<Address>): Promise<void> => {
  try {
    // If setting this address as default, unset any existing default addresses
    if (addressData.isDefault) {
      const address = await getAddressById(addressId);
      if (address) {
        await unsetDefaultAddresses(address.userId);
      }
    }
    
    const docRef = doc(db, ADDRESSES_COLLECTION, addressId);
    await updateDoc(docRef, {
      ...addressData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

// Delete an address
export const deleteAddress = async (addressId: string): Promise<void> => {
  try {
    const docRef = doc(db, ADDRESSES_COLLECTION, addressId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

// Set an address as default
export const setDefaultAddress = async (addressId: string): Promise<void> => {
  try {
    const address = await getAddressById(addressId);
    if (!address) {
      throw new Error('Address not found');
    }
    
    // Unset any existing default addresses
    await unsetDefaultAddresses(address.userId);
    
    // Set this address as default
    const docRef = doc(db, ADDRESSES_COLLECTION, addressId);
    await updateDoc(docRef, {
      isDefault: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
};

// Helper function to unset any existing default addresses
const unsetDefaultAddresses = async (userId: string): Promise<void> => {
  try {
    const addressesRef = collection(db, ADDRESSES_COLLECTION);
    const q = query(
      addressesRef, 
      where('userId', '==', userId),
      where('isDefault', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { 
        isDefault: false,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error unsetting default addresses:', error);
    throw error;
  }
}; 