import { useState } from 'react';
import { X, Package, Check, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/components/ui/use-toast';

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
  const [selectedWeight, setSelectedWeight] = useState<string>('250g');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  // Convert prices object to weight options array
  const weightOptions: WeightOption[] = Object.entries(product.prices).map(([weight, price], index) => {
    const basePrice = product.prices['250g'] || 0;
    const currentPrice = price;
    const expectedPrice = basePrice * (parseInt(weight) / 250);
    const savings = expectedPrice > currentPrice ? Math.round(((expectedPrice - currentPrice) / expectedPrice) * 100) : 0;

    return {
      weight,
      price,
      popular: index === 1, // Middle option is popular
      savings: savings > 0 ? `Save ${savings}%` : undefined
    };
  });

  const handleAddToCart = () => {
    setIsAdding(true);
    const selectedPrice = product.prices[selectedWeight];
    
    addItem({
      id: product.id,
      name: product.name,
      price: selectedPrice,
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
          <div className="relative bg-gradient-to-r from-[#F8F5F0] to-[#F6E1B3]/30 p-6 border-b border-[#E0DCD7]">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#6B5750] hover:text-[#2C1F1A] transition-colors p-2 hover:bg-white/80 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-4 pr-8">
              {/* Product Image */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-[#C99700]/20 rounded-xl blur-md"></div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="relative w-20 h-20 object-cover rounded-xl shadow-lg border-2 border-white"
                />
              </div>
              
              {/* Product Info */}
              <div>
                <h2 className="font-playfair text-2xl font-bold text-[#2C1F1A] mb-1">
                  {product.name}
                </h2>
                <p className="text-[#6B5750] text-sm">
                  Select your preferred weight
                </p>
              </div>
            </div>
          </div>

          {/* Weight Options */}
          <div className="p-6 bg-white">
            <div className="space-y-3 mb-6">
              {weightOptions.map((option) => (
                <button
                  key={option.weight}
                  onClick={() => setSelectedWeight(option.weight)}
                  className={`
                    relative w-full p-4 rounded-xl border-2 transition-all duration-200 bg-white
                    ${selectedWeight === option.weight 
                      ? 'border-[#C99700] bg-gradient-to-r from-[#FFF9E6] to-[#FFF5D6] shadow-lg scale-[1.02] ring-2 ring-[#C99700]/20' 
                      : 'border-[#E0DCD7] hover:border-[#C99700]/50 hover:bg-[#FFF9E6]/50 hover:shadow-md'
                    }
                  `}
                >
                  {/* Popular Badge */}
                  {option.popular && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#C99700] to-[#E5A800] text-[#4B2E28] text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-[#C99700]">
                      Popular
                    </div>
                  )}
                  
                  {/* Savings Badge */}
                  {option.savings && (
                    <div className="absolute -top-2 left-4 bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-green-700">
                      {option.savings}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Radio/Check indicator */}
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                        ${selectedWeight === option.weight 
                          ? 'border-[#C99700] bg-[#C99700] shadow-md' 
                          : 'border-[#E0DCD7] bg-white'
                        }
                      `}>
                        {selectedWeight === option.weight && (
                          <Check className="w-4 h-4 text-[#4B2E28]" strokeWidth={3} />
                        )}
                      </div>
                      
                      {/* Weight Info */}
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#C99700]" strokeWidth={2} />
                          <span className="font-bold text-lg text-[#2C1F1A]">
                            {option.weight}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B5750] mt-0.5">
                          ₹{(option.price / parseInt(option.weight)).toFixed(2)}/g
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-playfair text-2xl font-bold text-[#C99700]">
                        ₹{option.price}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 py-6 text-base border-2 border-[#E0DCD7] hover:border-[#C99700] hover:bg-[#FFF9E6] transition-all bg-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 bg-gradient-to-r from-[#4B2E28] to-[#3A221F] text-[#C99700] hover:from-[#3A221F] hover:to-[#2C1A17] py-6 text-base shadow-lg hover:shadow-xl transition-all font-bold"
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#C99700]/30 border-t-[#C99700] rounded-full animate-spin mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart - ₹{product.prices[selectedWeight]}
                  </>
                )}
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 pt-6 border-t border-[#E0DCD7]">
              <div className="flex items-center justify-center gap-6 text-xs text-[#6B5750]">
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4 text-[#C99700]" />
                  <span className="font-medium">Premium Quality</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-600" />
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
