import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types/product';

/**
 * Checks if a product exists in Firestore by name
 */
export const checkProductExists = async (name: string): Promise<boolean> => {
  const productsRef = collection(db, 'products');
  const q = query(productsRef, where('name', '==', name));
  const snapshot = await getDocs(q);
  
  return !snapshot.empty;
};

/**
 * Seeds a single product if it doesn't already exist
 */
export const seedSingleProduct = async (product: Omit<Product, 'id'>): Promise<string | null> => {
  try {
    const exists = await checkProductExists(product.name);
    
    if (exists) {
      console.log(`Product ${product.name} already exists. Skipping...`);
      return null;
    }
    
    const docRef = await addDoc(collection(db, 'products'), product);
    console.log(`Added product ${product.name} with ID: ${docRef.id}`);
    return docRef.id;
    
  } catch (error) {
    console.error(`Error seeding product ${product.name}:`, error);
    throw error;
  }
}; 