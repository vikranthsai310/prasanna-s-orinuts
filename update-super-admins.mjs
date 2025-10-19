/**
 * Update Super Admin Roles - Simple Version
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';

// Firebase config (same as in your app)
const firebaseConfig = {
  apiKey: "AIzaSyD9vP0o9mRr2xhJ7Pw9gZx7Gzw7KqQo3xI",
  authDomain: "orinut-494cc.firebaseapp.com",
  projectId: "orinut-494cc",
  storageBucket: "orinut-494cc.firebasestorage.app",
  messagingSenderId: "1049585360303",
  appId: "1:1049585360303:web:9f1d8e5b4c6e7a8b9c0d1e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SUPER_ADMIN_PHONES = ['+916301308477', '+918555856366'];

async function updateSuperAdmins() {
  try {
    console.log('🔄 Fetching all users...\n');
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let updated = 0;
    
    for (const docSnap of snapshot.docs) {
      const userData = docSnap.data();
      const userPhone = userData.phone;
      
      if (SUPER_ADMIN_PHONES.includes(userPhone)) {
        console.log(`Found: ${userData.name || 'User'} (${userPhone})`);
        console.log(`  Current role: ${userData.adminRole || 'none'}`);
        
        const userRef = doc(db, 'users', docSnap.id);
        await updateDoc(userRef, {
          isAdmin: true,
          adminRole: 'super-admin',
          updatedAt: new Date()
        });
        
        console.log(`  ✅ Updated to Super Admin\n`);
        updated++;
      }
    }
    
    console.log(`\n🎉 Updated ${updated} user(s) to Super Admin!`);
    console.log('\n📝 Next steps:');
    console.log('1. Both users should log out');
    console.log('2. Log back in');
    console.log('3. They will see "Super Admin" badge with crown');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateSuperAdmins();
