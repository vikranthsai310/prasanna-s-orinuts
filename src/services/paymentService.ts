import { loadScript } from '@/lib/utils';
import { createOrder, updatePaymentStatus } from './orderService';
import { createRazorpayOrderOnServer, verifyRazorpayPaymentOnServer } from './razorpayService';
import type { CartItem } from '@/types/product';
import type { NewOrder } from './orderService';

// Razorpay interface
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (error: any) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// Replace with your actual Razorpay key ID
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_DBSSTbBMD0V8N9';

// Function to initialize Razorpay SDK
export const initializeRazorpay = async (): Promise<boolean> => {
  try {
    console.log('🔄 Initializing Razorpay SDK...');
    console.log('🔑 Razorpay Key ID:', RAZORPAY_KEY_ID);
    
    const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!loaded) {
      console.error('❌ Razorpay SDK failed to load');
      return false;
    }
    
    // Check if Razorpay is available on window
    if (typeof window.Razorpay === 'undefined') {
      console.error('❌ Razorpay not available on window object');
      return false;
    }
    
    console.log('✅ Razorpay SDK loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Error loading Razorpay SDK:', error);
    return false;
  }
};

// Function to create Razorpay order
export const createRazorpayOrder = async (
  items: CartItem[],
  totalAmount: number,
  userInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  },
  userId: string // Add authenticated user ID parameter
): Promise<string> => {
  try {
    console.log('🔄 Creating Razorpay order...');
    console.log('💰 Total amount:', totalAmount);
    console.log('👤 User ID:', userId);
    console.log('📦 Items count:', items.length);
    
    // Create a new order in your database first
    const shippingAddress = {
      name: userInfo.name,
      phone: userInfo.phone,
      street: userInfo.address,
      city: userInfo.city,
      state: userInfo.state,
      pincode: userInfo.pincode,
    };

    const newOrder: NewOrder = {
      userId: userId, // Use the authenticated Firebase user ID
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: 'online',
      paymentStatus: 'pending',
      orderStatus: 'pending',
    };

    console.log('📄 Creating order in database...');
    // Create order in your database
    const firebaseOrderId = await createOrder(newOrder);
    console.log('✅ Firebase order created:', firebaseOrderId);
    
    console.log('🌐 Creating Razorpay order on server...');
    // Create a Razorpay order on the server
    const razorpayOrder = await createRazorpayOrderOnServer(
      totalAmount,
      'INR',
      firebaseOrderId, // Use Firebase order ID as receipt
      {
        customerName: userInfo.name,
        customerEmail: userInfo.email,
        customerPhone: userInfo.phone,
        firebaseOrderId: firebaseOrderId, // Store for reference
      }
    );
    
    console.log('✅ Razorpay order created:', razorpayOrder);
    
    // Store the mapping for later use during payment verification
    (window as any).orderIdMapping = {
      razorpayOrderId: razorpayOrder.id,
      firebaseOrderId: firebaseOrderId
    };
    
    console.log('✅ Order creation completed. Razorpay Order ID:', razorpayOrder.id);
    return razorpayOrder.id; // Return the Razorpay order ID, not your database order ID
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    throw error;
  }
};

// Function to open Razorpay payment modal
export const openRazorpayCheckout = (
  orderId: string,
  amount: number,
  userInfo: {
    name: string;
    email: string;
    phone: string;
  },
  onSuccess: (response: RazorpayResponse) => void,
  onFailure: (error: any) => void
): void => {
  try {
    console.log('🔄 Opening Razorpay checkout...');
    console.log('📄 Order ID:', orderId);
    console.log('💰 Amount:', amount);
    console.log('🔑 Key ID:', RAZORPAY_KEY_ID);
    
    // Check if Razorpay is loaded
    if (typeof window.Razorpay === 'undefined') {
      console.error('❌ Razorpay SDK not loaded');
      onFailure(new Error('Razorpay SDK not loaded. Please refresh the page and try again.'));
      return;
    }
    
    // Check if key ID is available
    if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === 'rzp_test_YOUR_KEY_ID') {
      console.error('❌ Razorpay Key ID not configured');
      onFailure(new Error('Payment gateway not configured properly. Please contact support.'));
      return;
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = amount * 100;
    console.log('💰 Amount in paise:', amountInPaise);

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Premium Orchard',
      description: 'Purchase from Premium Orchard',
      order_id: orderId,
      handler: (response) => {
        console.log('✅ Payment successful:', response);
        onSuccess(response);
      },
      prefill: {
        name: userInfo.name || '',
        email: userInfo.email || '',
        contact: userInfo.phone || '',
      },
      notes: {
        address: 'Premium Orchard',
      },
      theme: {
        color: '#8B5A2B', // Brown color to match the orchard theme
      },
    };

    console.log('🔧 Razorpay options:', options);

    const razorpayInstance = new window.Razorpay(options);

    // Handle payment failures
    razorpayInstance.on('payment.failed', (error) => {
      console.error('❌ Payment failed:', error);
      onFailure(error);
    });

    // Open Razorpay checkout
    console.log('🚀 Opening Razorpay modal...');
    razorpayInstance.open();
  } catch (error) {
    console.error('❌ Error opening Razorpay checkout:', error);
    onFailure(error);
  }
};

// Function to verify payment
export const verifyPayment = async (
  razorpayOrderId: string,
  paymentId: string,
  signature: string
): Promise<{ isVerified: boolean; firebaseOrderId?: string }> => {
  try {
    // Get the Firebase order ID from the stored mapping
    const orderMapping = (window as any).orderIdMapping;
    const firebaseOrderId = orderMapping?.firebaseOrderId;
    
    if (orderMapping?.razorpayOrderId !== razorpayOrderId) {
      console.warn('Order ID mismatch detected');
    }
    
    // Verify the payment on the server
    const verificationResult = await verifyRazorpayPaymentOnServer(
      razorpayOrderId,
      paymentId,
      signature,
      firebaseOrderId // Pass the Firebase order ID for database updates
    );
    
    if (verificationResult.isValid) {
      console.log('Payment verified successfully for Razorpay order:', razorpayOrderId);
      // Clean up the temporary mapping
      delete (window as any).orderIdMapping;
    }
    
    return { 
      isVerified: verificationResult.isValid, 
      firebaseOrderId: verificationResult.firebaseOrderId || firebaseOrderId 
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}; 