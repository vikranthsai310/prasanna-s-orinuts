/**
 * Firebase Configuration Options
 * Centralized Firebase-related configurations
 * 
 * SECURITY: All sensitive credentials must be in environment variables
 * Never commit .env file to version control
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validation: Ensure all required Firebase config values are present
const validateFirebaseConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket'];
  const missing = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase configuration: ${missing.join(', ')}. ` +
      `Please check your .env file and ensure all VITE_FIREBASE_* variables are set.`
    );
  }
};

// Run validation immediately
if (import.meta.env.MODE !== 'test') {
  validateFirebaseConfig();
}

export const firebaseOptions = {
  useEmulators: import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true',
  emulatorPorts: {
    auth: 9099,
    firestore: 8080,
    storage: 9199
  }
};

// Firebase Storage URLs configuration
export const firebaseStorageUrls = {
  almond: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Falmond.png?alt=media&token=b170e0bf-b602-4211-8049-45f5a0b91b01',
  apricot: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Fapricot.png?alt=media&token=2071be84-fa26-491b-867a-8f0cc3041e31',
  cashew: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Fcashew.png?alt=media&token=6ea5e570-ee2c-46a2-888f-9cb7a540744c',
  dates: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Fdates.png?alt=media&token=6e7ae1e5-cf65-46e8-926f-fe3169bf53a0',
  logo: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/branding%2Flogo.png?alt=media',
  pista: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Fpista.png?alt=media&token=aca2b4cf-0083-4dab-b9e6-cf2b328f4385',
  rasins: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Frasins.png?alt=media&token=017e6c45-d8c8-4db8-9c4c-43bbd44389a7',
  walnut: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Fwalnut.png?alt=media&token=4336cad7-0a50-4762-bed7-1736cff605a0'
};

// Local image fallbacks
export const localImageUrls = {
  almond: '/almond.png',
  apricot: '/apricot.png',
  cashew: '/cashew.png',
  dates: '/dates.png',
  logo: '/Logo.png',
  pista: '/pista.png',
  rasins: '/rasins.png',
  walnut: '/walnut.png'
};