// Script to clear all orders from Firebase
// Run this once to clean up test data before going live

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function clearAllOrders() {
  try {
    console.log('🗑️  Starting to delete all orders...');
    
    const ordersRef = db.collection('orders');
    const snapshot = await ordersRef.get();
    
    if (snapshot.empty) {
      console.log('✅ No orders found. Database is already clean.');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} orders to delete...`);
    
    const batch = db.batch();
    let count = 0;
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
      console.log(`   Queued for deletion: ${doc.id}`);
    });
    
    await batch.commit();
    console.log(`\n✅ Successfully deleted ${count} orders!`);
    console.log('🎉 Database is now clean and ready for production!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing orders:', error);
    process.exit(1);
  }
}

clearAllOrders();
