// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics, Analytics } from "firebase/analytics";
import { firebaseConfig, firebaseOptions, authConfig } from '@/config';



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (only in browser and production)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Firebase Analytics initialization failed:', error);
  }
}

// Configure Google Auth Provider
googleProvider.setCustomParameters(authConfig.google.customParameters);

// Add custom parameters to avoid COOP issues
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Use emulators in development if needed
if (firebaseOptions.useEmulators) {
  connectAuthEmulator(auth, `http://localhost:${firebaseOptions.emulatorPorts.auth}`);
  connectFirestoreEmulator(db, 'localhost', firebaseOptions.emulatorPorts.firestore);
  connectStorageEmulator(storage, 'localhost', firebaseOptions.emulatorPorts.storage);
}

export { auth, db, storage, googleProvider, analytics };
export default app; 