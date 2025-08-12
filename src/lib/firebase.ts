// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFGNw-QaL0NeajxgjMcuOxCXzeeHX1nwY",
  authDomain: "orinut-494cc.firebaseapp.com",
  projectId: "orinut-494cc",
  storageBucket: "orinut-494cc.firebasestorage.app",
  messagingSenderId: "369347130599",
  appId: "1:369347130599:web:79cd0316f8af76c0a2de42",
  measurementId: "G-MB52LLLTFD"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

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

export { auth, db, storage, googleProvider };
export default app; 