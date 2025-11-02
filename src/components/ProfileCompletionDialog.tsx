import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sampleStorage } from '@/utils/sampleStorage';
import { mockProducts } from '@/data/mockProducts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, Phone, Shield, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfileCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const ProfileCompletionDialog = ({ isOpen, onClose, onComplete }: ProfileCompletionDialogProps) => {
  const { user, sendOTP, loginWithPhone } = useAuth();
  const { addItem, items } = useCart();
  const navigate = useNavigate();

  const addSamplesToCart = () => {
    const selectedSamples = sampleStorage.getSelectedSamples();
    const sampleProducts = mockProducts.slice(0, 6);
    
    selectedSamples.forEach(selectedSample => {
      const product = sampleProducts.find(p => p.id === selectedSample.id);
      if (product) {
        // Check if sample is not already in cart to avoid duplicates
        const existingCartItem = items.find(item => 
          item.id === product.id && item.name.includes('(Sample)')
        );
        
        if (!existingCartItem) {
          addItem({
            id: product.id,
            name: `${product.name} (Sample)`,
            price: 0, // Free sample
            weight: '50g', // Sample size
            quantity: 1,
            image: product.image
          });
        }
      }
    });
  };
  
  const [step, setStep] = useState<'profile' | 'otp'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    otp: ''
  });
  const [verificationId, setVerificationId] = useState('');

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.name.trim().length < 2) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid name (at least 2 characters)",
        variant: "destructive",
      });
      return;
    }

    if (formData.phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit Indian mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const fullPhone = `+91${formData.phone}`;
      
      const verificationId = await sendOTP(fullPhone);
      
      if (verificationId) {
        toast({
          title: "OTP Sent! 📱",
          description: `Verification code sent to +91 ${formData.phone}`,
          duration: 4000,
        });
        setStep('otp');
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      toast({
        title: "OTP Failed",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const fullPhone = `+91${formData.phone}`;
      await loginWithPhone(fullPhone, formData.otp);
      
      // Check if samples are already selected
      if (sampleStorage.hasSamplesSelected()) {
        toast({
          title: "Verification Successful! ✅",
          description: "Your mobile number has been verified. Your samples are ready!",
          duration: 3000,
        });
        
        // Small delay to show success message
        setTimeout(() => {
          addSamplesToCart();
          onComplete();
          navigate('/checkout');
        }, 1000);
      } else {
        toast({
          title: "Verification Successful! ✅",
          description: "Your mobile number has been verified. Proceeding to select samples...",
          duration: 3000,
        });
        
        // Small delay to show success message
        setTimeout(() => {
          onComplete();
          navigate('/samples');
        }, 1000);
      }

    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      let errorMessage = "Invalid verification code. Please try again.";
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = "Invalid verification code. Please check and try again.";
      } else if (error.code === 'auth/code-expired') {
        errorMessage = "Verification code expired. Please request a new one.";
      } else if (error.message?.includes('confirmation result')) {
        errorMessage = "Session expired. Please request a new OTP.";
      }
      
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    try {
      const fullPhone = `+91${formData.phone}`;
      await sendOTP(fullPhone);
      
      toast({
        title: "OTP Resent! 📱",
        description: "New verification code sent to your mobile",
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      toast({
        title: "Failed to Resend",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    // Clean up reCAPTCHA when dialog closes
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
      }
      (window as any).recaptchaVerifier = null;
    }
    
    // Clear confirmation result
    (window as any).confirmationResult = null;
    
    // Clear the container
    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.innerHTML = '';
    }
    
    // Reset form state
    setStep('profile');
    setFormData({ name: '', phone: '', otp: '' });
    setIsLoading(false);
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-secondary/20 to-primary/20">
            {step === 'profile' ? (
              <Phone className="h-8 w-8 text-secondary" />
            ) : (
              <Shield className="h-8 w-8 text-secondary" />
            )}
          </div>
          <DialogTitle className="text-xl font-semibold">
            {step === 'profile' ? 'Complete Your Profile' : 'Verify Mobile Number'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 'profile' 
              ? 'Please provide your mobile number for order updates and delivery notifications'
              : `Enter the 6-digit code sent to +91 ${formData.phone}`
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === 'profile' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="flex">
                <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-sm font-medium">
                  🇮🇳 +91
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setFormData({ ...formData, phone: value });
                    }
                  }}
                  className="rounded-l-none"
                  maxLength={10}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                You'll receive order updates and delivery notifications on this number
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                disabled={isLoading || !formData.name.trim() || formData.phone.length !== 10}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Send Verification Code
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOTPVerification} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={formData.otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    setFormData({ ...formData, otp: value });
                  }
                }}
                className="text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                disabled={isLoading || formData.otp.length !== 6}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify & Continue
                  </>
                )}
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resendOTP}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Resend OTP
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('profile')}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Change Number
                </Button>
              </div>
            </div>
          </form>
        )}
        
        {/* reCAPTCHA container for OTP */}
        <div id="recaptcha-container"></div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCompletionDialog; 
