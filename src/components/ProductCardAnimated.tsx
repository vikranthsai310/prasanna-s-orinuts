import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/product';
import { validateImageUrl } from '@/utils/imageErrorHandler';
import { AnimationController } from '@/utils/animations';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCardAnimated = ({ product, index = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Initialize scroll animation observer
  useEffect(() => {
    if (cardRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              AnimationController.respectMotionPreference(() => {
                setTimeout(() => {
                  AnimationController.mobileOptimizedAnimation(
                    entry.target,
                    {
                      opacity: [0, 1],
                      translateY: [50, 0],
                      scale: [0.9, 1],
                      duration: 800,
                      easing: 'easeOutBack'
                    },
                    // Mobile optimized version
                    {
                      opacity: [0, 1],
                      translateY: [30, 0],
                      duration: 600,
                      easing: 'easeOutQuart'
                    }
                  );
                }, index * 100); // Stagger animation based on card index
              });
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      observer.observe(cardRef.current);

      return () => observer.disconnect();
    }
  }, [index]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Add to cart logic
    addItem({
      id: product.id,
      name: product.name,
      price: product.prices['250g'],
      weight: '250g',
      image: product.image
    });

    // Animate the button
    if (buttonRef.current) {
      AnimationController.respectMotionPreference(() => {
        AnimationController.addToCart(buttonRef.current!);
      });
    }

    // Show cart notification
    AnimationController.respectMotionPreference(() => {
      AnimationController.cartItemAdd();
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    
    if (cardRef.current) {
      AnimationController.respectMotionPreference(() => {
        AnimationController.mobileOptimizedAnimation(
          cardRef.current,
          {
            scale: [1, 1.03],
            translateY: [0, -5],
            duration: 300,
            easing: 'easeOutQuart'
          },
          // Skip hover animations on mobile
          {}
        );
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    
    if (cardRef.current) {
      AnimationController.respectMotionPreference(() => {
        AnimationController.mobileOptimizedAnimation(
          cardRef.current,
          {
            scale: [1.03, 1],
            translateY: [-5, 0],
            duration: 300,
            easing: 'easeOutQuart'
          },
          {}
        );
      });
    }
  };

  return (
    <div 
      ref={cardRef}
      className="product-card-animated card-premium group cursor-pointer opacity-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        // Ensure card is initially invisible for animation
        opacity: 0,
        transform: 'translateY(50px)'
      }}
    >
      <Link to={`/products/${product.id}`}>
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={validateImageUrl(product.image)}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Hover overlay with improved animation */}
          <div 
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-all duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute bottom-4 left-4 right-4">
              <Button
                ref={buttonRef}
                onClick={handleAddToCart}
                className="cart-button w-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
                size="sm"
              >
                <ShoppingCart className="cart-icon w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>

          {/* Price badge */}
          <div className="absolute top-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
              <span className="font-bold text-amber-600">₹{product.prices['250g']}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-foreground group-hover:text-amber-600 transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          
          {/* Enhanced product info */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                250g
              </span>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                Premium
              </span>
            </div>
            
            {/* Animated price display */}
            <div className="text-right">
              <div className="font-bold text-xl text-amber-600 group-hover:scale-110 transition-transform duration-300">
                ₹{product.prices['250g']}
              </div>
              <div className="text-xs text-muted-foreground line-through opacity-60">
                ₹{Math.round(product.prices['250g'] * 1.2)}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCardAnimated;