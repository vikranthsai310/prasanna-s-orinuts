
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const Auth = () => {
  const { login, loginWithPhone, sendOTP, isLoading, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';
  
  const [emailForm, setEmailForm] = useState({
    email: '',
    password: ''
  });
  
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [phoneForm, setPhoneForm] = useState({
    phone: '',
    otp: '',
    otpSent: false
  });
  
  const [activeTab, setActiveTab] = useState('login');
  
  // If user is already logged in, redirect to the from page
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(emailForm.email, emailForm.password);
      toast({
        title: "Login successful",
        description: "Welcome back!"
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createUserWithEmailAndPassword(auth, signupForm.email, signupForm.password);
      toast({
        title: "Account created",
        description: "Your account has been created successfully!"
      });
      setActiveTab('login');
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "There was an error creating your account.",
        variant: "destructive"
      });
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format phone number to E.164 format if it doesn't already start with +
    const formattedPhone = phoneForm.phone.startsWith('+') 
      ? phoneForm.phone 
      : `+91${phoneForm.phone}`; // Assuming India as default country code
    
    try {
      await sendOTP(formattedPhone);
      setPhoneForm(prev => ({ ...prev, otpSent: true, phone: formattedPhone }));
      toast({
        title: "OTP sent",
        description: "Please check your phone for the verification code."
      });
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again.",
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
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-2">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-muted-foreground">
            {activeTab === 'login' 
              ? 'Sign in to your account to continue shopping' 
              : 'Join Premium Orchard to start shopping'}
          </p>
        </div>

        <div className="card-premium">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
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
                        <p className="text-xs text-muted-foreground mt-1">
                          Format: +91XXXXXXXXXX or just 10 digits (Indian number)
                        </p>
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
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Create a password"
                    required
                    minLength={6}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                </div>
                
                <Button type="submit" disabled={isLoading} className="w-full btn-primary">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {activeTab === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button 
                    onClick={() => setActiveTab('signup')}
                    className="text-secondary hover:underline"
                  >
                    Sign up here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button 
                    onClick={() => setActiveTab('login')}
                    className="text-secondary hover:underline"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </p>
          </div>
          
          {/* Recaptcha container for phone auth */}
          <div id="recaptcha-container"></div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
