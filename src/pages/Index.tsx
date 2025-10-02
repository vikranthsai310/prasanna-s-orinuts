
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingCart, Check, Shield, Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import HeroSection from '@/components/HeroSection';
import WeightSelectionDialog from '@/components/WeightSelectionDialog';
import { mockProducts } from '@/data/mockProducts';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const featuredProducts = mockProducts.slice(0, 4);
  const { toast } = useToast();
  const luxurySectionRef = useRef<HTMLElement>(null);
  const [particles, setParticles] = useState<Array<{id: number, style: React.CSSProperties}>>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);

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
  const handleQuickAdd = (productName: string) => {
    // Find the product by name
    const product = mockProducts.find(p => p.name === productName);
    if (product) {
      setSelectedProduct(product);
      setIsWeightDialogOpen(true);
    }
  };

  return (
    <div className="animate-fade-in">
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
                <div className="price-tag">₹899/kg</div>
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
                  <span className="golden-text">California-sourced</span> almonds with perfect crunch
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
                  <Link to="/products">
                    <Button variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                      Explore
                    </Button>
                  </Link>
                </div>
                <div className="quick-add-btn" onClick={() => handleQuickAdd("Premium Almonds")}>
                  <ShoppingCart className="w-4 h-4 inline-block mr-2" /> Quick Add
                </div>
              </div>
            </div>
            
            {/* Cashew Card */}
            <div className="mobile-scroll-item reveal delay-2">
              <div className="glassmorphic-card">
                <div className="price-tag">₹1099/kg</div>
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
                  <Link to="/products">
                    <Button variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                      Explore
                    </Button>
                  </Link>
                </div>
                <div className="quick-add-btn" onClick={() => handleQuickAdd("Exotic Cashews")}>
                  <ShoppingCart className="w-4 h-4 inline-block mr-2" /> Quick Add
                </div>
              </div>
            </div>
            
            {/* Walnut Card */}
            <div className="mobile-scroll-item reveal delay-3">
              <div className="glassmorphic-card">
                <div className="price-tag">₹1299/kg</div>
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
                  <Link to="/products">
                    <Button variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                      Explore
                    </Button>
                  </Link>
                </div>
                <div className="quick-add-btn" onClick={() => handleQuickAdd("Organic Walnuts")}>
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
                <div className="price-tag">₹899/kg</div>
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
                  <span className="golden-text">California-sourced</span> almonds with perfect crunch
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
                  <Link to="/products">
                    <Button variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                      Explore
                    </Button>
                  </Link>
                </div>
                <div className="quick-add-btn" onClick={() => handleQuickAdd("Premium Almonds")}>
                  <ShoppingCart className="w-4 h-4 inline-block mr-2" /> Quick Add
                </div>
              </div>
            </div>
            
            {/* Cashew Card */}
            <div className="reveal delay-2">
              <div className="glassmorphic-card">
                <div className="price-tag">₹1099/kg</div>
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
                  <Link to="/products">
                    <Button variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                      Explore
                    </Button>
                  </Link>
                </div>
                <div className="quick-add-btn" onClick={() => handleQuickAdd("Exotic Cashews")}>
                  <ShoppingCart className="w-4 h-4 inline-block mr-2" /> Quick Add
                </div>
              </div>
            </div>
            
            {/* Walnut Card */}
            <div className="reveal delay-3">
              <div className="glassmorphic-card">
                <div className="price-tag">₹1299/kg</div>
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
                  <Link to="/products">
                    <Button variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                      Explore
                    </Button>
                  </Link>
                </div>
                <div className="quick-add-btn" onClick={() => handleQuickAdd("Organic Walnuts")}>
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
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
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
