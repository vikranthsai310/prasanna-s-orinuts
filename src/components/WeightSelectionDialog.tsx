import { useState } from 'react';
import { X, Package, Check, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/components/ui/use-toast';
import { useDiscounts } from '@/hooks/useDiscounts';

interface WeightOption {
  weight: string;
  price: number;
  popular?: boolean;
  savings?: string;
}

interface WeightSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    image: string;
    prices: {
      [key: string]: number;
    };
  };
}

const WeightSelectionDialog = ({ isOpen, onClose, product }: WeightSelectionDialogProps) => {
  const { addItem } = useCart();
  const { calculatePricing } = useDiscounts();
  const [selectedWeight, setSelectedWeight] = useState<string>('250g');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  // Convert prices object to weight options array
  const weightOptions: WeightOption[] = Object.entries(product.prices).map(([weight, price], index) => {
    const basePrice = product.prices['250g'] || 0;
    const currentPrice = price;
    const expectedPrice = basePrice * (parseInt(weight) / 250);
    const bulkSavings = expectedPrice > currentPrice ? Math.round(((expectedPrice - currentPrice) / expectedPrice) * 100) : 0;

    return {
      weight,
      price,
      popular: index === 1, // Middle option is popular
      savings: bulkSavings > 0 ? `Save ${bulkSavings}%` : undefined
    };
  });

  // Calculate pricing with discounts
  const selectedPrice = product.prices[selectedWeight];
  const pricing = calculatePricing(product.id, selectedPrice);
  const finalPrice = pricing.discountedPrice;

  const handleAddToCart = () => {
    setIsAdding(true);
    const selectedPrice = product.prices[selectedWeight];
    const pricing = calculatePricing(product.id, selectedPrice);
    
    addItem({
      id: product.id,
      name: product.name,
      price: pricing.discountedPrice, // Use discounted price
      weight: selectedWeight,
      image: product.image
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} (${selectedWeight}) has been added to your cart.`,
      duration: 3000,
    });

    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 500);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-[#FAF8F5] rounded-2xl shadow-2xl max-w-lg w-full pointer-events-auto animate-scale-in border-2 border-[#E0DCD7] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#F8F5F0] to-[#F6E1B3]/30 p-5 border-b border-[#E0DCD7]">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-[#6B5750] hover:text-[#2C1F1A] transition-colors p-1.5 hover:bg-white/80 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-3 pr-8">
              {/* Product Image - Smaller */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-[#C99700]/20 rounded-lg blur-md"></div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="relative w-16 h-16 object-cover rounded-lg shadow-lg border-2 border-white"
                />
              </div>
              
              {/* Product Info */}
              <div>
                <h2 className="font-playfair text-xl font-bold text-[#2C1F1A] mb-0.5">
                  {product.name}
                </h2>
                <p className="text-[#6B5750] text-xs">
                  Select your preferred weight
                </p>
              </div>
            </div>
          </div>

          {/* Weight Options */}
          <div className="p-5 bg-white max-h-[60vh] overflow-y-auto">
            {/* Product Discount Badge - Compact */}
            {pricing.hasDiscount && (
              <div className="mb-3 p-2.5 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-2.5 py-1 rounded-full shadow-md">
                    <span className="font-bold text-xs tracking-wide">{pricing.discountPercentage}% OFF</span>
                  </div>
                  <span className="text-xs font-semibold text-red-700">Special Discount Applied!</span>
                </div>
              </div>
            )}

            <div className="space-y-2.5 mb-6">
              {weightOptions.map((option) => {
                const optionPricing = calculatePricing(product.id, option.price);
                const isSelected = option.weight === selectedWeight;
                
                return (
                  <button
                    key={option.weight}
                    onClick={() => setSelectedWeight(option.weight)}
                    className={`
                      relative w-full p-3 rounded-lg border-2 transition-all duration-200 bg-white
                      ${selectedWeight === option.weight 
                        ? 'border-[#C99700] bg-gradient-to-r from-[#FFF9E6] to-[#FFF5D6] shadow-md scale-[1.01] ring-1 ring-[#C99700]/20' 
                        : 'border-[#E0DCD7] hover:border-[#C99700]/50 hover:bg-[#FFF9E6]/50'
                      }
                    `}
                  >
                    {/* Popular Badge - Compact */}
                    {option.popular && (
                      <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-[#C99700] to-[#E5A800] text-[#4B2E28] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-[#C99700]">
                        Popular
                      </div>
                    )}
                    
                    {/* Bulk Savings Badge - Compact */}
                    {option.savings && !optionPricing.hasDiscount && (
                      <div className="absolute -top-1.5 left-3 bg-gradient-to-r from-green-600 to-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-green-700">
                        {option.savings}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {/* Radio/Check indicator - Smaller */}
                        <div className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                          ${selectedWeight === option.weight 
                            ? 'border-[#C99700] bg-[#C99700] shadow-sm' 
                            : 'border-[#E0DCD7] bg-white'
                          }
                        `}>
                          {selectedWeight === option.weight && (
                            <Check className="w-3 h-3 text-[#4B2E28]" strokeWidth={3} />
                          )}
                        </div>
                        
                        {/* Weight Info - Compact */}
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-[#C99700]" strokeWidth={2} />
                            <span className="font-bold text-base text-[#2C1F1A]">
                              {option.weight}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#6B5750] mt-0.5">
                            ₹{(optionPricing.discountedPrice / parseInt(option.weight)).toFixed(2)}/g
                          </p>
                        </div>
                      </div>

                      {/* Price - Compact */}
                      <div className="text-right">
                        {optionPricing.hasDiscount ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <div className="relative">
                              <span className="text-xs text-muted-foreground/70 line-through">₹{option.price}</span>
                            </div>
                            <p className="font-playfair text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              ₹{optionPricing.discountedPrice}
                            </p>
                            <div className="text-[9px] font-medium text-green-600/90 uppercase tracking-wide">
                              SAVE ₹{optionPricing.savings}
                            </div>
                          </div>
                        ) : (
                          <p className="font-playfair text-xl font-bold text-[#C99700]">
                            ₹{option.price}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 py-5 text-sm border-2 border-[#E0DCD7] hover:border-[#C99700] hover:bg-[#FFF9E6] transition-all bg-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 bg-gradient-to-r from-[#4B2E28] to-[#3A221F] text-[#C99700] hover:from-[#3A221F] hover:to-[#2C1A17] py-5 text-sm shadow-lg hover:shadow-xl transition-all font-bold"
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#C99700]/30 border-t-[#C99700] rounded-full animate-spin mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart - ₹{finalPrice}
                  </>
                )}
              </Button>
            </div>

            {/* Trust Indicators - Compact */}
            <div className="mt-5 pt-5 border-t border-[#E0DCD7]">
              <div className="flex items-center justify-center gap-6 text-xs text-[#6B5750]">
                <div className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-[#C99700]" />
                  <span className="font-medium">Premium Quality</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="font-medium">Fresh & Hygienic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WeightSelectionDialog;
