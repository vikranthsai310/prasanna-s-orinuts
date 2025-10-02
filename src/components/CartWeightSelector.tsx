import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { mockProducts } from '@/data/mockProducts';

interface CartWeightSelectorProps {
  productId: string;
  currentWeight: string;
  onWeightChange: (newWeight: string, newPrice: number) => void;
}

const CartWeightSelector = ({ productId, currentWeight, onWeightChange }: CartWeightSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Find the product to get available weights and prices
  const product = mockProducts.find(p => p.id === productId);
  
  if (!product) return null;

  const weights = Object.keys(product.prices);
  
  const handleWeightSelect = (weight: string) => {
    const newPrice = product.prices[weight];
    onWeightChange(weight, newPrice);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Label */}
      <label className="text-xs font-semibold text-[#6B5750] mb-1.5 block uppercase tracking-wide">
        Weight
      </label>
      
      {/* Current Weight Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#E0DCD7] rounded-lg hover:border-[#C99700] hover:shadow-md transition-all text-sm font-semibold text-[#2C1F1A] min-w-[120px] justify-between group"
      >
        <span className="text-[#2C1F1A]">{currentWeight}</span>
        <ChevronDown className={`w-4 h-4 text-[#C99700] transition-transform group-hover:scale-110 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full mt-2 left-0 bg-white border-2 border-[#E0DCD7] rounded-lg shadow-xl z-20 min-w-[180px] animate-scale-in">
            <div className="p-2">
              <div className="text-xs font-semibold text-[#6B5750] px-3 py-2 uppercase tracking-wide">
                Select Weight
              </div>
              {weights.map((weight) => {
                const price = product.prices[weight];
                const isSelected = weight === currentWeight;
                
                return (
                  <button
                    key={weight}
                    onClick={() => handleWeightSelect(weight)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left
                      ${isSelected 
                        ? 'bg-gradient-to-r from-[#FFF9E6] to-[#FFF5D6] border-2 border-[#C99700]' 
                        : 'hover:bg-[#FFF9E6]/50 border-2 border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`
                        w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${isSelected ? 'border-[#C99700] bg-[#C99700]' : 'border-[#E0DCD7]'}
                      `}>
                        {isSelected && <Check className="w-3 h-3 text-[#4B2E28]" strokeWidth={3} />}
                      </div>
                      <span className={`font-medium ${isSelected ? 'text-[#2C1F1A]' : 'text-[#6B5750]'}`}>
                        {weight}
                      </span>
                    </div>
                    <span className={`font-bold text-sm ${isSelected ? 'text-[#C99700]' : 'text-[#6B5750]'}`}>
                      ₹{price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartWeightSelector;
