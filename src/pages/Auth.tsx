import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PhoneAuth from '@/components/PhoneAuth';

const Auth = () => {
  const { user, sendOTP, verifyOTP, updateUserName, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';
  
  useEffect(() => {
    if (user && user.name) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSendOTP = async (phone: string) => {
    try {
      await sendOTP(phone);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    try {
      await verifyOTP(otp);
      toast({
        title: "Verified",
        description: "Phone number verified successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleSetName = async (name: string) => {
    try {
      await updateUserName(name);
      toast({
        title: "Welcome!",
        description: `Your account has been set up successfully, ${name}!`,
      });
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save your name. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:flex flex-col space-y-6 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-4">
            <img src="/Logo.png" alt="Prasanna's Orinuts" className="h-20 w-auto" />
            <div>
              <h1 className="font-cormorant text-4xl font-bold text-amber-900">Prasanna's Orinuts</h1>
              <p className="text-amber-700 text-lg">Premium Dry Fruits</p>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-900">Welcome to Quality & Trust</h2>
            <p className="text-amber-800 leading-relaxed">Experience the finest selection of premium dry fruits.</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <PhoneAuth onSendOTP={handleSendOTP} onVerifyOTP={handleVerifyOTP} onSetName={handleSetName} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Auth;