// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCFGNw-QaL0NeajxgjMcuOxCXzeeHX1nwY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "orinut-494cc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "orinut-494cc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "orinut-494cc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "369347130599",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:369347130599:web:79cd0316f8af76c0a2de42",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-MB52LLLTFD"
};

// Check if Firebase config is valid
const isFirebaseConfigValid = () => {
  const requiredKeys = [
    'apiKey', 'authDomain', 'projectId', 
    'storageBucket', 'messagingSenderId', 'appId'
  ];
  
  for (const key of requiredKeys) {
    if (!firebaseConfig[key] || 
        firebaseConfig[key] === `your-firebase-${key}` || 
        firebaseConfig[key].includes('your-project-id')) {
      console.error(`Firebase config error: ${key} is not properly configured`);
      return false;
    }
  }
  return true;
};

// Initialize Firebase with error handling
let app;
let auth;
let db;
let storage;
let googleProvider;

try {
  if (!isFirebaseConfigValid()) {
    console.error('Firebase configuration is invalid. Using mock implementation.');
    // Create a mock implementation for development without Firebase
    app = {};
    auth = {
      currentUser: null,
      onAuthStateChanged: (callback) => {
        callback(null);
        return () => {};
      }
    };
    db = {
      collection: () => ({
        doc: () => ({
          get: async () => ({ exists: () => false, data: () => ({}) }),
          set: async () => {},
          update: async () => {}
        })
      })
    };
    storage = {};
    googleProvider = {};
  } else {
    // Initialize Firebase with valid config
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    
    // Configure Google Auth Provider
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Use emulators in development if needed
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectStorageEmulator(storage, 'localhost', 9199);
    }
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Provide fallback implementation
  app = {};
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      callback(null);
      return () => {};
    }
  };
  db = {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: () => false, data: () => ({}) }),
        set: async () => {},
        update: async () => {}
      })
    })
  };
  storage = {};
  googleProvider = {};
}

export { auth, db, storage, googleProvider };
export default app; 