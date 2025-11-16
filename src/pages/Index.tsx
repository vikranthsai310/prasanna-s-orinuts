
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingCart, Check, Shield, Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import HeroSection from '@/components/HeroSection';
import WeightSelectionDialog from '@/components/WeightSelectionDialog';
import { SEO } from '@/components/SEO';
import { getBestSellerProducts, getAllProducts } from '@/services/productService';
import { Product } from '@/types/product';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const luxurySectionRef = useRef<HTMLElement>(null);
  const [particles, setParticles] = useState<Array<{id: number, style: React.CSSProperties}>>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  
  // Store products by category for quick access
  const [almondProduct, setAlmondProduct] = useState<Product | null>(null);
  const [cashewProduct, setCashewProduct] = useState<Product | null>(null);
  const [walnutProduct, setWalnutProduct] = useState<Product | null>(null);

  // Fetch best seller products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const [bestSellers, allProducts] = await Promise.all([
          getBestSellerProducts(),
          getAllProducts()
        ]);
        setFeaturedProducts(bestSellers); // Show best sellers in the featured section
        
        // Find specific products for Nature's Finest Selection from ALL products
        // Match by name (case-insensitive) or category
        const almond = allProducts.find(p => 
          p.name.toLowerCase().includes('almond') || 
          p.category?.toLowerCase() === 'almonds'
        );
        const cashew = allProducts.find(p => 
          p.name.toLowerCase().includes('cashew') || 
          p.category?.toLowerCase() === 'cashews'
        );
        const walnut = allProducts.find(p => 
          p.name.toLowerCase().includes('walnut') || 
          p.category?.toLowerCase() === 'walnuts'
        );
        
        console.log('Products found:', { almond, cashew, walnut });
        console.log('All products:', allProducts.map(p => ({ name: p.name, category: p.category, prices: p.prices })));
        
        setAlmondProduct(almond || null);
        setCashewProduct(cashew || null);
        setWalnutProduct(walnut || null);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Generate floating particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 15; i++) { // Reduced from 20 to 15
        newParticles.push({
          id: i,
          style: {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  // Parallax effect
  useEffect(() => {
    const handleParallax = () => {
      if (!luxurySectionRef.current) return;
      
      const scrollPosition = window.scrollY;
      const sectionTop = luxurySectionRef.current.offsetTop;
      const sectionHeight = luxurySectionRef.current.offsetHeight;
      
      if (scrollPosition > sectionTop - window.innerHeight && 
          scrollPosition < sectionTop + sectionHeight) {
        const parallaxBg = luxurySectionRef.current.querySelector(':before') as HTMLElement;
        if (parallaxBg) {
          const speed = 0.5;
          const yPos = (scrollPosition - sectionTop) * speed;
          parallaxBg.style.transform = `translateY(${yPos}px) translateZ(-10px)`;
        }
      }
    };
    
    window.addEventListener('scroll', handleParallax);
    return () => window.removeEventListener('scroll', handleParallax);
  }, []);

  // Reveal animation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal');
      
      reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
          element.classList.add('active');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle quick add to cart
  const handleQuickAdd = (productType: 'almond' | 'cashew' | 'walnut') => {
    let product = null;
    
    switch(productType) {
      case 'almond':
        product = almondProduct;
        break;
      case 'cashew':
        product = cashewProduct;
        break;
      case 'walnut':
        product = walnutProduct;
        break;
    }
    
    if (product) {
      setSelectedProduct(product);
      setIsWeightDialogOpen(true);
    } else {
      toast({
        title: 'Product Not Available',
        description: 'This product is currently not available. Please try again later.',
        variant: 'destructive'
      });
    }
  };
  
  // Helper function to get price display
  const getProductPrice = (product: Product | null): string => {
    if (!product || !product.prices) {
      return '₹--/kg'; // Show placeholder while loading
    }
    
    // Use the 1kg price if available, otherwise calculate average
    if (product.prices['1kg']) {
      return `₹${product.prices['1kg']}/kg`;
    }
    
    // Fallback: calculate average of all available prices
    const prices = Object.values(product.prices).filter(p => p > 0);
    if (prices.length === 0) return '₹999/kg';
    
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    return `₹${avgPrice}/kg`;
  };

  return (
    <div className="animate-fade-in">
      {/* SEO */}
      <SEO
        title="Buy Premium Dry Fruits Online India | Prasanna's Orinuts"
        description="Buy Fresh Premium Almonds, Jumbo Cashews, Kashmir Walnuts, Afghani Dates ✓ 100% Natural ✓ No Additives ✓ Telangana Delivery"
        keywords={['buy dry fruits online india', 'premium dry fruits', 'fresh almonds online', 'cashews online', 'walnuts online', 'dates online', 'dry fruits home delivery', 'organic dry fruits', 'buy nuts online', 'dry fruits wholesale', 'best dry fruits store india', 'healthy snacks online', 'protein rich dry fruits', 'weight loss dry fruits', 'immunity boosting dry fruits']}
        canonicalUrl="https://prasannasorinuts.com"
        type="website"
      />
      
      {/* Premium Hero Section */}
      <HeroSection />

      {/* Luxury Dry Fruits Section */}
      <section ref={luxurySectionRef} className="luxury-section">
        {/* Floating particles */}
        {particles.map(particle => (
          <div 
            key={particle.id} 
            className="particle" 
            style={particle.style}
          />
        ))}
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-2 text-primary">
              Nature's Finest Selection
            </h2>
            <p className="text-base max-w-2xl mx-auto text-[#6B5750]">
              Indulge in our premium collection of handpicked dry fruits
            </p>
          </div>
          
          {/* Mobile view: horizontal scroll */}
          <div className="md:hidden mobile-scroll-container">
            {/* Almond Card */}
            <div className="mobile-scroll-item reveal delay-1">
              <div className="glassmorphic-card">
                <div className="price-tag">{getProductPrice(almondProduct)}</div>
                <div className="fruit-image-container">
                  <img 
                    src="/almond.png" 
                    alt="Premium Almond" 
                    className="fruit-image float-animation-1"
                    loading="lazy"
                  />
                </div>
                <h3 className="fruit-title text-center">Premium Almonds</h3>
                <p className="fruit-description text-center sequential-fade">
                  <span className="golden-text">Premium quality</span> almonds with perfect crunch
                </p>
                <div className="flex flex-wrap justify-center mt-2 sequential-fade">
                  <div className="benefit-badge">
                    <Heart className="w-3 h-3 mr-1" /> Heart Health
                  </div>
                  <div className="benefit-badge">
                    <Shield className="w-3 h-3 mr-1" /> Antioxidants
                  </div>
                </div>
                {/* Update the button layout in the mobile view */}
                <div className="mt-4 mb-6 text-center sequential-fade">
                  {almondProduct && (
                    <Link to={`/products/${almondProduct.id}`}>
                      <Button variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                        Explore
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="quick-add-btn" onClick={() => handleQuickAdd('almond')}>
                  <ShoppingCart className="w-4 h-4 inline-block mr-2" /> Quick Add
                </div>
              </div>
            </div>
            
            {/* Cashew Card */}
            <div className="mobile-scroll-item reveal delay-2">
              <div className="glassmorphic-card">
                <div className="price-tag">{getProductPrice(cashewProduct)}</div>
                <div className="fruit-image-container">
                  <img 
                    src="/cashew.png" 
                    alt="Premium Cashew" 
                    className="fruit-image float-animation-2"
                    loading="lazy"
                  />
                </div>
                <h3 className="fruit-title text-center">Exotic Cashews</h3>
                <p className="fruit-description text-center sequential-fade">
                  Creamy <span className="golden-text">hand-selected</span> cashews with subtle sweetness
                </p>
                <div className="flex flex-wrap justify-center mt-2 sequential-fade">
                  <div className="benefit-badge">
                    <Star className="w-3 h-3 mr-1" /> Energy Boost
                  </div>
                  <div className="benefit-badge">
                    <Award className="w-3 h-3 mr-1" /> Premium Quality
                  </div>
                </div>
                {/* Update the button layout in the mobile view */}
                <div className="mt-4 mb-6 text-center sequential-fade">
                  {cashewProduct && (
                    <Link to={`/products/${cashewProduct.id}`}>
                      <Button variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                        Explore
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="quick-add-btn" onClick={() => handleQuickAdd('cashew')}>
                  <ShoppingCart className="w-4 h-4 inline-block mr-2" /> Quick Add
                </div>
              </div>
            </div>
            
            {/* Walnut Card */}
            <div className="mobile-scroll-item reveal delay-3">
              <div className="glassmorphic-card">
                <div className="price-tag">{getProductPrice(walnutProduct)}</div>
                <div className="fruit-image-container">
                  <img 
                    src="/walnut.png" 
                    alt="Premium Walnut" 
                    className="fruit-image float-animation-3"
                    loading="lazy"
                  />
                </div>
                <h3 className="fruit-title text-center">Organic Walnuts</h3>
                <p className="fruit-description text-center sequential-fade">
                  <span className="golden-text">Himalayan-grown</span> walnuts rich in omega nutrition
                </p>
                <div className="flex flex-wrap justify-center mt-2 sequential-fade">
                  <div className="benefit-badge">
                    <Check className="w-3 h-3 mr-1" /> Brain Health
                  </div>
                  <div className="benefit-badge">
                    <Shield className="w-3 h-3 mr-1" /> Omega-3 Rich
                  </div>
                </div>
                {/* Update the button layout in the mobile view */}
                <div className="mt-4 mb-6 text-center sequential-fade">
                  {walnutProduct && (
                    <Link to={`/products/${walnutProduct.id}`}>
                      <Button variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                        Explore
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="quick-add-btn" onClick={() => handleQuickAdd('walnut')}>
                  <ShoppingCart className="w-4 h-4 inline-block mr-2" /> Quick Add
                </div>
              </div>
            </div>
          </div>
          
          {/* Desktop view: grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {/* Almond Card */}
            <div className="reveal delay-1">
              <div className="glassmorphic-card">
                <div className="price-tag">{getProductPrice(almondProduct)}</div>
                <div className="fruit-image-container">
                  <img 
                    src="/almond.png" 
                    alt="Premium Almond" 
                    className="fruit-image float-animation-1"
                    loading="lazy"
                  />
                </div>
                <h3 className="fruit-title text-center">Premium Almonds</h3>
                <p className="fruit-description text-center sequential-fade">
                  <span className="golden-text">Premium quality</span> almonds with perfect crunch
                </p>
                <div className="flex flex-wrap justify-center mt-2 sequential-fade">
                  <div className="benefit-badge">
                    <Heart className="w-3 h-3 mr-1" /> Heart Health
                  </div>
                  <div className="benefit-badge">
                    <Shield className="w-3 h-3 mr-1" /> Antioxidants
                  </div>
                </div>
                {/* Update the button layout in the desktop view */}
                <div className="mt-4 mb-6 text-center sequential-fade">
                  {almondProduct && (
                    <Link to={`/products/${almondProduct.id}`}>
                      <Button variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                        Explore
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="quick-add-btn" onClick={() => handleQuickAdd('almond')}>
                  <ShoppingCart className="w-4 h-4 inline-block mr-2" /> Quick Add
                </div>
              </div>
            </div>
            
            {/* Cashew Card */}
            <div className="reveal delay-2">
              <div className="glassmorphic-card">
                <div className="price-tag">{getProductPrice(cashewProduct)}</div>
                <div className="fruit-image-container">
                  <img 
                    src="/cashew.png" 
                    alt="Premium Cashew" 
                    className="fruit-image float-animation-2"
                    loading="lazy"
                  />
                </div>
                <h3 className="fruit-title text-center">Exotic Cashews</h3>
                <p className="fruit-description text-center sequential-fade">
                  Creamy <span className="golden-text">hand-selected</span> cashews with subtle sweetness
                </p>
                <div className="flex flex-wrap justify-center mt-2 sequential-fade">
                  <div className="benefit-badge">
                    <Star className="w-3 h-3 mr-1" /> Energy Boost
                  </div>
                  <div className="benefit-badge">
                    <Award className="w-3 h-3 mr-1" /> Premium Quality
                  </div>
                </div>
                {/* Update the button layout in the desktop view */}
                <div className="mt-4 mb-6 text-center sequential-fade">
                  {cashewProduct && (
                    <Link to={`/products/${cashewProduct.id}`}>
                      <Button variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                        Explore
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="quick-add-btn" onClick={() => handleQuickAdd('cashew')}>
                  <ShoppingCart className="w-4 h-4 inline-block mr-2" /> Quick Add
                </div>
              </div>
            </div>
            
            {/* Walnut Card */}
            <div className="reveal delay-3">
              <div className="glassmorphic-card">
                <div className="price-tag">{getProductPrice(walnutProduct)}</div>
                <div className="fruit-image-container">
                  <img 
                    src="/walnut.png" 
                    alt="Premium Walnut" 
                    className="fruit-image float-animation-3"
                    loading="lazy"
                  />
                </div>
                <h3 className="fruit-title text-center">Organic Walnuts</h3>
                <p className="fruit-description text-center sequential-fade">
                  <span className="golden-text">Himalayan-grown</span> walnuts rich in omega nutrition
                </p>
                <div className="flex flex-wrap justify-center mt-2 sequential-fade">
                  <div className="benefit-badge">
                    <Check className="w-3 h-3 mr-1" /> Brain Health
                  </div>
                  <div className="benefit-badge">
                    <Shield className="w-3 h-3 mr-1" /> Omega-3 Rich
                  </div>
                </div>
                {/* Update the button layout in the desktop view */}
                <div className="mt-4 mb-6 text-center sequential-fade">
                  {walnutProduct && (
                    <Link to={`/products/${walnutProduct.id}`}>
                      <Button variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                        Explore
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="quick-add-btn" onClick={() => handleQuickAdd('walnut')}>
                  <ShoppingCart className="w-4 h-4 inline-block mr-2" /> Quick Add
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4">
              Best Sellers
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our most popular dry fruits, loved by customers for their exceptional quality and taste
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="card-premium animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-6 rounded w-3/4"></div>
                    <div className="bg-gray-200 h-4 rounded w-full"></div>
                    <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">No products available at the moment.</p>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <Link to="/products">
              <Button variant="outline" size="lg">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}

      {/* Weight Selection Dialog */}
      {selectedProduct && (
        <WeightSelectionDialog
          isOpen={isWeightDialogOpen}
          onClose={() => setIsWeightDialogOpen(false)}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default Index;
