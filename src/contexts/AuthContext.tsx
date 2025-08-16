
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged,
  PhoneAuthProvider,
  signInWithCredential,
  User as FirebaseUser,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  isAdmin: boolean;
  phoneVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithPhone: (phone: string, otp: string) => Promise<void>;
  sendOTP: (phone: string) => Promise<string>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isProfileComplete: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// List of admin emails
const ADMIN_EMAILS = ['vikranthsai310@gmail.com', 'admin@prasannaorinut.com'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationId, setVerificationId] = useState<string>('');

  // Enable test mode for development (disable in production)
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Enable testing with fictional phone numbers and disable app verification
      (auth as any).settings = (auth as any).settings || {};
      (auth as any).settings.appVerificationDisabledForTesting = true;
      console.log('🔧 Development Mode: App verification disabled for testing');
      console.log('📱 You can now use test phone numbers from Firebase Console');
    }
  }, []);

  // Handle redirect result when user returns from Google OAuth
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User signed in via redirect
          console.log('Google sign-in via redirect successful:', result.user);
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
      }
    };

    handleRedirectResult();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            // User exists in Firestore, use that data
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || userData.email || '',
              phone: firebaseUser.phoneNumber || userData.phone || '',
              name: userData.name || firebaseUser.displayName || 'User',
              isAdmin: userData.isAdmin || ADMIN_EMAILS.includes(firebaseUser.email || ''),
              phoneVerified: userData.phoneVerified || false
            });
          } else {
            // User doesn't exist in Firestore yet, create a new document
            const newUser = {
              email: firebaseUser.email || '',
              phone: firebaseUser.phoneNumber || '',
              name: firebaseUser.displayName || 'User',
              isAdmin: ADMIN_EMAILS.includes(firebaseUser.email || ''),
              phoneVerified: firebaseUser.phoneNumber ? true : false, // If phone from provider, consider verified
              createdAt: new Date()
            };
            
            // Save to Firestore
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            
            setUser({
              id: firebaseUser.uid,
              ...newUser
            });
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          // Fallback to basic Firebase user data
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '',
            name: firebaseUser.displayName || 'User',
            isAdmin: ADMIN_EMAILS.includes(firebaseUser.email || ''),
            phoneVerified: firebaseUser.phoneNumber ? true : false // If phone from provider, consider verified
          });
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Auth state listener will handle updating the user state
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Try popup first (faster user experience)
      const result = await signInWithPopup(auth, googleProvider);
      
      // After successful Google login, check if user exists in Firestore
      const firebaseUser = result.user;
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // User exists, merge any missing data from Google
        const existingData = userDoc.data();
        const updatedData = {
          ...existingData,
          email: firebaseUser.email || existingData.email,
          name: firebaseUser.displayName || existingData.name,
          updatedAt: new Date()
        };
        
        // Only update if there are actual changes
        await setDoc(userDocRef, updatedData, { merge: true });
        console.log('✅ Existing user data updated with Google info');
      } else {
        // New user, create with Google data
        const newUserData = {
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          name: firebaseUser.displayName || 'User',
          isAdmin: ADMIN_EMAILS.includes(firebaseUser.email || ''),
          phoneVerified: firebaseUser.phoneNumber ? true : false,
          createdAt: new Date()
        };
        
        await setDoc(userDocRef, newUserData);
        console.log('✅ New user created with Google data');
      }
      
      // Auth state listener will handle updating the user state
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // If popup fails due to COOP or popup blocking, try redirect
      if (error.code === 'auth/popup-blocked' || 
          error.code === 'auth/popup-closed-by-user' ||
          error.message?.includes('Cross-Origin-Opener-Policy')) {
        console.log('Popup blocked or COOP issue, trying redirect method...');
        try {
          await signInWithRedirect(auth, googleProvider);
          // Redirect will reload the page, so no need to handle response here
          return;
        } catch (redirectError) {
          console.error('Redirect also failed:', redirectError);
          throw redirectError;
        }
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (phone: string): Promise<string> => {
    try {
      console.log('Attempting to send OTP to:', phone);
      
      // More aggressive cleanup of existing reCAPTCHA
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
          console.log('Error clearing reCAPTCHA:', e);
        }
        (window as any).recaptchaVerifier = null;
      }
      
      // Clear any global reCAPTCHA widgets
      if (typeof window !== 'undefined' && (window as any).grecaptcha) {
        try {
          (window as any).grecaptcha.reset();
        } catch (e) {
          console.log('Error resetting grecaptcha:', e);
        }
      }
      
      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Check if reCAPTCHA container exists
      const container = document.getElementById('recaptcha-container');
      if (!container) {
        throw new Error('reCAPTCHA container not found. Please ensure the dialog is open.');
      }
      
      // Aggressively clear the container
      container.innerHTML = '';
      container.style.display = 'block';
      
      // Wait a bit more to ensure DOM is clean
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Creating fresh reCAPTCHA verifier...');
      
      // Create completely fresh reCAPTCHA verifier with unique ID
      const timestamp = Date.now();
      const uniqueContainerId = `recaptcha-container-${timestamp}`;
      
      // Create a new container element
      const newContainer = document.createElement('div');
      newContainer.id = uniqueContainerId;
      newContainer.style.display = 'none'; // Keep invisible
      container.appendChild(newContainer);
      
      // Create fresh reCAPTCHA verifier with the new container
      const recaptchaVerifier = new RecaptchaVerifier(auth, uniqueContainerId, {
        size: 'invisible',
        callback: (response: any) => {
          console.log('reCAPTCHA solved successfully');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired, please try again');
        }
      });
      
      // Store verifier globally for cleanup
      (window as any).recaptchaVerifier = recaptchaVerifier;
      
      console.log('reCAPTCHA verifier created, sending SMS...');
      
      // Send SMS using Firebase method
      const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      
      // Store the confirmation result for verification
      (window as any).confirmationResult = confirmationResult;
      
      console.log('SMS sent successfully');
      return confirmationResult.verificationId;
      
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // More thorough cleanup on error
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
          console.log('Error during error cleanup:', e);
        }
        (window as any).recaptchaVerifier = null;
      }
      
      // Clear the entire container
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/invalid-app-credential') {
        errorMessage = 'Firebase configuration error. Please check your setup.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format.';
      } else if (error.message?.includes('reCAPTCHA')) {
        errorMessage = 'reCAPTCHA verification failed. Please try again.';
      } else if (error.message?.includes('already been rendered')) {
        errorMessage = 'Please close and reopen the dialog, then try again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const loginWithPhone = async (phone: string, otp: string) => {
    setIsLoading(true);
    try {
      // Get the stored confirmation result (as per Firebase docs)
      const confirmationResult = (window as any).confirmationResult;
      
      if (!confirmationResult) {
        throw new Error('No confirmation result available. Please request OTP again.');
      }
      
      // Confirm the verification code (following Firebase docs pattern)
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      console.log('User signed in successfully:', user.uid);
      
      // Update user data in Firestore with phone verification info
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        const userData = {
          phone: phone,
          name: user.displayName || userDoc.data()?.name || 'User',
          email: user.email || userDoc.data()?.email || '',
          isAdmin: userDoc.data()?.isAdmin || ADMIN_EMAILS.includes(user.email || ''),
          phoneVerified: true,
          updatedAt: new Date(),
          ...(userDoc.exists() ? {} : { createdAt: new Date() })
        };
        
        await setDoc(userDocRef, userData, { merge: true });
        console.log('User data updated in Firestore');
        
      } catch (firestoreError) {
        console.error('Error updating user data in Firestore:', firestoreError);
        // Don't throw here - authentication was successful
      }
      
      // Clean up stored confirmation result
      (window as any).confirmationResult = null;
      
    } catch (error: any) {
      console.error('Phone verification error:', error);
      
      // Provide more specific error messages
      if (error.code === 'auth/invalid-verification-code') {
        throw new Error('Invalid verification code. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        throw new Error('Verification code expired. Please request a new one.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many attempts. Please try again later.');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Auth state listener will handle updating the user state
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const isProfileComplete = () => {
    if (!user) return false;
    return user.phoneVerified || (user.phone && user.phone.length > 0);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      loginWithPhone,
      sendOTP,
      logout,
      isLoading,
      isProfileComplete
    }}>
      <div id="recaptcha-container"></div>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
