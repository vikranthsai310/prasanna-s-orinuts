/**
 * Firebase Admin SDK script to set vikranthsai310@gmail.com as admin
 * 
 * To use this script:
 * 1. Install Firebase Admin SDK: npm install firebase-admin
 * 2. Download your service account key from Firebase Console:
 *    - Go to Project Settings > Service Accounts
 *    - Click "Generate new private key"
 *    - Save the JSON file in this directory as "serviceAccountKey.json"
 * 3. Run this script: node firebase-admin.js
 */

import admin from 'firebase-admin';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = resolve(__dirname, './serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setUserAsAdmin() {
  try {
    // Find user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', 'vikranthsai310@gmail.com')
      .get();

    if (usersSnapshot.empty) {
      console.log('No user found with email vikranthsai310@gmail.com');
      
      // Option: Create the user if they don't exist
      console.log('Creating user with admin privileges...');
      await db.collection('users').add({
        email: 'vikranthsai310@gmail.com',
        name: 'Vikranth Sai',
        isAdmin: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('User created with admin privileges');
      return;
    }

    // Update each matching user (should be only one)
    const batch = db.batch();
    usersSnapshot.forEach(doc => {
      console.log(`Updating user ${doc.id} to admin role`);
      batch.update(doc.ref, { isAdmin: true });
    });

    await batch.commit();
    console.log('Successfully updated user(s) to admin role');
  } catch (error) {
    console.error('Error setting admin role:', error);
  }
}

// Alternative method: Set admin by user ID if you know it
async function setUserAsAdminById(userId) {
  try {
    await db.collection('users').doc(userId).update({
      isAdmin: true
    });
    console.log(`Successfully updated user ${userId} to admin role`);
  } catch (error) {
    console.error('Error setting admin role by ID:', error);
  }
}

// Execute the function
setUserAsAdmin()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 