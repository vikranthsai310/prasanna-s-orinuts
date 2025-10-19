/**
 * Update Super Admin Roles
 * This script updates both phone numbers to have Super Admin role
 */

const admin = require('firebase-admin');
const serviceAccount = require('./orinut-494cc-firebase-adminsdk-fbsvc-7b087e3184.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const SUPER_ADMIN_PHONES = ['+916301308477', '+918555856366'];

async function updateSuperAdmins() {
  try {
    console.log('🔄 Updating Super Admin roles...\n');
    
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    
    let updatedCount = 0;
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      const userPhone = userData.phone;
      
      if (SUPER_ADMIN_PHONES.includes(userPhone)) {
        // Check current status
        const currentRole = userData.adminRole || 'none';
        
        console.log(`Found: ${userData.name || 'Unknown'}`);
        console.log(`  Phone: ${userPhone}`);
        console.log(`  Current Role: ${currentRole}`);
        
        // Update to Super Admin
        await db.collection('users').doc(userId).update({
          isAdmin: true,
          adminRole: 'super-admin',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`  ✅ Updated to: super-admin\n`);
        updatedCount++;
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} Super Admin(s)!`);
    console.log('\nSuper Admins:');
    SUPER_ADMIN_PHONES.forEach(phone => {
      console.log(`  - ${phone}`);
    });
    
    console.log('\n📝 Next Steps:');
    console.log('1. Both users need to log out and log back in');
    console.log('2. They should then see "Super Admin" badge with crown icon');
    console.log('3. "Admin Management" menu item will be visible');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error updating Super Admins:', error);
    process.exit(1);
  }
}

// Run the update
updateSuperAdmins();
