
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { initializeRazorpay, createRazorpayOrder, openRazorpayCheckout, verifyPayment } from '@/services/paymentService';
import { createShipment, getOrderById, updateOrderStatus, updatePaymentStatus } from '@/services/orderService';
import { toast } from '@/components/ui/use-toast';
import { getUserAddresses, type Address } from '@/services/addressService';
import { Check, ChevronDown, Edit, Gift } from 'lucide-react';
import { sampleStorage } from '@/utils/sampleStorage';
import { ADDRESS_TYPES, AddressType, addAddress } from '@/services/addressService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'Home' as AddressType,
    customAddressType: '',
    saveToProfile: true
  });
  
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [selectedSamples, setSelectedSamples] = useState(sampleStorage.getSelectedSamples());
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      console.log('📱 Mobile device detected:', mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load Razorpay script on component mount
  useEffect(() => {
    const loadRazorpay = async () => {
      console.log('🔄 Loading Razorpay...');
      
      // Show loading message for mobile users
      if (isMobile) {
        console.log('📱 Mobile device detected, initializing payment gateway...');
      }
      
      const result = await initializeRazorpay();
      console.log('🔄 Razorpay load result:', result);
      setRazorpayLoaded(result);
      if (!result) {
        console.error('❌ Failed to load Razorpay');
        const errorMessage = isMobile 
          ? "Payment gateway failed to load. Please check your internet connection and refresh the page."
          : "Failed to load payment gateway. Please try again later.";
        
        toast({
          title: "Payment Gateway Error",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        console.log('✅ Razorpay loaded successfully');
        if (isMobile) {
          console.log('📱 Payment gateway ready for mobile payments');
        }
      }
    };
    
    loadRazorpay();
  }, [isMobile]); // Add isMobile as dependency
  
  // Load saved addresses if user is logged in
  useEffect(() => {
    const fetchAddresses = async () => {
      if (user?.id) {
        setIsLoadingAddresses(true);
        try {
          const addresses = await getUserAddresses(user.id);
          setSavedAddresses(addresses);
          
          // If there are addresses, select the default one
          const defaultAddress = addresses.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            setUseNewAddress(false);
          } else if (addresses.length > 0) {
            setSelectedAddressId(addresses[0].id);
            setUseNewAddress(false);
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
        } finally {
          setIsLoadingAddresses(false);
        }
      }
    };
    
    fetchAddresses();
  }, [user?.id]);

  // Update samples when returning from samples page
  useEffect(() => {
    setSelectedSamples(sampleStorage.getSelectedSamples());
  }, []);
  
  // Update form data when selected address changes
  useEffect(() => {
    if (!useNewAddress && selectedAddressId) {
      const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
      if (selectedAddress) {
        setFormData(prev => ({
          ...prev,
          name: selectedAddress.name || user?.name || '',
          email: user?.email || '',
          phone: selectedAddress.phone || user?.phone || '',
          address: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          addressType: selectedAddress.type as AddressType,
          customAddressType: '',
          saveToProfile: false // Don't save existing address again
        }));
      }
    }
  }, [selectedAddressId, useNewAddress, savedAddresses, user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.addressType) newErrors.addressType = 'Address type is required';
    
    // Custom address type validation
    if (formData.addressType === 'Other' && !formData.customAddressType.trim()) {
      newErrors.customAddressType = 'Please specify the address type';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId);
    setUseNewAddress(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    // Prevent default form submission if event is provided
    if (e) {
      e.preventDefault();
    }
    
    console.log('🔄 Starting checkout process...');
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    
    if (!user) {
      console.log('❌ User not authenticated');
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your order.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    if (!razorpayLoaded) {
      console.log('❌ Razorpay not loaded');
      const errorMessage = isMobile 
        ? "Payment gateway is loading. Please wait a moment and try again."
        : "Payment gateway is not available. Please refresh the page and try again.";
      
      toast({
        title: "Payment Gateway Error",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    console.log('🔄 Processing order...');
    
    try {
      // Save address to profile if user wants to
      if (user && formData.saveToProfile && useNewAddress) {
        try {
          console.log('💾 Saving address to profile...');
          const addressType = formData.addressType === 'Other' ? formData.customAddressType : formData.addressType;
          
          await addAddress({
            userId: user.id,
            type: addressType as AddressType,
            name: formData.name,
            phone: formData.phone,
            street: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            isDefault: savedAddresses.length === 0 // Set as default if it's the first address
          });
          
          toast({
            title: "Address Saved",
            description: "Your address has been saved to your profile for future orders.",
            variant: "default"
          });
        } catch (addressError) {
          console.error('❌ Error saving address:', addressError);
          // Don't block the order if address saving fails
          toast({
            title: "Address Save Failed",
            description: "Your order will continue, but we couldn't save your address.",
            variant: "destructive"
          });
        }
      }

      console.log('💰 Creating Razorpay order...');
      // Create a Razorpay order
      const orderId = await createRazorpayOrder(
        items,
        totalPrice,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        user.id // Pass the authenticated user's Firebase UID
      );
      
      console.log('🚀 Opening Razorpay checkout modal...');
      // Open Razorpay checkout
      openRazorpayCheckout(
        orderId,
        totalPrice,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        // Success handler
        async (response) => {
          console.log('✅ Payment successful, verifying...');
          try {
            const result = await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            
            if (result.isVerified) {
              console.log('✅ Payment verified successfully');
              
              // Update order status on client side (in case server couldn't do it)
              if (result.firebaseOrderId) {
                try {
                  console.log('🔄 Updating order payment status for:', result.firebaseOrderId);
                  await updatePaymentStatus(result.firebaseOrderId, 'paid');
                  await updateOrderStatus(result.firebaseOrderId, 'processing');
                  console.log('✅ Order status updated on client side');
                } catch (orderUpdateError) {
                  console.warn('⚠️ Could not update order status on client side:', orderUpdateError);
                  // Don't fail the entire process if this fails
                }
              }
              
              toast({
                title: "Payment Successful",
                description: "Your order has been placed successfully! You will receive tracking details soon.",
                variant: "default"
              });
              
              console.log('🛒 About to clear cart...');
              // Clear cart and redirect to order confirmation
              clearCart();
              console.log('✅ Cart clearing initiated');
              
              navigate(`/order-confirmation`, { 
                state: { 
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  firebaseOrderId: result.firebaseOrderId
                } 
              });
            } else {
              console.log('❌ Payment verification failed');
              toast({
                title: "Payment Verification Failed",
                description: "We couldn't verify your payment. Please contact support.",
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error('❌ Payment verification failed:', error);
            toast({
              title: "Payment Error",
              description: "There was an error processing your payment.",
              variant: "destructive"
            });
          } finally {
            setIsProcessing(false);
          }
        },
        // Failure handler
        (error) => {
          console.error('❌ Razorpay payment failed:', error);
          
          // Mobile-specific error messages
          let errorMessage = "Your payment was not successful. Please try again.";
          if (isMobile) {
            if (error.error?.code === 'PAYMENT_CANCELLED') {
              errorMessage = "Payment was cancelled. You can try again anytime.";
            } else if (error.error?.code === 'NETWORK_ERROR') {
              errorMessage = "Network connection issue. Please check your internet and try again.";
            } else if (error.error?.description?.includes('app')) {
              errorMessage = "Please ensure your banking app is updated and try again.";
            }
          }
          
          toast({
            title: "Payment Failed",
            description: error.error?.description || error.message || errorMessage,
            variant: "destructive"
          });
          setIsProcessing(false);
        }
      );
    } catch (error) {
      console.error('❌ Order creation failed:', error);
      toast({
        title: "Order Creation Failed",
        description: "We couldn't create your order. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="font-playfair text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add some items to your cart before checkout.
          </p>
          <Button onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-playfair text-3xl font-bold mb-8">Checkout</h1>
      
      {/* Debug Information - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Razorpay Loaded: {razorpayLoaded ? '✅' : '❌'}</p>
          <p>User: {user ? '✅ ' + user.name : '❌'}</p>
          <p>Items in cart: {items.length}</p>
          <p>Total: ₹{totalPrice}</p>
          <p>Processing: {isProcessing ? '✅' : '❌'}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Form */}
        <div className="card-premium">
          <h2 className="font-semibold text-xl mb-6">Shipping Information</h2>
          
          {/* Saved Addresses Section */}
          {user && savedAddresses.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Your Saved Addresses</h3>
                <Button 
                  variant="link" 
                  className="text-secondary p-0 h-auto"
                  onClick={() => navigate('/profile')}
                >
                  Manage Addresses
                </Button>
              </div>
              
              <div className="space-y-3">
                <Select 
                  value={useNewAddress ? 'new' : selectedAddressId || ''} 
                  onValueChange={(value) => {
                    if (value === 'new') {
                      setUseNewAddress(true);
                      setFormData(prev => ({
                        ...prev,
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        address: '',
                        city: '',
                        state: '',
                        pincode: '',
                        addressType: 'Home' as AddressType,
                        customAddressType: '',
                        saveToProfile: true
                      }));
                    } else {
                      handleAddressChange(value);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an address" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedAddresses.map((address) => (
                      <SelectItem key={address.id} value={address.id || ''}>
                        <div className="flex items-center">
                          <span>{address.type}: {address.street.substring(0, 30)}{address.street.length > 30 ? '...' : ''}</span>
                          {address.isDefault && (
                            <span className="ml-2 text-xs bg-accent text-accent-foreground px-1 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="new">+ Add a new address</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {!useNewAddress && selectedAddressId && (
                <div className="mt-4 p-3 bg-accent/20 rounded-md">
                  {savedAddresses
                    .filter(addr => addr.id === selectedAddressId)
                    .map((addr) => (
                      <div key={addr.id} className="text-sm">
                        <p className="font-medium flex items-center gap-2">
                          <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-xs">
                            {addr.type}
                          </span>
                          {addr.name}
                        </p>
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="mt-1">{addr.phone}</p>
                      </div>
                    ))}
                </div>
              )}
              
              {!useNewAddress && (
                <Button 
                  variant="link" 
                  className="mt-2 p-0 h-auto"
                  onClick={() => setUseNewAddress(true)}
                >
                  Use a different address
                </Button>
              )}
            </div>
          )}
          
          {/* New Address Form */}
          {(useNewAddress || savedAddresses.length === 0) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`input-field w-full ${errors.name ? 'border-destructive' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`input-field w-full ${errors.phone ? 'border-destructive' : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input-field w-full ${errors.email ? 'border-destructive' : ''}`}
                  placeholder="Enter your email address"
                />
                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
              </div>
              
              {/* Address Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Address Type *</label>
                  <Select
                    value={formData.addressType}
                    onValueChange={(value: AddressType) => 
                      setFormData(prev => ({ ...prev, addressType: value, customAddressType: '' }))
                    }
                  >
                    <SelectTrigger className={`w-full ${errors.addressType ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Select address type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADDRESS_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.addressType && <p className="text-destructive text-sm mt-1">{errors.addressType}</p>}
                </div>
                
                {formData.addressType === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Custom Address Type *</label>
                    <input
                      type="text"
                      name="customAddressType"
                      value={formData.customAddressType}
                      onChange={handleInputChange}
                      className={`input-field w-full ${errors.customAddressType ? 'border-destructive' : ''}`}
                      placeholder="e.g., Business, Relative, etc."
                    />
                    {errors.customAddressType && <p className="text-destructive text-sm mt-1">{errors.customAddressType}</p>}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`input-field w-full ${errors.address ? 'border-destructive' : ''}`}
                  placeholder="Enter your complete address"
                />
                {errors.address && <p className="text-destructive text-sm mt-1">{errors.address}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`input-field w-full ${errors.city ? 'border-destructive' : ''}`}
                    placeholder="City"
                  />
                  {errors.city && <p className="text-destructive text-sm mt-1">{errors.city}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`input-field w-full ${errors.state ? 'border-destructive' : ''}`}
                    placeholder="State"
                  />
                  {errors.state && <p className="text-destructive text-sm mt-1">{errors.state}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className={`input-field w-full ${errors.pincode ? 'border-destructive' : ''}`}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                  {errors.pincode && <p className="text-destructive text-sm mt-1">{errors.pincode}</p>}
                </div>
              </div>
              
              {user && (
                <div className="flex items-center space-x-2 mt-4">
                  <input
                    type="checkbox"
                    id="saveToProfile"
                    name="saveToProfile"
                    checked={formData.saveToProfile}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-secondary focus:ring-secondary"
                  />
                  <label htmlFor="saveToProfile" className="text-sm font-medium">
                    Save this address to my profile for future orders
                  </label>
                </div>
              )}
            </form>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="card-premium">
          <h2 className="font-semibold text-xl mb-6">Order Summary</h2>
          
          {/* Selected Samples Section */}
          {selectedSamples.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-green-800 flex items-center">
                  <Gift className="w-4 h-4 mr-2" />
                  Your Free Samples
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/samples')}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Change
                </Button>
              </div>
              <div className="space-y-2">
                {selectedSamples.map(sample => (
                  <div key={sample.id} className="flex items-center text-sm">
                    <Check className="w-3 h-3 text-green-600 mr-2" />
                    <span>{sample.name} (50g sample) - FREE</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={`${item.id}-${item.weight}`} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground ml-2">({item.weight})</span>
                  <span className="text-muted-foreground ml-2">x {item.quantity}</span>
                  {item.price === 0 && (
                    <span className="ml-2 text-green-600 text-xs font-medium">FREE SAMPLE</span>
                  )}
                </div>
                <span className="font-semibold">
                  {item.price === 0 ? 'FREE' : `₹${(item.price * item.quantity).toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total</span>
              <span className="text-secondary">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <Button 
              type="button"
              onClick={() => handleSubmit()}
              disabled={isProcessing || !razorpayLoaded}
              className="w-full btn-secondary"
            >
              {isProcessing ? 'Processing...' : 'Pay with Razorpay'}
            </Button>
            
            {!razorpayLoaded && (
              <p className="text-xs text-red-500 text-center">
                Payment gateway is loading... Please wait.
              </p>
            )}
            
            {isMobile && razorpayLoaded && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 text-center">
                  📱 <strong>Mobile Payment Tips:</strong><br />
                  • Ensure you have a stable internet connection<br />
                  • Keep your banking app updated for UPI payments<br />
                  • For card payments, ensure 3D Secure is enabled
                </p>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground text-center">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
