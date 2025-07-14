
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged,
  PhoneAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, otp: string) => Promise<void>;
  sendOTP: (phone: string) => Promise<string>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// List of admin emails
const ADMIN_EMAILS = ['vikranthsai310@gmail.com', 'admin@prasannaorinut.com'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationId, setVerificationId] = useState<string>('');

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
              isAdmin: userData.isAdmin || ADMIN_EMAILS.includes(firebaseUser.email || '')
            });
          } else {
            // User doesn't exist in Firestore yet, create a new document
            const newUser = {
              email: firebaseUser.email || '',
              phone: firebaseUser.phoneNumber || '',
              name: firebaseUser.displayName || 'User',
              isAdmin: ADMIN_EMAILS.includes(firebaseUser.email || ''),
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
            isAdmin: ADMIN_EMAILS.includes(firebaseUser.email || '')
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

  const sendOTP = async (phone: string) => {
    setIsLoading(true);
    try {
      // For web, we need a reCAPTCHA verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
      
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(phone, recaptchaVerifier);
      
      setVerificationId(verificationId);
      return verificationId;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (phone: string, otp: string) => {
    setIsLoading(true);
    try {
      // This is a simplified version - in a real app, you'd use PhoneAuthProvider.credential
      // and signInWithCredential
      
      // For now, let's just simulate it
      console.log(`Verifying OTP ${otp} for phone ${phone}`);
      
      // In a real implementation, you would do:
      // const credential = PhoneAuthProvider.credential(verificationId, otp);
      // await signInWithCredential(auth, credential);
      
      // Auth state listener will handle updating the user state
    } catch (error) {
      console.error('Phone login error:', error);
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

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithPhone,
      sendOTP,
      logout,
      isLoading
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
