
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { login, loginWithPhone, sendOTP, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';
  
  const [emailForm, setEmailForm] = useState({
    email: '',
    password: ''
  });
  
  const [phoneForm, setPhoneForm] = useState({
    phone: '',
    otp: '',
    otpSent: false
  });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(emailForm.email, emailForm.password);
      toast({
        title: "Login successful",
        description: "Welcome back!"
      });
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendOTP(phoneForm.phone);
      setPhoneForm(prev => ({ ...prev, otpSent: true }));
      toast({
        title: "OTP sent",
        description: "Please check your phone for the verification code."
      });
    } catch (error) {
      toast({
        title: "Failed to send OTP",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithPhone(phoneForm.phone, phoneForm.otp);
      toast({
        title: "Login successful",
        description: "Welcome!"
      });
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid OTP. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue shopping
          </p>
        </div>

        <div className="card-premium">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                <Button type="submit" disabled={isLoading} className="w-full btn-primary">
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="phone" className="space-y-4">
              {!phoneForm.otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneForm.phone}
                      onChange={(e) => setPhoneForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field w-full"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="w-full btn-primary">
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handlePhoneLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Enter OTP</label>
                    <input
                      type="text"
                      value={phoneForm.otp}
                      onChange={(e) => setPhoneForm(prev => ({ ...prev, otp: e.target.value }))}
                      className="input-field w-full"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      OTP sent to {phoneForm.phone}
                    </p>
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="w-full btn-primary">
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPhoneForm(prev => ({ ...prev, otpSent: false, otp: '' }))}
                    className="w-full"
                  >
                    Change Phone Number
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <a href="#" className="text-secondary hover:underline">
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
