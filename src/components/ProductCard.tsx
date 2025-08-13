
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/product';
import { validateImageUrl } from '@/utils/imageErrorHandler';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.prices['250g'],
      weight: '250g',
      image: product.image
    });
  };

  return (
    <div 
      className="card-premium group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.id}`}>
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={validateImageUrl(product.image)}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
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
              250g
            </div>
            <div className="font-semibold text-lg text-secondary">
              ₹{product.prices['250g']}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
