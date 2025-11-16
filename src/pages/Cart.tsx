
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Package, Truck, Shield, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import ProfileCompletionDialog from '@/components/ProfileCompletionDialog';
import CartWeightSelector from '@/components/CartWeightSelector';
import { sampleStorage } from '@/utils/sampleStorage';
import { toast } from '@/components/ui/use-toast';
import { useDiscounts } from '@/hooks/useDiscounts';

const Cart = () => {
  const { items, updateQuantity, removeItem, totalPrice, addItem, updateItemWeight } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const { calculatePricing } = useDiscounts();

  // Calculate total savings
  const calculateTotalSavings = () => {
    let totalSavings = 0;
    items.forEach(item => {
      const pricing = calculatePricing(item.id, item.price);
      // If item already has discount applied (price is discounted), calculate original price
      if (pricing.hasDiscount) {
        const originalPrice = Math.round(item.price / (1 - pricing.discountPercentage / 100));
        const savingsPerItem = (originalPrice - item.price) * item.quantity;
        totalSavings += savingsPerItem;
      }
    });
    return Math.round(totalSavings);
  };

  const totalSavings = calculateTotalSavings();

  const addSamplesToCart = () => {
    const selectedSamples = sampleStorage.getSelectedSamples();
    const [sampleProducts, setSampleProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const loadSampleProducts = async () => {
      try {
        const products = await getAllProducts();
        setSampleProducts(products.slice(0, 6));
      } catch (error) {
        console.error('Error loading sample products:', error);
      }
    };
    loadSampleProducts();
  }, []);
    
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-accent/10 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-lg mx-auto">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-secondary/10 blur-3xl rounded-full"></div>
              <ShoppingBag className="w-24 h-24 mx-auto text-secondary relative animate-bounce" strokeWidth={1.5} />
            </div>
            <h1 className="font-playfair text-4xl font-bold mb-3 text-foreground">Your Cart is Empty</h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Discover our premium collection of handpicked dry fruits and nuts.<br />
              Every product is carefully selected for exceptional quality.
            </p>
            <Link to="/products">
              <Button className="btn-primary text-lg px-8 py-6 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                Explore Our Collection
              </Button>
            </Link>
            
            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-border/50">
              <div className="text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-secondary" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">Premium Quality</p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-secondary" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">Free Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-secondary" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">100% Secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/5 to-background">
      <div className="container mx-auto px-4 py-8 lg:py-12 animate-fade-in">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="font-playfair text-4xl lg:text-5xl font-bold mb-2 text-foreground">Shopping Cart</h1>
          <p className="text-muted-foreground text-lg">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const pricing = calculatePricing(item.id, item.price);
              // Calculate original price if discount is applied
              const originalPrice = pricing.hasDiscount 
                ? Math.round(item.price / (1 - pricing.discountPercentage / 100))
                : item.price;
              const itemSavings = pricing.hasDiscount 
                ? (originalPrice - item.price) * item.quantity
                : 0;

              return (
              <div 
                key={`${item.id}-${item.weight}`} 
                className="group bg-card border border-border/50 rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Mobile Layout */}
                <div className="flex flex-col sm:hidden gap-4">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="relative flex-shrink-0 bg-accent rounded-xl">
                      <div className="absolute inset-0 bg-secondary/10 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="relative w-24 h-24 object-cover rounded-xl shadow-md"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-playfair text-lg font-semibold mb-2 leading-tight text-foreground">{item.name}</h3>
                      
                      {/* Weight Selector */}
                      <div className="mb-2">
                        <CartWeightSelector
                          productId={item.id}
                          currentWeight={item.weight}
                          onWeightChange={(newWeight, newPrice) => 
                            updateItemWeight(item.id, item.weight, newWeight, newPrice)
                          }
                        />
                      </div>
                      
                      {/* Price with Discount */}
                      {pricing.hasDiscount ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <span className="text-sm text-muted-foreground/80">₹{originalPrice}</span>
                              <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-red-500/70 transform -rotate-12"></div>
                            </div>
                            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-2 py-0.5 rounded-full">
                              <span className="font-bold text-[10px] tracking-wide">{pricing.discountPercentage}% OFF</span>
                            </div>
                          </div>
                          <p className="font-bold text-lg text-[#C99700]">
                            ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-secondary font-bold text-lg">₹{item.price.toLocaleString()}</p>
                      )}
                    </div>
                    
                    {/* Delete Button - Top Right */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id, item.weight)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 w-9 p-0 flex-shrink-0 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Quantity and Price Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.weight, item.quantity - 1)}
                        className="h-9 w-9 p-0 hover:bg-secondary/10 hover:text-secondary rounded-lg"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold text-base">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                        className="h-9 w-9 p-0 hover:bg-secondary/10 hover:text-secondary rounded-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Total Price */}
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                      <p className="font-bold text-xl text-secondary">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Desktop/Tablet Layout */}
                <div className="hidden sm:flex items-center gap-6">
                  {/* Product Image */}
                  <div className="relative flex-shrink-0 bg-accent rounded-xl">
                    <div className="absolute inset-0 bg-secondary/10 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="relative w-28 h-28 object-cover rounded-xl shadow-md"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-playfair text-xl font-semibold mb-3 text-foreground">{item.name}</h3>
                    
                    {/* Weight Selector */}
                    <div className="mb-3">
                      <CartWeightSelector
                        productId={item.id}
                        currentWeight={item.weight}
                        onWeightChange={(newWeight, newPrice) => 
                          updateItemWeight(item.id, item.weight, newWeight, newPrice)
                        }
                      />
                    </div>
                    
                    {/* Price with Discount */}
                    {pricing.hasDiscount ? (
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <span className="text-base text-muted-foreground/80">₹{originalPrice}</span>
                          <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-red-500/70 transform -rotate-12"></div>
                        </div>
                        <p className="font-bold text-lg text-[#C99700]">
                          ₹{item.price.toLocaleString()}
                        </p>
                        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-2 py-1 rounded-full">
                          <span className="font-bold text-xs tracking-wide">{pricing.discountPercentage}% OFF</span>
                        </div>
                        <span className="text-sm text-muted-foreground font-normal">per unit</span>
                      </div>
                    ) : (
                      <p className="text-secondary font-bold text-lg">₹{item.price.toLocaleString()} <span className="text-sm text-muted-foreground font-normal">per unit</span></p>
                    )}
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.weight, item.quantity - 1)}
                      className="h-10 w-10 p-0 hover:bg-secondary/10 hover:text-secondary rounded-lg"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-5 h-5" />
                    </Button>
                    <span className="w-14 text-center font-semibold text-lg">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                      className="h-10 w-10 p-0 hover:bg-secondary/10 hover:text-secondary rounded-lg"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  {/* Price and Delete */}
                  <div className="flex flex-col items-end gap-3 min-w-[120px] flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Total Price</p>
                      <p className="font-bold text-2xl text-secondary">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id, item.weight)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 px-4 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            );
            })}
            
            {/* Continue Shopping Link - Mobile */}
            <Link to="/products" className="block lg:hidden">
              <Button variant="outline" className="w-full py-6 text-base border-2 hover:border-secondary hover:text-secondary transition-all">
                Continue Shopping
              </Button>
            </Link>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-card to-accent/5 border-2 border-border/50 rounded-2xl p-6 lg:p-8 shadow-xl sticky top-4">
              <h2 className="font-playfair text-2xl font-bold mb-6 text-foreground">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
                </div>
                
                {/* Show total savings if applicable */}
                {totalSavings > 0 && (
                  <div className="flex items-center justify-between text-base bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-3 -mx-1">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-700">You're Saving</span>
                    </div>
                    <span className="font-bold text-lg text-green-600">₹{totalSavings.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span className="text-muted-foreground">Shipping</span>
                  </div>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                
                <div className="flex items-center justify-between text-base pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-secondary" />
                    <span className="text-muted-foreground">Free Samples</span>
                  </div>
                  <span className="text-secondary font-semibold text-sm">Available</span>
                </div>
                
                <div className="border-t-2 border-secondary/20 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-playfair text-xl font-semibold">Total</span>
                    <span className="font-playfair text-3xl font-bold text-secondary">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-accent/30 border border-secondary/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold mb-1 text-foreground">Free Express Delivery</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Estimated delivery: <span className="font-semibold text-foreground">3-5 business days</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full btn-primary text-lg py-6 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all mb-3"
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </Button>
              
              <Link to="/products" className="hidden lg:block w-full">
                <Button variant="outline" className="w-full py-6 text-base border-2 hover:border-secondary hover:text-secondary transition-all">
                  Continue Shopping
                </Button>
              </Link>
              
              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-border/50">
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-1.5 text-secondary" strokeWidth={1.5} />
                  <p className="text-xs text-muted-foreground leading-tight">Secure Payment</p>
                </div>
                <div className="text-center">
                  <Package className="w-6 h-6 mx-auto mb-1.5 text-secondary" strokeWidth={1.5} />
                  <p className="text-xs text-muted-foreground leading-tight">Premium Quality</p>
                </div>
                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto mb-1.5 text-secondary" strokeWidth={1.5} />
                  <p className="text-xs text-muted-foreground leading-tight">Fast Delivery</p>
                </div>
              </div>
            </div>
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
