
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { validateCoupon, type Coupon } from '@/services/couponService';
import { getProductById } from '@/services/productService';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  weight: string;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string, weight: string) => void;
  updateQuantity: (id: string, weight: string, quantity: number) => void;
  updateItemWeight: (id: string, oldWeight: string, newWeight: string, newPrice: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  discount: number;
  finalTotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string, userId?: string) => Promise<{ success: boolean; message: string; }>;
  removeCoupon: () => void;
  mergeGuestCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper functions for localStorage
const getCartStorageKey = (userId?: string) => {
  return userId ? `cart_user_${userId}` : 'cart_guest';
};

const saveCartToStorage = (items: CartItem[], userId?: string) => {
  try {
    const key = getCartStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const loadCartFromStorage = (userId?: string): CartItem[] => {
  try {
    // Check if cart was recently cleared after payment
    const wasCleared = localStorage.getItem('cart_cleared_after_payment');
    if (wasCleared === 'true') {
      // Remove the flag and return empty cart
      localStorage.removeItem('cart_cleared_after_payment');
      return [];
    }
    
    const key = getCartStorageKey(userId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

const mergeCartItems = (guestItems: CartItem[], userItems: CartItem[]): CartItem[] => {
  const merged = [...userItems];
  
  guestItems.forEach(guestItem => {
    const existingIndex = merged.findIndex(item => 
      item.id === guestItem.id && item.weight === guestItem.weight
    );
    
    if (existingIndex >= 0) {
      // Item exists, merge quantities
      merged[existingIndex].quantity += guestItem.quantity;
    } else {
      // New item, add it
      merged.push(guestItem);
    }
  });
  
  return merged;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Load cart from localStorage when component mounts or user changes
  useEffect(() => {
    if (isLoading) return;

    if (user && !isInitialized) {
      // User logged in - merge guest cart with user cart
      const guestCart = loadCartFromStorage(); // guest cart
      const userCart = loadCartFromStorage(user.id); // user's saved cart
      
      if (guestCart.length > 0) {
        // Merge guest cart with user cart
        const mergedCart = mergeCartItems(guestCart, userCart);
        setItems(mergedCart);
        saveCartToStorage(mergedCart, user.id);
        
        // Clear guest cart after merging
        localStorage.removeItem('cart_guest');
        
        // Show success message
        const addedItems = guestCart.length;
        toast({
          title: "Cart items preserved! 🛒",
          description: `Your ${addedItems} item${addedItems > 1 ? 's have' : ' has'} been added to your cart after logging in.`,
          duration: 4000,
        });
      } else {
        // No guest cart, just load user cart
        setItems(userCart);
      }
    } else if (!user && !isInitialized) {
      // Guest user - load guest cart
      const guestCart = loadCartFromStorage();
      setItems(guestCart);
    }
    
    setIsInitialized(true);
  }, [user, isLoading, isInitialized]);

  // Handle logout scenario - preserve cart as guest cart
  useEffect(() => {
    if (isInitialized && !user && items.length > 0) {
      // User logged out with items in cart - save as guest cart
      saveCartToStorage(items); // Save as guest cart
    }
  }, [user, isInitialized, items]);

  // Save cart to localStorage whenever items change (but only after initialization)
  useEffect(() => {
    if (isInitialized && !isLoading) {
      saveCartToStorage(items, user?.id);
    }
  }, [items, user?.id, isInitialized, isLoading]);

  const addItem = async (newItem: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    try {
      // Check if this is a sample (free item with price = 0)
      const isSample = newItem.price === 0 || newItem.name.includes('(Sample)');
      
      if (isSample) {
        // Special handling for samples
        const existingSamples = items.filter(item => 
          item.price === 0 || item.name.includes('(Sample)')
        );
        
        // Check if this exact sample is already in cart
        const existingSample = existingSamples.find(item => 
          item.id === newItem.id && item.weight === newItem.weight
        );
        
        if (existingSample) {
          // Sample already exists - don't add again, just show message
          toast({
            title: "Sample already added",
            description: `${newItem.name} is already in your cart.`,
          });
          return;
        }
        
        // Check total sample limit (max 2 samples)
        const MAX_SAMPLES = 2;
        if (existingSamples.length >= MAX_SAMPLES) {
          toast({
            title: "Maximum samples reached",
            description: `You can only add ${MAX_SAMPLES} free samples per order.`,
            variant: "destructive"
          });
          return;
        }
        
        // Add sample with quantity 1 (always)
        setItems(prev => [...prev, { ...newItem, quantity: 1 }]);
        
        toast({
          title: "Sample added",
          description: `${newItem.name} has been added to your order.`,
        });
        return;
      }
      
      // Regular product handling - fetch product to check stock
      const product = await getProductById(newItem.id);
      
      if (!product) {
        toast({
          title: "Product not found",
          description: "This product is no longer available.",
          variant: "destructive"
        });
        return;
      }

      // Check current quantity in cart
      const existingItem = items.find(item => 
        item.id === newItem.id && item.weight === newItem.weight
      );
      
      const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
      const newTotalQuantity = currentQuantityInCart + quantity;

      // Validate against stock
      if (newTotalQuantity > product.stock) {
        toast({
          title: "Stock Limit Exceeded",
          description: `Only ${product.stock} units available in stock. You already have ${currentQuantityInCart} in your cart.`,
          variant: "destructive"
        });
        return;
      }

      setItems(prev => {
        if (existingItem) {
          return prev.map(item =>
            item.id === newItem.id && item.weight === newItem.weight
              ? { ...item, quantity: newTotalQuantity }
              : item
          );
        }
        
        return [...prev, { ...newItem, quantity }];
      });

      toast({
        title: "Added to cart",
        description: `${newItem.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeItem = (id: string, weight: string) => {
    setItems(prev => prev.filter(item => !(item.id === id && item.weight === weight)));
  };

  const updateQuantity = async (id: string, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, weight);
      return;
    }

    // Find the item
    const currentItem = items.find(item => item.id === id && item.weight === weight);
    
    // Check if this is a sample - samples should always have quantity 1
    const isSample = currentItem && (currentItem.price === 0 || currentItem.name.includes('(Sample)'));
    if (isSample) {
      // Samples can only be removed, not increased
      if (quantity > 1) {
        toast({
          title: "Sample quantity fixed",
          description: "Free samples are limited to 1 per item.",
        });
      }
      return; // Don't allow quantity changes for samples
    }

    try {
      // Fetch product to check stock
      const product = await getProductById(id);
      
      if (!product) {
        toast({
          title: "Product not found",
          description: "This product is no longer available.",
          variant: "destructive"
        });
        removeItem(id, weight);
        return;
      }

      // Validate against stock
      if (quantity > product.stock) {
        toast({
          title: "Stock Limit Exceeded",
          description: `Only ${product.stock} units available in stock.`,
          variant: "destructive"
        });
        // Set to maximum available stock
        setItems(prev =>
          prev.map(item =>
            item.id === id && item.weight === weight
              ? { ...item, quantity: product.stock }
              : item
          )
        );
        return;
      }
    
      setItems(prev =>
        prev.map(item =>
          item.id === id && item.weight === weight
            ? { ...item, quantity }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateItemWeight = (id: string, oldWeight: string, newWeight: string, newPrice: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id && item.weight === oldWeight
          ? { ...item, weight: newWeight, price: newPrice }
          : item
      )
    );
    
    toast({
      title: "Weight Updated",
      description: `Item weight changed to ${newWeight}`,
      duration: 2000,
    });
  };

  const clearCart = () => {
    setItems([]);
    // Also clear from localStorage
    try {
      const key = getCartStorageKey(user?.id);
      localStorage.removeItem(key);
      // Set a flag to indicate cart was cleared after successful payment
      localStorage.setItem('cart_cleared_after_payment', 'true');
    } catch (error) {
      // Silently handle error
    }
  };

  const mergeGuestCart = () => {
    if (user) {
      const guestCart = loadCartFromStorage(); // guest cart
      if (guestCart.length > 0) {
        const mergedCart = mergeCartItems(guestCart, items);
        setItems(mergedCart);
        localStorage.removeItem('cart_guest');
      }
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate discount based on applied coupon
  const discount = appliedCoupon ? (() => {
    if (appliedCoupon.discountType === 'percentage') {
      const percentageDiscount = (subtotal * appliedCoupon.discountValue) / 100;
      // Apply max discount cap if specified
      return appliedCoupon.maxDiscountAmount 
        ? Math.min(percentageDiscount, appliedCoupon.maxDiscountAmount)
        : percentageDiscount;
    } else {
      // Fixed discount
      return Math.min(appliedCoupon.discountValue, subtotal);
    }
  })() : 0;
  
  const finalTotal = Math.max(subtotal - discount, 0);
  const totalPrice = finalTotal; // For backward compatibility
  
  const applyCoupon = async (code: string, userId?: string): Promise<{ success: boolean; message: string; }> => {
    try {
      const validation = await validateCoupon(code, subtotal, userId);
      
      if (validation.isValid && validation.coupon) {
        setAppliedCoupon(validation.coupon);
        return {
          success: true,
          message: `Coupon applied! You saved ₹${validation.discountAmount?.toFixed(2) || '0.00'}`
        };
      } else {
        return {
          success: false,
          message: validation.message || 'Invalid coupon code'
        };
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      return {
        success: false,
        message: 'Failed to apply coupon. Please try again.'
      };
    }
  };
  
  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast({
      title: "Coupon Removed",
      description: "The discount has been removed from your cart.",
      duration: 2000,
    });
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      updateItemWeight,
      clearCart,
      totalItems,
      totalPrice,
      subtotal,
      discount,
      finalTotal,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      mergeGuestCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
