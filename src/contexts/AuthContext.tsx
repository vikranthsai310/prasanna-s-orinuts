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
import { ADMIN_PHONE_NUMBERS } from '@/config';

interface User {
  id: string;
  phone: string;
  name: string;
  isAdmin: boolean;
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
    console.log('🔧 Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('👤 Auth state changed:', firebaseUser ? `User ${firebaseUser.uid}` : 'No user');
      
      if (firebaseUser) {
        try {
          console.log('📋 Getting user data from Firestore for UID:', firebaseUser.uid);
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            // User exists in Firestore
            const userData = userDoc.data();
            const userObject: User = {
              id: firebaseUser.uid,
              phone: firebaseUser.phoneNumber || userData.phone || '',
              name: userData.name || firebaseUser.displayName || '',
              isAdmin: userData.isAdmin || ADMIN_PHONE_NUMBERS.includes(firebaseUser.phoneNumber || ''),
              addresses: userData.addresses || [],
              createdAt: userData.createdAt?.toDate() || new Date()
            };
            console.log('✅ User object created:', userObject);
            setUser(userObject);
          } else {
            // User doesn't exist in Firestore yet - will be created after name input
            console.log('⚠️ User not found in Firestore, waiting for profile completion');
            setUser({
              id: firebaseUser.uid,
              phone: firebaseUser.phoneNumber || '',
              name: '',
              isAdmin: ADMIN_PHONE_NUMBERS.includes(firebaseUser.phoneNumber || ''),
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
            addresses: []
          });
        }
      } else {
        // User is signed out
        console.log('🚪 User signed out, clearing user state');
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const sendOTP = async (phone: string): Promise<void> => {
    // Prevent duplicate requests
    if (isOTPBeingSent) {
      console.log('⚠️ OTP request already in progress, please wait...');
      throw new Error('OTP request in progress. Please wait.');
    }

    try {
      console.log('📱 Sending OTP to:', phone);
      isOTPBeingSent = true;
      setIsLoading(true);

      // Clean up any existing reCAPTCHA more thoroughly
      const container = document.getElementById('recaptcha-container');
      if (!container) {
        throw new Error('reCAPTCHA container not found');
      }

      // Clear previous reCAPTCHA instance
      if ((window as any).recaptchaVerifier) {
        try {
          console.log('🧹 Clearing existing reCAPTCHA...');
          (window as any).recaptchaVerifier.clear();
          (window as any).recaptchaVerifier = null;
        } catch (e) {
          console.log('⚠️ Error clearing reCAPTCHA:', e);
        }
      }

      // Clear the DOM completely
      container.innerHTML = '';
      
      // Remove any existing reCAPTCHA widgets from DOM
      const existingWidgets = document.querySelectorAll('.grecaptcha-badge');
      existingWidgets.forEach(widget => widget.remove());

      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('🔐 Creating new reCAPTCHA verifier...');
      
      // Create fresh reCAPTCHA verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('✅ reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('⏰ reCAPTCHA expired');
          // Clear on expiration
          if ((window as any).recaptchaVerifier) {
            try {
              (window as any).recaptchaVerifier.clear();
              (window as any).recaptchaVerifier = null;
            } catch (e) {
              console.log('Error clearing expired reCAPTCHA:', e);
            }
          }
        },
        'error-callback': (error: any) => {
          console.error('❌ reCAPTCHA error:', error);
        }
      });

      (window as any).recaptchaVerifier = recaptchaVerifier;

      console.log('📤 Sending OTP via Firebase...');
      
      // Send OTP
      confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      
      console.log('✅ OTP sent successfully to:', phone);
      
    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);
      
      // Clear reCAPTCHA on error
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
          console.log('Error clearing reCAPTCHA after error:', e);
        }
        (window as any).recaptchaVerifier = null;
      }
      
      // User-friendly error messages
      if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number. Please check and try again.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many attempts. Please try again later.');
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
      console.log('🔐 Verifying OTP...');
      setIsLoading(true);

      if (!confirmationResult) {
        throw new Error('Please request OTP first');
      }

      // Verify OTP
      const result = await confirmationResult.confirm(otp);
      console.log('✅ OTP verified successfully:', result.user.uid);

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
      console.log('💾 Updating user name...');
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

      console.log('✅ User name updated successfully');

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
      console.log('👋 Logging out...');
      await signOut(auth);
      setUser(null);
      confirmationResult = null;
      
      // Clear reCAPTCHA
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
          console.log('Error clearing reCAPTCHA on logout:', e);
        }
        (window as any).recaptchaVerifier = null;
      }
      
      console.log('✅ Logged out successfully');
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

