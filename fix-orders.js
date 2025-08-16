// Manual fix for order payment status
// Run this in the browser console when logged in as admin

async function fixOrderPaymentStatus() {
  const { collection, getDocs, doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('./lib/firebase');
  
  try {
    console.log('🔍 Checking all orders...');
    
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    
    console.log(`Found ${snapshot.size} total orders`);
    
    for (const orderDoc of snapshot.docs) {
      const orderData = orderDoc.data();
      console.log(`Order ${orderDoc.id}:`, {
        paymentStatus: orderData.paymentStatus,
        totalAmount: orderData.totalAmount,
        razorpayOrderId: orderData.razorpayOrderId,
        paymentId: orderData.paymentId
      });
      
      // If order has paymentId but status is still pending, mark as paid
      if (orderData.paymentId && orderData.paymentStatus === 'pending') {
        console.log(`🔄 Updating order ${orderDoc.id} to paid status`);
        await updateDoc(doc(db, 'orders', orderDoc.id), {
          paymentStatus: 'paid',
          orderStatus: 'processing',
          updatedAt: new Date()
        });
        console.log(`✅ Updated order ${orderDoc.id}`);
      }
    }
    
    console.log('✅ Order status fix completed');
    
  } catch (error) {
    console.error('❌ Error fixing order status:', error);
  }
}

// Copy and paste this function into browser console, then run: fixOrderPaymentStatus()
