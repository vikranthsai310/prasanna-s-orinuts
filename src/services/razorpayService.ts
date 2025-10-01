import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { apiService } from '@/services/apiService';
import { API_ENDPOINTS } from '@/constants/api';
import type { 
  RazorpayOrderRequest, 
  RazorpayOrderResponse, 
  VerifyPaymentResponse 
} from '@/types/api';

/**
 * Creates a Razorpay order using Vercel serverless function
 * 🔐 Requires authentication
 */
export const createRazorpayOrderOnServer = async (
  amount: number, 
  currency: string = 'INR',
  receipt: string,
  notes: Record<string, string> = {}
): Promise<{ id: string }> => {
  try {
    console.log('🔐 Creating authenticated Razorpay order on server...');
    console.log('💰 Amount:', amount);
    console.log('💳 Currency:', currency);
    console.log('🧾 Receipt:', receipt);
    
    const requestData: RazorpayOrderRequest = {
      amount,
      currency,
      receipt,
      notes,
    };
    
    const response = await apiService.post<RazorpayOrderResponse>(
      API_ENDPOINTS.PAYMENT.CREATE_ORDER,
      requestData
    );

    console.log('✅ Razorpay order created successfully:', response.data);
    return response.data as { id: string };
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    throw error;
  }
};

/**
 * Verifies a Razorpay payment signature using Vercel serverless function
 * 🔐 Requires authentication
 */
export const verifyRazorpayPaymentOnServer = async (
  razorpayOrderId: string,
  paymentId: string,
  signature: string,
  firebaseOrderId?: string
): Promise<{ isValid: boolean; firebaseOrderId?: string }> => {
  try {
    console.log('🔐 Verifying payment with authentication...');
    
    const response = await apiService.post<VerifyPaymentResponse>(
      API_ENDPOINTS.PAYMENT.VERIFY_PAYMENT,
      { 
        orderId: razorpayOrderId, 
        paymentId, 
        signature,
        receipt: firebaseOrderId // Pass Firebase order ID as receipt for database updates
      }
    );

    const result = response.data as VerifyPaymentResponse;
    return { 
      isValid: result.verified || false, 
      firebaseOrderId: result.orderId 
    };
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
}; 