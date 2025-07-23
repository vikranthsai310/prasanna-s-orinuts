// Script to add a product with 1 rupee price to Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Firebase config from your environment
const firebaseConfig = {
  apiKey: 'AIzaSyB-XnyhYJEnJKKgpu6XE7Ti58D7e9UoH0M',
  authDomain: 'prassanas-orinut.firebaseapp.com',
  projectId: 'prassanas-orinut',
  storageBucket: 'prassanas-orinut.firebasestorage.app',
  messagingSenderId: '352359366381',
  appId: '1:352359366381:web:1f95ed0eec665ab8bd96e4'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Create the product with 1 rupee price
const addProduct = async () => {
  try {
    const productData = {
      name: 'Test Product - 1 Rupee',
      description: 'A test product with a price of 1 rupee for testing purposes',
      image: '/placeholder.svg',
      prices: {
        '250g': 1,
        '500g': 1,
        '1kg': 1
      },
      nutritionalInfo: {
        calories: 100,
        protein: 1,
        fat: 1,
        carbs: 1,
        fiber: 1
      },
      category: 'mixed',
      stock: 100
    };
    
    const docRef = await addDoc(collection(db, 'products'), productData);
    console.log('Product added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding product: ', error);
  }
};

// Run the function
addProduct(); 