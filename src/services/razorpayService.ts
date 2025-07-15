import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

/**
 * Creates a Razorpay order using Vercel serverless function
 */
export const createRazorpayOrderOnServer = async (
  amount: number, 
  currency: string = 'INR',
  receipt: string,
  notes: Record<string, string> = {}
): Promise<{ id: string }> => {
  try {
    // Call the Vercel serverless function
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency, receipt, notes }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create Razorpay order');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

/**
 * Verifies a Razorpay payment signature using Vercel serverless function
 */
export const verifyRazorpayPaymentOnServer = async (
  orderId: string,
  paymentId: string,
  signature: string,
  receipt?: string
): Promise<boolean> => {
  try {
    // Call the Vercel serverless function
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        orderId, 
        paymentId, 
        signature,
        receipt // Pass receipt for order reference if available
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to verify Razorpay payment');
    }

    const result = await response.json();
    return result.isValid;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
}; 