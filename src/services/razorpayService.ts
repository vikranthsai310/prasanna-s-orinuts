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
    console.log('🌐 Creating Razorpay order on server...');
    console.log('💰 Amount:', amount);
    console.log('💳 Currency:', currency);
    console.log('🧾 Receipt:', receipt);
    
    // Call the Vercel serverless function
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency, receipt, notes }),
    });

    console.log('📡 API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        throw new Error(`Failed to create Razorpay order: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.error || 'Failed to create Razorpay order');
    }

    const result = await response.json();
    console.log('✅ Razorpay order created successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    throw error;
  }
};

/**
 * Verifies a Razorpay payment signature using Vercel serverless function
 */
export const verifyRazorpayPaymentOnServer = async (
  razorpayOrderId: string,
  paymentId: string,
  signature: string,
  firebaseOrderId?: string
): Promise<{ isValid: boolean; firebaseOrderId?: string }> => {
  try {
    // Call the Vercel serverless function
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        orderId: razorpayOrderId, 
        paymentId, 
        signature,
        receipt: firebaseOrderId // Pass Firebase order ID as receipt for database updates
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        throw new Error(`Failed to verify payment: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.error || 'Failed to verify Razorpay payment');
    }

    const result = await response.json();
    return { isValid: result.isValid, firebaseOrderId: result.firebaseOrderId };
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
}; 