
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

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
      console.log('🛒 Cart was cleared after payment, not restoring from storage');
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

  // Load cart from localStorage when component mounts or user changes
  useEffect(() => {
    if (isLoading) return;

    console.log('🛒 Cart initialization - user:', user?.id, 'isInitialized:', isInitialized);

    if (user && !isInitialized) {
      // User logged in - merge guest cart with user cart
      const guestCart = loadCartFromStorage(); // guest cart
      const userCart = loadCartFromStorage(user.id); // user's saved cart
      
      console.log('🛒 Loading user cart - guest items:', guestCart.length, 'user items:', userCart.length);
      
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
      console.log('🛒 Loading guest cart - items:', guestCart.length);
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

  const addItem = (newItem: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems(prev => {
      const existingItem = prev.find(item => 
        item.id === newItem.id && item.weight === newItem.weight
      );
      
      if (existingItem) {
        return prev.map(item =>
          item.id === newItem.id && item.weight === newItem.weight
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, { ...newItem, quantity }];
    });
  };

  const removeItem = (id: string, weight: string) => {
    setItems(prev => prev.filter(item => !(item.id === id && item.weight === weight)));
  };

  const updateQuantity = (id: string, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, weight);
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.id === id && item.weight === weight
          ? { ...item, quantity }
          : item
      )
    );
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
    console.log('🛒 Clearing cart - current items count:', items.length);
    setItems([]);
    // Also clear from localStorage
    try {
      const key = getCartStorageKey(user?.id);
      localStorage.removeItem(key);
      // Set a flag to indicate cart was cleared after successful payment
      localStorage.setItem('cart_cleared_after_payment', 'true');
      console.log('✅ Cart cleared from localStorage:', key);
    } catch (error) {
      console.error('❌ Error clearing cart from localStorage:', error);
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
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
