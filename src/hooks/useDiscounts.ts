import { useState, useEffect } from 'react';
import { getActiveDiscounts, ProductDiscount } from '@/services/discountService';

interface DiscountMap {
  [productId: string]: ProductDiscount;
}

export interface ProductPricing {
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  savings: number;
  hasDiscount: boolean;
}

/**
 * Hook to fetch and manage product discounts
 */
export const useDiscounts = () => {
  const [discounts, setDiscounts] = useState<DiscountMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setLoading(true);
        const activeDiscounts = await getActiveDiscounts();
        
        // Convert array to map for easy lookup
        const discountMap: DiscountMap = {};
        activeDiscounts.forEach(discount => {
          discountMap[discount.id] = discount;
        });
        
        setDiscounts(discountMap);
        setError(null);
      } catch (err) {
        console.error('Error fetching discounts:', err);
        setError('Failed to load discounts');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  /**
   * Calculate pricing for a product with discount applied
   */
  const calculatePricing = (productId: string, originalPrice: number): ProductPricing => {
    const discount = discounts[productId];
    
    if (!discount || !discount.isActive) {
      return {
        originalPrice,
        discountedPrice: originalPrice,
        discountPercentage: 0,
        savings: 0,
        hasDiscount: false
      };
    }

    const discountAmount = (originalPrice * discount.discountPercentage) / 100;
    const discountedPrice = originalPrice - discountAmount;

    return {
      originalPrice,
      discountedPrice: Math.round(discountedPrice),
      discountPercentage: discount.discountPercentage,
      savings: Math.round(discountAmount),
      hasDiscount: true
    };
  };

  /**
   * Get discount percentage for a product
   */
  const getDiscountPercentage = (productId: string): number => {
    const discount = discounts[productId];
    return discount?.isActive ? discount.discountPercentage : 0;
  };

  /**
   * Check if product has active discount
   */
  const hasDiscount = (productId: string): boolean => {
    return !!discounts[productId]?.isActive;
  };

  return {
    discounts,
    loading,
    error,
    calculatePricing,
    getDiscountPercentage,
    hasDiscount
  };
};
