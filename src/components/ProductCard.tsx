
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
              <Badge className="absolute top-2 right-2 z-10 bg-red-500 text-white">
                {discount}% OFF
              </Badge>
            )}
            <img
              src={validateImageUrl(product.image)}
              alt={product.name}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
            <div className={`absolute inset-0 bg-primary/40 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
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
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-secondary transition-colors">
              {product.name}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Starting from
              </div>
              <div className="flex flex-col items-end">
                {discountedPrice !== null ? (
                  <>
                    <div className="text-sm line-through text-muted-foreground">
                      ₹{basePrice}
                    </div>
                    <div className="font-semibold text-lg text-green-600">
                      ₹{discountedPrice.toFixed(2)}
                    </div>
                  </>
                ) : (
                  <div className="font-semibold text-lg text-secondary">
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
