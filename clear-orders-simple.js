/**
 * Clear All Test Orders Script
 * Run this to delete all orders before going live in production
 * 
 * Usage: node clear-orders-simple.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Your Firebase config (from .env)
const firebaseConfig = {
  apiKey: "AIzaSyCFGNw-QaL0NeajxgjMcuOxCXzeeHX1nwY",
  authDomain: "orinut-494cc.firebaseapp.com",
  projectId: "orinut-494cc",
  storageBucket: "orinut-494cc.firebasestorage.app",
  messagingSenderId: "369347130599",
  appId: "1:369347130599:web:79cd0316f8af76c0a2de42",
  measurementId: "G-MB52LLLTFD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearAllOrders() {
  try {
    console.log('\n🗑️  CLEARING ALL TEST ORDERS FROM FIREBASE\n');
    console.log('⚠️  WARNING: This will delete ALL orders permanently!\n');
    
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    
    if (snapshot.empty) {
      console.log('✅ No orders found. Database is already clean.\n');
      process.exit(0);
    }
    
    console.log(`📊 Found ${snapshot.size} orders to delete:\n`);
    
    let count = 0;
    const deletePromises = [];
    
    snapshot.docs.forEach((document) => {
      const orderData = document.data();
      console.log(`   ${count + 1}. Order ID: ${document.id}`);
      console.log(`      Customer: ${orderData.shippingAddress?.name || 'Unknown'}`);
      console.log(`      Total: ₹${orderData.totalAmount || 0}`);
      console.log(`      Status: ${orderData.orderStatus || 'Unknown'}\n`);
      
      deletePromises.push(deleteDoc(doc(db, 'orders', document.id)));
      count++;
    });
    
    console.log('🔄 Deleting all orders...\n');
    await Promise.all(deletePromises);
    
    console.log(`✅ Successfully deleted ${count} orders!`);
    console.log('🎉 Database is now clean and ready for production!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error clearing orders:', error);
    process.exit(1);
  }
}

// Run the cleanup
clearAllOrders();
