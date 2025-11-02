import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  signOut,
  onAuthStateChanged,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ADMIN_PHONE_NUMBERS, SUPER_ADMIN_PHONES } from '@/config';

type AdminRole = 'super-admin' | 'admin' | null;

interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  isAdmin: boolean;
  adminRole?: AdminRole;
  phoneVerified?: boolean;
  isSuspended?: boolean;
  addresses?: Address[];
  createdAt?: Date;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface AuthContextType {
  user: User | null;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Store confirmation result globally
let confirmationResult: ConfirmationResult | null = null;
let isOTPBeingSent = false; // Prevent duplicate OTP requests

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            // User exists in Firestore
            const userData = userDoc.data();
            
            // CHECK IF USER IS SUSPENDED - Sign them out immediately
            if (userData.isSuspended === true) {
              await signOut(auth);
              setUser(null);
              setIsLoading(false);
              return;
            }
            
            // Check if we need to update phoneVerified status in Firestore
            const shouldBeVerified = firebaseUser.phoneNumber ? true : false;
            const currentlyVerified = userData.phoneVerified || false;
            
            // Update Firestore if phone is verified but not marked as such
            if (shouldBeVerified && !currentlyVerified) {
              await updateDoc(doc(db, 'users', firebaseUser.uid), {
                phoneVerified: true,
                updatedAt: new Date()
              });
            }
            
            const userObject: User = {
              id: firebaseUser.uid,
              phone: firebaseUser.phoneNumber || userData.phone || '',
              name: userData.name || firebaseUser.displayName || '',
              isAdmin: userData.isAdmin || ADMIN_PHONE_NUMBERS.includes(firebaseUser.phoneNumber || ''),
              adminRole: SUPER_ADMIN_PHONES.includes(firebaseUser.phoneNumber || '')
                ? 'super-admin' 
                : (userData.adminRole || (ADMIN_PHONE_NUMBERS.includes(firebaseUser.phoneNumber || '') ? 'admin' : null)),
              phoneVerified: shouldBeVerified,
              isSuspended: userData.isSuspended || false,
              addresses: userData.addresses || [],
              createdAt: userData.createdAt?.toDate() || new Date()
            };
            setUser(userObject);
          } else {
            // User doesn't exist in Firestore yet - will be created after name input
            setUser({
              id: firebaseUser.uid,
              phone: firebaseUser.phoneNumber || '',
              name: '',
              isAdmin: ADMIN_PHONE_NUMBERS.includes(firebaseUser.phoneNumber || ''),
              phoneVerified: firebaseUser.phoneNumber ? true : false,
              addresses: []
            });
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          // Fallback to basic Firebase user data
          setUser({
            id: firebaseUser.uid,
            phone: firebaseUser.phoneNumber || '',
            name: firebaseUser.displayName || '',
            isAdmin: ADMIN_PHONE_NUMBERS.includes(firebaseUser.phoneNumber || ''),
            phoneVerified: firebaseUser.phoneNumber ? true : false,
            addresses: []
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

  const sendOTP = async (phone: string): Promise<void> => {
    // Prevent duplicate requests
    if (isOTPBeingSent) {
      throw new Error('OTP request in progress. Please wait.');
    }

    try {
      isOTPBeingSent = true;
      setIsLoading(true);

      // AGGRESSIVE CLEANUP - Clear everything
      
      // 1. Clear any existing verifier
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
        }
        (window as any).recaptchaVerifier = null;
      }

      // 2. Get or create container
      let container = document.getElementById('recaptcha-container');
      if (!container) {
        console.error('❌ reCAPTCHA container not found in DOM!');
        throw new Error('reCAPTCHA container not found. Please refresh the page.');
      }

      // 3. Completely clear the container and remove it
      container.innerHTML = '';
      container.remove();
      
      // 4. Remove all reCAPTCHA widgets and badges from entire document
      const badges = document.querySelectorAll('.grecaptcha-badge');
      badges.forEach(badge => badge.remove());
      
      const iframes = document.querySelectorAll('iframe[src*="recaptcha"]');
      iframes.forEach(iframe => iframe.remove());
      
      // 5. Wait for DOM to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 6. Create a fresh container
      const newContainer = document.createElement('div');
      newContainer.id = 'recaptcha-container';
      document.body.appendChild(newContainer);
      
      // 7. Wait a bit more
      await new Promise(resolve => setTimeout(resolve, 200));
      
      
      // Create fresh reCAPTCHA verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
        },
        'expired-callback': () => {
          // Clear on expiration
          if ((window as any).recaptchaVerifier) {
            try {
              (window as any).recaptchaVerifier.clear();
              (window as any).recaptchaVerifier = null;
            } catch (e) {
            }
          }
        },
        'error-callback': (error: any) => {
          console.error('❌ reCAPTCHA error:', error);
        }
      });

      (window as any).recaptchaVerifier = recaptchaVerifier;

      
      // Send OTP
      confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      
      
    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);
      
      // Clear reCAPTCHA on error
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
        }
        (window as any).recaptchaVerifier = null;
      }
      
      // User-friendly error messages
      if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number. Please check and try again.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('⏰ Too many OTP requests. Please wait 15-30 minutes before trying again. This is a security measure to prevent spam.');
      } else if (error.code === 'auth/captcha-check-failed') {
        throw new Error('Security verification failed. Please try again.');
      } else if (error.message?.includes('already been rendered')) {
        throw new Error('Please refresh the page and try again.');
      } else {
        throw new Error(error.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
      isOTPBeingSent = false; // Reset flag
    }
  };

  const verifyOTP = async (otp: string): Promise<void> => {
    try {
      setIsLoading(true);

      if (!confirmationResult) {
        throw new Error('Please request OTP first');
      }

      // Verify OTP
      const result = await confirmationResult.confirm(otp);

      // Firebase auth state listener will handle the rest
      
    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error);
      
      if (error.code === 'auth/invalid-verification-code') {
        throw new Error('Invalid OTP. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        throw new Error('OTP expired. Please request a new one.');
      } else {
        throw new Error(error.message || 'Failed to verify OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserName = async (name: string): Promise<void> => {
    try {
      setIsLoading(true);

      if (!auth.currentUser) {
        throw new Error('No user logged in');
      }

      const userId = auth.currentUser.uid;
      const phone = auth.currentUser.phoneNumber || '';

      // Check if user document exists
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      const userData = {
        name,
        phone,
        isAdmin: ADMIN_PHONE_NUMBERS.includes(phone),
        phoneVerified: phone ? true : false,
        updatedAt: new Date()
      };

      if (userDoc.exists()) {
        // Update existing user
        await updateDoc(userDocRef, userData);
      } else {
        // Create new user document
        await setDoc(userDocRef, {
          ...userData,
          addresses: [],
          createdAt: new Date()
        });
      }

      // Update Firebase Auth profile
      await firebaseUpdateProfile(auth.currentUser, { displayName: name });


      // Update local user state
      setUser(prev => prev ? { ...prev, name } : null);

    } catch (error: any) {
      console.error('❌ Error updating user name:', error);
      throw new Error(error.message || 'Failed to save your name. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      confirmationResult = null;
      
      // Clear reCAPTCHA
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
        }
        (window as any).recaptchaVerifier = null;
      }
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sendOTP,
        verifyOTP,
        updateUserName,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

