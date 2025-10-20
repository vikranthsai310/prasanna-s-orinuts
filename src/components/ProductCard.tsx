
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/product';
import { validateImageUrl } from '@/utils/imageErrorHandler';
import WeightSelectionDialog from '@/components/WeightSelectionDialog';
import { getProductDiscount, calculateDiscountedPrice } from '@/services/discountService';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const [discount, setDiscount] = useState<number | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    loadDiscount();
  }, [product.id]);

  const loadDiscount = async () => {
    try {
      const productDiscount = await getProductDiscount(product.id);
      if (productDiscount && productDiscount.isActive) {
        setDiscount(productDiscount.discountPercentage);
      } else {
        setDiscount(null);
      }
    } catch (error) {
      console.error('Error loading discount:', error);
      setDiscount(null);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWeightDialogOpen(true);
  };

  const basePrice = product.prices['250g'];
  const discountedPrice = discount !== null ? calculateDiscountedPrice(basePrice, discount) : null;

  return (
    <>
      <div 
        className="card-premium group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/products/${product.id}`}>
          <div className="relative overflow-hidden rounded-lg mb-4 bg-accent">
            {discount !== null && (
              <div className="absolute top-3 right-3 z-10">
                <div className="bg-[#C99700] text-white px-3 py-1.5 rounded-lg shadow-lg border-2 border-[#DAA520]">
                  <span className="font-bold text-sm tracking-wide">{discount}% OFF</span>
                </div>
              </div>
            )}
            <img
              src={validateImageUrl(product.image)}
              alt={product.name}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
            {/* Hover overlay - hidden on mobile, visible on hover for desktop */}
            <div className={`absolute inset-0 bg-primary/40 transition-opacity duration-300 hidden md:block ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute bottom-4 left-4 right-4">
                <Button
                  onClick={handleAddToCart}
                  className="w-full btn-secondary"
                  size="sm"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
            {/* Mobile Add to Cart button - always visible on mobile */}
            <div className="absolute bottom-4 left-4 right-4 md:hidden">
              <Button
                onClick={handleAddToCart}
                className="w-full btn-secondary shadow-lg"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-secondary transition-colors">
              {product.name}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-muted-foreground font-medium">
                Starting from
              </div>
              <div className="flex flex-col items-end">
                {discountedPrice !== null ? (
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="relative">
                      <span className="text-sm text-muted-foreground/80 font-medium">₹{basePrice}</span>
                      <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-red-500/70 transform -rotate-12"></div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-xl text-[#C99700]">
                        ₹{discountedPrice.toFixed(0)}
                      </span>
                      {discountedPrice % 1 !== 0 && (
                        <span className="text-xs text-[#C99700]/80">.{(discountedPrice % 1).toFixed(2).slice(2)}</span>
                      )}
                    </div>
                    <div className="text-[10px] font-medium text-[#C99700]/90 tracking-wide">
                      SAVE ₹{(basePrice - discountedPrice).toFixed(0)}
                    </div>
                  </div>
                ) : (
                  <div className="font-bold text-xl text-secondary">
                    ₹{basePrice}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Weight Selection Dialog */}
      <WeightSelectionDialog
        isOpen={isWeightDialogOpen}
        onClose={() => setIsWeightDialogOpen(false)}
        product={product}
      />
    </>
  );
};

export default ProductCard;
