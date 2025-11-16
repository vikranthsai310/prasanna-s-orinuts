import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { getProductById } from '@/services/productService';
import { Product } from '@/types';
import { useDiscounts } from '@/hooks/useDiscounts';

interface CartWeightSelectorProps {
  productId: string;
  currentWeight: string;
  onWeightChange: (newWeight: string, newPrice: number) => void;
}

const CartWeightSelector = ({ productId, currentWeight, onWeightChange }: CartWeightSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const { calculatePricing } = useDiscounts();
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const fetchedProduct = await getProductById(productId);
        setProduct(fetchedProduct);
      } catch (error) {
        console.error('Error loading product:', error);
      }
    };
    loadProduct();
  }, [productId]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  if (!product) {
    return (
      <div className="relative">
        <label className="text-xs font-semibold text-[#6B5750] mb-1.5 block uppercase tracking-wide">
          Weight
        </label>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border-2 border-[#E0DCD7] rounded-lg min-w-[120px]">
          <span className="text-[#6B5750] text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  const weights = Object.keys(product.prices);
  
  const handleWeightSelect = (weight: string) => {
    const originalPrice = product.prices[weight];
    const pricing = calculatePricing(productId, originalPrice);
    onWeightChange(weight, pricing.discountedPrice); // Pass discounted price
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="w-full max-w-[200px]">
      {/* Label */}
      <label className="text-[10px] font-semibold text-[#6B5750] mb-1 block uppercase tracking-wider">
        Weight
      </label>
      
      {/* Current Weight Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-white border-2 border-[#E0DCD7] rounded-lg hover:border-[#C99700] hover:shadow-md transition-all text-sm font-semibold text-[#2C1F1A] justify-between group"
      >
        <span className="text-[#2C1F1A]">{currentWeight}</span>
        <ChevronDown className={`w-4 h-4 text-[#C99700] transition-transform group-hover:scale-110 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu - Now part of document flow */}
      {isOpen && (
        <div className="mt-2 bg-white border-2 border-[#E0DCD7] rounded-xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="p-2 max-h-[320px] overflow-y-auto">
            <div className="text-[10px] font-semibold text-[#6B5750] px-3 py-2 uppercase tracking-wider">
              Select Weight
            </div>
              {weights.map((weight) => {
                const originalPrice = product.prices[weight];
                const pricing = calculatePricing(productId, originalPrice);
                const isSelected = weight === currentWeight;
                
                return (
                  <button
                    key={weight}
                    onClick={() => handleWeightSelect(weight)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left
                      ${isSelected 
                        ? 'bg-gradient-to-r from-[#FFF9E6] to-[#FFF5D6] border-2 border-[#C99700] shadow-sm' 
                        : 'hover:bg-[#FFF9E6]/50 border-2 border-transparent hover:border-[#E0DCD7]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`
                        w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                        ${isSelected ? 'border-[#C99700] bg-[#C99700]' : 'border-[#E0DCD7] bg-white'}
                      `}>
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className={`font-semibold text-sm ${isSelected ? 'text-[#2C1F1A]' : 'text-[#6B5750]'}`}>
                        {weight}
                      </span>
                    </div>
                    
                    {/* Price with discount */}
                    {pricing.hasDiscount ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[9px] text-muted-foreground/70 line-through">₹{originalPrice}</span>
                        <span className={`font-bold text-sm ${isSelected ? 'text-green-600' : 'text-green-600/80'}`}>
                          ₹{pricing.discountedPrice}
                        </span>
                      </div>
                    ) : (
                      <span className={`font-bold text-sm ${isSelected ? 'text-[#C99700]' : 'text-[#6B5750]'}`}>
                        ₹{originalPrice}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartWeightSelector;
