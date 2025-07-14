// This is a script to set vikranthsai310@gmail.com as an admin
// You can run this script using Node.js

// Load environment variables from .env file
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';

// Get Firebase configuration from environment variables or use hardcoded values
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyB-XnyhYJEnJKKgpu6XE7Ti58D7e9UoH0M",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "prassanas-orinut.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "prassanas-orinut",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "prassanas-orinut.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "352359366381",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:352359366381:web:1f95ed0eec665ab8bd96e4",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JC8PCYHK65"
};

// Validate that we have the required configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase configuration is missing. Make sure your .env file contains the necessary Firebase configuration variables.');
  console.error('Required variables: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID');
  process.exit(1);
}

console.log('Using Firebase project:', firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setAdminRole() {
  try {
    // Query for the user with the specified email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", "vikranthsai310@gmail.com"));
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("No user found with email vikranthsai310@gmail.com");
      console.log("Creating user with admin privileges...");
      
      // Create the user if they don't exist
      try {
        const newUserRef = doc(collection(db, 'users'));
        await setDoc(newUserRef, {
          email: "vikranthsai310@gmail.com",
          name: "Vikranth Sai",
          isAdmin: true,
          createdAt: new Date()
        });
        console.log(`Created new admin user with ID: ${newUserRef.id}`);
      } catch (createError) {
        console.error("Error creating user:", createError);
      }
      
      return;
    }
    
    // Update each matching document (should be only one)
    for (const docSnapshot of querySnapshot.docs) {
      await updateDoc(doc(db, 'users', docSnapshot.id), {
        isAdmin: true
      });
      console.log(`User ${docSnapshot.id} (${docSnapshot.data().email}) has been set as admin.`);
    }
    
    console.log("Admin role assignment completed.");
  } catch (error) {
    console.error("Error setting admin role:", error);
  }
}

// Execute the function
setAdminRole()
  .then(() => {
    console.log("Script execution completed.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Script execution failed:", error);
    process.exit(1);
  }); 