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
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Product } from '@/types/product';

const PRODUCTS_COLLECTION = 'products';

// Get all products
export const getAllProducts = async (): Promise<Product[]> => {
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  const snapshot = await getDocs(productsRef);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  const q = query(productsRef, where('category', '==', category));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
};

// Get paginated products
export const getPaginatedProducts = async (
  pageSize: number = 12,
  lastDoc?: DocumentSnapshot
): Promise<{ products: Product[], lastDoc: DocumentSnapshot | null }> => {
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  
  let q = query(
    productsRef,
    orderBy('name'),
    limit(pageSize)
  );
  
  if (lastDoc) {
    q = query(
      productsRef,
      orderBy('name'),
      startAfter(lastDoc),
      limit(pageSize)
    );
  }
  
  const snapshot = await getDocs(q);
  
  const products = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
  
  const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  
  return {
    products,
    lastDoc: lastVisible
  };
};

// Get a single product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Product;
  }
  
  return null;
};

// Add a new product
export const addProduct = async (product: Omit<Product, 'id'>, imageFile?: File): Promise<string> => {
  let imageUrl = product.image;
  
  // Upload image if provided
  if (imageFile) {
    const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
    const uploadResult = await uploadBytes(storageRef, imageFile);
    imageUrl = await getDownloadURL(uploadResult.ref);
  }
  
  const productWithImage = {
    ...product,
    image: imageUrl
  };
  
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productWithImage);
  return docRef.id;
};

// Update a product
export const updateProduct = async (
  id: string, 
  product: Partial<Omit<Product, 'id'>>,
  imageFile?: File
): Promise<void> => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  
  let updateData = { ...product };
  
  // Upload new image if provided
  if (imageFile) {
    // Get the current product to check if we need to delete the old image
    const currentProduct = await getProductById(id);
    
    // Upload new image
    const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
    const uploadResult = await uploadBytes(storageRef, imageFile);
    const newImageUrl = await getDownloadURL(uploadResult.ref);
    
    // Add new image URL to update data
    updateData.image = newImageUrl;
    
    // Delete old image if it's not a placeholder
    if (currentProduct && !currentProduct.image.includes('placeholder')) {
      try {
        const oldImageRef = ref(storage, currentProduct.image);
        await deleteObject(oldImageRef);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }
  }
  
  await updateDoc(docRef, updateData);
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  // Get the product to check if we need to delete the image
  const product = await getProductById(id);
  
  if (product && !product.image.includes('placeholder')) {
    try {
      const imageRef = ref(storage, product.image);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting product image:', error);
    }
  }
  
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
};

// Search products
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  // Note: Firestore doesn't support native full-text search
  // For a production app, consider using Algolia, Elasticsearch, or Firebase Extensions
  
  // This is a simple implementation that searches by name
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  const snapshot = await getDocs(productsRef);
  
  const searchTermLower = searchTerm.toLowerCase();
  
  return snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product))
    .filter(product => 
      product.name.toLowerCase().includes(searchTermLower) || 
      product.description.toLowerCase().includes(searchTermLower)
    );
}; 