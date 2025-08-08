import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ShoppingCart, Chrome, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GoogleSignInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onGoogleSignInSuccess?: () => void;
}

const GoogleSignInDialog = ({ isOpen, onClose, onSuccess, onGoogleSignInSuccess }: GoogleSignInDialogProps) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      
      toast({
        title: "Welcome! 🎉",
        description: "You've been successfully signed in. Please complete your profile...",
        duration: 3000,
      });
      
      onClose();
      
      // Small delay to allow the auth context to update
      setTimeout(() => {
        if (onGoogleSignInSuccess) {
          onGoogleSignInSuccess();
        } else if (onSuccess) {
          onSuccess();
        } else {
          navigate('/checkout');
        }
      }, 500);
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      let errorMessage = "Failed to sign in with Google. Please try again.";
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in cancelled. Please try again when ready.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Sign-in Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-secondary/20 to-primary/20">
            <ShoppingCart className="h-8 w-8 text-secondary" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Sign in to Continue
          </DialogTitle>
          <DialogDescription className="text-center">
            Please sign in with your Google account to proceed to checkout and complete your purchase.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-11 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Chrome className="mr-2 h-5 w-5" />
                Continue with Google
              </>
            )}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Your cart items will be preserved after signing in</p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/auth')}
              className="flex-1"
              disabled={isLoading}
            >
              Other Options
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleSignInDialog; 