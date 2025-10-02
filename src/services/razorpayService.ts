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
  } catch (error: any) {
    console.error('❌ Error creating Razorpay order:', error);
    
    // Provide more specific error messages
    if (error.statusCode === 400) {
      console.error('❌ 400 Bad Request - Possible causes:');
      console.error('  - Missing or invalid Razorpay credentials in server');
      console.error('  - Missing Firebase service account configuration');
      console.error('  - Invalid request payload');
      throw new Error('Payment gateway configuration error. Please contact support.');
    } else if (error.statusCode === 401) {
      console.error('❌ 401 Unauthorized - Authentication required');
      throw new Error('Please log in to continue with checkout.');
    } else if (error.statusCode === 403) {
      console.error('❌ 403 Forbidden - Permission denied');
      throw new Error('You do not have permission to perform this action.');
    }
    
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
    console.log('📋 Verification details:', {
      razorpayOrderId,
      paymentId,
      signature: signature.substring(0, 20) + '...',
      firebaseOrderId
    });
    
    const response = await apiService.post<VerifyPaymentResponse>(
      API_ENDPOINTS.PAYMENT.VERIFY_PAYMENT,
      { 
        orderId: razorpayOrderId, 
        paymentId, 
        signature,
        receipt: firebaseOrderId // Pass Firebase order ID as receipt for database updates
      }
    );

    console.log('✅ Verification response:', response);
    
    const result = response.data as VerifyPaymentResponse;
    
    // Handle both 'verified' and 'isValid' field names for backwards compatibility
    const isValid = result.verified !== undefined ? result.verified : (result as any).isValid || false;
    const orderId = result.orderId || (result as any).firebaseOrderId;
    
    console.log('✅ Payment verification result:', { isValid, orderId });
    
    return { 
      isValid, 
      firebaseOrderId: orderId 
    };
  } catch (error: any) {
    console.error('❌ Error verifying Razorpay payment:', error);
    console.error('❌ Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      response: error.response
    });
    
    // Provide specific error messages
    if (error.statusCode === 400) {
      throw new Error('Invalid payment verification request. Please try again.');
    } else if (error.statusCode === 401) {
      throw new Error('Please log in to verify payment.');
    } else if (error.statusCode === 403) {
      throw new Error('You do not have permission to verify this payment.');
    }
    
    throw error;
  }
}; 