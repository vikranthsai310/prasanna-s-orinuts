
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import ProfileCompletionDialog from '@/components/ProfileCompletionDialog';
import { sampleStorage } from '@/utils/sampleStorage';
import { mockProducts } from '@/data/mockProducts';
import { toast } from '@/components/ui/use-toast';

const Cart = () => {
  const { items, updateQuantity, removeItem, totalPrice, addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);

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
            image: product.image
          });
        }
      }
    });
  };

  const handleProceedToCheckout = () => {
    if (user) {
      // Check if user has completed profile (has name)
      if (user.name) {
        // Check if samples are already selected
        if (sampleStorage.hasSamplesSelected()) {
          // Add samples to cart and proceed to checkout
          addSamplesToCart();
          toast({
            title: "Your samples are ready!",
            description: "Previously selected samples have been added to your order.",
            variant: "default"
          });
          navigate('/checkout');
        } else {
          // No samples selected, go to samples page
          navigate('/samples');
        }
      } else {
        // User logged in but needs to complete profile
        setShowProfileCompletion(true);
      }
    } else {
      // User not logged in, redirect to auth page
      navigate('/auth', { state: { from: { pathname: '/checkout' } } });
    }
  };



  const handleProfileCompletion = () => {
    setShowProfileCompletion(false);
    // Check if samples are already selected after profile completion
    if (sampleStorage.hasSamplesSelected()) {
      // Add samples to cart and proceed to checkout
      addSamplesToCart();
      toast({
        title: "Your samples are ready!",
        description: "Previously selected samples have been added to your order.",
        variant: "default"
      });
      navigate('/checkout');
    } else {
      // No samples selected, go to samples page
      navigate('/samples');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-playfair text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link to="/products">
            <Button className="btn-primary">Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-playfair text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.id}-${item.weight}`} className="card-premium">
              <div className="flex items-start gap-4">
                {/* Product Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />
                
                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.weight}</p>
                  <p className="text-secondary font-semibold text-base">₹{item.price}</p>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.weight, item.quantity - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Price and Delete */}
                <div className="flex flex-col items-end gap-2 min-w-[100px] flex-shrink-0">
                  <p className="font-semibold text-lg text-right">₹{(item.price * item.quantity).toLocaleString()}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id, item.weight)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card-premium sticky top-4">
            <h2 className="font-semibold text-xl mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-secondary">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Estimated delivery: 3-5 business days
            </p>
            
            <Button 
              className="w-full btn-primary"
              onClick={handleProceedToCheckout}
            >
              Proceed to Checkout
            </Button>
            
            <Link to="/products" className="block w-full mt-3">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Completion Dialog */}
      <ProfileCompletionDialog
        isOpen={showProfileCompletion}
        onClose={() => setShowProfileCompletion(false)}
        onComplete={handleProfileCompletion}
      />
    </div>
  );
};

export default Cart;
