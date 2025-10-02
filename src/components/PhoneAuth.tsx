import { useState, useEffect } from 'react';
import { Phone, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PhoneAuthProps {
  onSendOTP: (phone: string) => Promise<void>;
  onVerifyOTP: (otp: string) => Promise<void>;
  onSetName: (name: string) => Promise<void>;
  isLoading: boolean;
}

type Step = 'phone' | 'otp' | 'name';

const PhoneAuth = ({ onSendOTP, onVerifyOTP, onSetName, isLoading }: PhoneAuthProps) => {
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = digits.slice(0, 10);
    
    // Format as XXX-XXX-XXXX
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
  };

  const getFullPhoneNumber = (formatted: string): string => {
    const digits = formatted.replace(/\D/g, '');
    return `+91${digits}`;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const digits = phoneNumber.replace(/\D/g, '');
    
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      await onSendOTP(getFullPhoneNumber(phoneNumber));
      setStep('otp');
      setCountdown(60); // 60 seconds countdown
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp as string[]);
    
    // Focus last filled input or first empty
    const focusIndex = Math.min(pastedData.length, 5);
    document.getElementById(`otp-${focusIndex}`)?.focus();
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    try {
      await onVerifyOTP(otpString);
      setStep('name');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (name.trim().length < 2) {
      setError('Please enter your name');
      return;
    }

    try {
      await onSetName(name.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to save your name. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setError('');
    setOtp(['', '', '', '', '', '']);
    
    try {
      await onSendOTP(getFullPhoneNumber(phoneNumber));
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>

      <Card className="border-amber-200 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Phone className="h-6 w-6 text-amber-700" />
          </div>
          <CardTitle className="text-2xl font-cormorant font-bold text-amber-900">
            {step === 'phone' && 'Welcome!'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'name' && 'Complete Your Profile'}
          </CardTitle>
          <CardDescription className="text-amber-700">
            {step === 'phone' && 'Enter your mobile number to get started'}
            {step === 'otp' && `OTP sent to ${phoneNumber}`}
            {step === 'name' && 'Please tell us your name'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Phone Number Step */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-amber-900">
                  Mobile Number
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center px-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-amber-900 font-medium">+91</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="999-999-9999"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                    className="flex-1 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={isLoading || phoneNumber.replace(/\D/g, '').length !== 10}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-amber-700">
                By continuing, you agree to receive SMS from Prasanna's Orinuts
              </p>
            </form>
          )}

          {/* OTP Verification Step */}
          {step === 'otp' && (
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-amber-900 text-center block">
                  Enter 6-Digit OTP
                </Label>
                <div className="flex gap-2 justify-center" onPaste={handleOTPPaste}>
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-bold border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                      disabled={isLoading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg text-center">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={isLoading || otp.join('').length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || isLoading}
                  className={`text-sm ${
                    countdown > 0 || isLoading
                      ? 'text-amber-400 cursor-not-allowed'
                      : 'text-amber-600 hover:text-amber-700 underline'
                  }`}
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                }}
                className="text-sm text-amber-600 hover:text-amber-700 underline w-full"
              >
                Change phone number
              </button>
            </form>
          )}

          {/* Name Collection Step */}
          {step === 'name' && (
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-amber-900">
                  Your Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={isLoading || name.trim().length < 2}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Feature Highlights */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-amber-700">✓ No password required</p>
        <p className="text-sm text-amber-700">✓ Quick & secure login</p>
        <p className="text-sm text-amber-700">✓ Easy for everyone</p>
      </div>
    </div>
  );
};

export default PhoneAuth;
