import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { initializeRazorpay, openRazorpayCheckout } from '@/services/paymentService';
import { toast } from '@/components/ui/use-toast';

const TestRazorpay = () => {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadRazorpay = async () => {
      console.log('🔄 Loading Razorpay for test...');
      const result = await initializeRazorpay();
      console.log('🔄 Razorpay test load result:', result);
      setRazorpayLoaded(result);
      
      if (result) {
        console.log('✅ Razorpay loaded successfully for test');
        console.log('🔍 Window.Razorpay available:', typeof window.Razorpay !== 'undefined');
      } else {
        console.error('❌ Failed to load Razorpay for test');
      }
    };
    
    loadRazorpay();
  }, []);

  const testPayment = () => {
    console.log('🧪 Testing payment...');
    setIsProcessing(true);
    
    // Create a dummy order ID for testing
    const dummyOrderId = 'test_order_' + Date.now();
    
    openRazorpayCheckout(
      dummyOrderId,
      100, // ₹100 test amount
      {
        name: 'Test User',
        email: 'test@example.com',
        phone: '9999999999'
      },
      (response) => {
        console.log('✅ Test payment successful:', response);
        toast({
          title: "Test Payment Successful",
          description: "Payment gateway is working correctly!",
          variant: "default"
        });
        setIsProcessing(false);
      },
      (error) => {
        console.error('❌ Test payment failed:', error);
        toast({
          title: "Test Payment Failed",
          description: error.message || "Payment test failed",
          variant: "destructive"
        });
        setIsProcessing(false);
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Razorpay Test Page</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <div className="space-y-2">
          <p><strong>Razorpay SDK Loaded:</strong> {razorpayLoaded ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Razorpay Key ID:</strong> {import.meta.env.VITE_RAZORPAY_KEY_ID || 'Not found'}</p>
          <p><strong>Window.Razorpay Available:</strong> {typeof window.Razorpay !== 'undefined' ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={testPayment}
          disabled={!razorpayLoaded || isProcessing}
          className="w-full max-w-md"
        >
          {isProcessing ? 'Testing...' : 'Test Razorpay Payment (₹100)'}
        </Button>
        
        {!razorpayLoaded && (
          <p className="text-red-500">
            ❌ Razorpay is not loaded. Check console for errors.
          </p>
        )}
        
        <div className="text-sm text-gray-600">
          <p><strong>Note:</strong> This is a test page to verify Razorpay integration.</p>
          <p>The payment will use test credentials and won't charge real money.</p>
        </div>
      </div>
    </div>
  );
};

export default TestRazorpay;
