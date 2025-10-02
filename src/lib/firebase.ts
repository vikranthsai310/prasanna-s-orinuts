// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics, Analytics } from "firebase/analytics";
import { firebaseConfig, firebaseOptions } from '@/config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable phone auth for production
auth.languageCode = 'en'; // Set language for SMS

// Initialize Analytics (only in browser and production)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Firebase Analytics initialization failed:', error);
  }
}

// Use emulators in development if needed
if (firebaseOptions.useEmulators) {
  connectAuthEmulator(auth, `http://localhost:${firebaseOptions.emulatorPorts.auth}`);
  connectFirestoreEmulator(db, 'localhost', firebaseOptions.emulatorPorts.firestore);
  connectStorageEmulator(storage, 'localhost', firebaseOptions.emulatorPorts.storage);
}

export { auth, db, storage, analytics };
export default app; 