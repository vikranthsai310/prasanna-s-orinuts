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
    const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!loaded) {
      console.error('Razorpay SDK failed to load');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error loading Razorpay SDK:', error);
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
  }
): Promise<string> => {
  try {
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
      userId: userInfo.email, // Use email as userId if you don't have a proper userId
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: 'online',
      paymentStatus: 'pending',
      orderStatus: 'pending',
    };

    // Create order in your database
    const orderId = await createOrder(newOrder);
    
    // Create a Razorpay order on the server
    const razorpayOrder = await createRazorpayOrderOnServer(
      totalAmount,
      'INR',
      orderId,
      {
        customerName: userInfo.name,
        customerEmail: userInfo.email,
        customerPhone: userInfo.phone,
      }
    );
    
    return razorpayOrder.id; // Return the Razorpay order ID, not your database order ID
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
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
    // Check if Razorpay is loaded
    if (typeof window.Razorpay === 'undefined') {
      console.error('Razorpay SDK not loaded');
      onFailure(new Error('Razorpay SDK not loaded'));
      return;
    }
    
    // Check if key ID is available
    if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === 'rzp_test_YOUR_KEY_ID') {
      console.error('Razorpay Key ID not configured');
      onFailure(new Error('Razorpay Key ID not configured'));
      return;
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = amount * 100;

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Premium Orchard',
      description: 'Purchase from Premium Orchard',
      order_id: orderId,
      handler: (response) => {
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

    const razorpayInstance = new window.Razorpay(options);

    // Handle payment failures
    razorpayInstance.on('payment.failed', onFailure);

    // Open Razorpay checkout
    razorpayInstance.open();
  } catch (error) {
    console.error('Error opening Razorpay checkout:', error);
    onFailure(error);
  }
};

// Function to verify payment
export const verifyPayment = async (
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> => {
  try {
    // Verify the payment on the server
    const isVerified = await verifyRazorpayPaymentOnServer(
      orderId,
      paymentId,
      signature
    );
    
    if (isVerified) {
      // Update payment status in your database
      // Note: This might already be done in the verify-payment API
      try {
        await updatePaymentStatus(orderId, 'paid');
      } catch (err) {
        console.error('Error updating payment status:', err);
        // Continue even if this fails, as the payment is verified
      }
    }
    
    return isVerified;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}; 