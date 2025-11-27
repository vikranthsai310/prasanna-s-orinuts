# 🗑️ Clear All Orders - Browser Console Method

## Step 1: Login to Your Website
1. Go to https://prasannasorinuts.com
2. Login as **admin**

## Step 2: Open Browser Console
- Press `F12` or right-click → "Inspect"
- Click on "Console" tab

## Step 3: Copy & Paste This Code

```javascript
// Clear All Test Orders - Run in Browser Console
(async function() {
    console.log('\n🗑️  CLEARING ALL TEST ORDERS\n');
    console.log('⚠️  WARNING: This will delete ALL orders permanently!\n');
    
    // Import Firestore functions
    const { collection, getDocs, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Get Firestore instance (already initialized in your app)
    const db = window.firebase?.firestore || (await import('@/lib/firebase')).db;
    
    try {
        const ordersRef = collection(db, 'orders');
        const snapshot = await getDocs(ordersRef);
        
        if (snapshot.empty) {
            console.log('✅ No orders found. Database is already clean!');
            return;
        }
        
        console.log(`📊 Found ${snapshot.size} orders:\n`);
        
        // List all orders
        snapshot.docs.forEach((doc, index) => {
            const order = doc.data();
            console.log(`${index + 1}. ID: ${doc.id.substring(0, 12)}...`);
            console.log(`   Customer: ${order.shippingAddress?.name || 'Unknown'}`);
            console.log(`   Total: ₹${order.totalAmount || 0}`);
            console.log(`   Status: ${order.orderStatus} | Payment: ${order.paymentStatus}\n`);
        });
        
        // Ask for confirmation
        const confirmed = confirm(`Delete ALL ${snapshot.size} orders?\n\nThis CANNOT be undone!`);
        
        if (!confirmed) {
            console.log('❌ Deletion cancelled.');
            return;
        }
        
        const finalConfirm = confirm(`FINAL WARNING!\n\nDeleting ${snapshot.size} orders permanently.\n\nAre you absolutely sure?`);
        
        if (!finalConfirm) {
            console.log('❌ Deletion cancelled.');
            return;
        }
        
        console.log(`\n🔄 Deleting ${snapshot.size} orders...\n`);
        
        let deleted = 0;
        const deletePromises = snapshot.docs.map(async (doc) => {
            await deleteDoc(doc.ref);
            deleted++;
            if (deleted % 5 === 0 || deleted === snapshot.size) {
                console.log(`✓ Deleted ${deleted}/${snapshot.size} orders`);
            }
        });
        
        await Promise.all(deletePromises);
        
        console.log('\n✅ SUCCESS!');
        console.log(`🎉 Deleted all ${deleted} orders!`);
        console.log('✅ Database is now clean and ready for production!\n');
        console.log('Next steps:');
        console.log('1. Deploy code to Vercel');
        console.log('2. Add Shiprocket credentials to Vercel');
        console.log('3. Start accepting real orders! 🚀\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\nMake sure you are:');
        console.log('1. Logged in as admin');
        console.log('2. On your website (prasannasorinuts.com)');
        console.log('3. Using a modern browser\n');
    }
})();
```

## Step 4: Press Enter
- Review the list of orders
- Confirm deletion (twice for safety)
- Wait for completion

## Done! ✅
Your database is now clean and ready for production.
