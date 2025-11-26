import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FIREBASE_IMAGE_URLS } from '@/services/imageService';
import { AnimationController } from '@/utils/animations';

const HeroSectionAnimated = () => {
  // Fruit data with Firebase Storage images
  const fruits = [
    { 
      id: 'almond', 
      name: 'Premium Almonds', 
      image: FIREBASE_IMAGE_URLS.almond,
      description: 'Premium quality almonds with perfect crunch',
      benefits: ['Heart Health', 'Protein Rich'],
      colors: { primary: '#D2691E', secondary: '#F4A460' }
    },
    { 
      id: 'cashew', 
      name: 'Premium Cashews', 
      image: FIREBASE_IMAGE_URLS.cashew,
      description: 'Creamy hand-selected cashews with subtle sweetness',
      benefits: ['Energy Boost', 'Premium Quality'],
      colors: { primary: '#DEB887', secondary: '#F5DEB3' }
    },
    { 
      id: 'walnut', 
      name: 'Organic Walnuts', 
      image: FIREBASE_IMAGE_URLS.walnut,
      description: 'Himalayan-grown walnuts rich in omega nutrition',
      benefits: ['Brain Health', 'Omega-3 Rich'],
      colors: { primary: '#8B4513', secondary: '#D2691E' }
    },
    { 
      id: 'pista', 
      name: 'Premium Pistachios', 
      image: FIREBASE_IMAGE_URLS.pista,
      description: 'Finest Iranian pistachios with natural flavor',
      benefits: ['Antioxidants', 'Energy Dense'],
      colors: { primary: '#9ACD32', secondary: '#ADFF2F' }
    },
    { 
      id: 'dates', 
      name: 'Medjool Dates', 
      image: FIREBASE_IMAGE_URLS.dates,
      description: 'Sweet and chewy premium dates from Morocco',
      benefits: ['Natural Sugar', 'Fiber Rich'],
      colors: { primary: '#8B4513', secondary: '#A0522D' }
    },
    { 
      id: 'apricot', 
      name: 'Dried Apricots', 
      image: FIREBASE_IMAGE_URLS.apricot,
      description: 'Sun-dried apricots bursting with vitamins',
      benefits: ['Vitamin A', 'Natural Glow'],
      colors: { primary: '#FF8C00', secondary: '#FFA500' }
    },
    { 
      id: 'rasins', 
      name: 'Golden Raisins', 
      image: FIREBASE_IMAGE_URLS.rasins,
      description: 'Sweet golden raisins packed with energy',
      benefits: ['Quick Energy', 'Natural Sweet'],
      colors: { primary: '#DAA520', secondary: '#FFD700' }
    }
  ];

  const [selectedFruit, setSelectedFruit] = useState(fruits[0]);
  const [isRotating, setIsRotating] = useState(true);
  const ringRef = useRef<HTMLDivElement>(null);
  const [ringRadius, setRingRadius] = useState<number>(420);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Compute a responsive radius so the items stay within the visible circle
  useEffect(() => {
    const computeRadius = () => {
      const el = ringRef.current;
      if (!el) return;
      const size = Math.min(el.clientWidth, el.clientHeight);
      const isLg = window.matchMedia('(min-width: 1024px)').matches;
      const imageSize = isLg ? 128 : 112;
      const padding = -16;
      const radiusScale = isLg ? 1.45 : 1.3;
      const r = (size / 2 - imageSize / 2 - padding) * radiusScale;
      setRingRadius(Math.max(120, r));
    };

    computeRadius();
    window.addEventListener('resize', computeRadius);
    return () => window.removeEventListener('resize', computeRadius);
  }, []);

  // Initialize animations when component mounts
  useEffect(() => {
    AnimationController.respectMotionPreference(() => {
      // Delay the animation slightly to ensure DOM is ready
      setTimeout(() => {
        AnimationController.heroEntrance();
        AnimationController.floatingFruits();
      }, 100);
    });
  }, []);

  // Handle fruit selection with animation
  const handleFruitSelect = (fruit: typeof fruits[0]) => {
    if (fruit.id === selectedFruit.id) return;
    
    setSelectedFruit(fruit);
    
    AnimationController.respectMotionPreference(() => {
      const allFruitElements = document.querySelectorAll('.fruit-ring-item');
      const selectedElement = document.querySelector(`[data-fruit-id="${fruit.id}"]`) as HTMLElement;
      
      if (selectedElement && allFruitElements.length > 0) {
        AnimationController.fruitSelection(selectedElement, allFruitElements);
      }
    });
  };

  // Handle button interactions
  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    AnimationController.respectMotionPreference(() => {
      AnimationController.buttonHover(e.currentTarget);
    });
  };

  const handleButtonHoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    AnimationController.respectMotionPreference(() => {
      AnimationController.buttonHoverOut(e.currentTarget);
    });
  };

  return (
    <section 
      ref={heroRef}
      className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 page-content" 
      style={{ height: 'calc(100vh - 3.5rem)' }}
    >
      {/* Floating Fruits Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating fruit emojis */}
        <div className="floating-fruit absolute" style={{ top: '20%', left: '10%', fontSize: '3rem' }}>🍎</div>
        <div className="floating-fruit absolute" style={{ top: '60%', right: '15%', fontSize: '2.5rem' }}>🍊</div>
        <div className="floating-fruit absolute" style={{ top: '80%', left: '20%', fontSize: '2rem' }}>🍇</div>
        <div className="floating-fruit absolute" style={{ top: '30%', right: '25%', fontSize: '2.8rem' }}>🥭</div>
        <div className="floating-fruit absolute" style={{ top: '15%', right: '40%', fontSize: '2.2rem' }}>🍓</div>
        <div className="floating-fruit absolute" style={{ top: '70%', left: '70%', fontSize: '2.6rem' }}>🥝</div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-gradient-to-r from-yellow-200 to-amber-200 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-r from-orange-200 to-red-200 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 z-10 max-w-7xl h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-center w-full py-4 sm:py-8 lg:py-12">
          
          {/* Left Content */}
          <div className="text-left space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Badge */}
            <div className="hero-badge opacity-0">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-amber-200 shadow-lg">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 mr-1.5 sm:mr-2" />
                <span className="text-xs sm:text-sm font-medium text-amber-800">Premium Quality Guaranteed</span>
              </div>
            </div>

            {/* Main Headline with Staggered Animation */}
            <div className="space-y-2 lg:space-y-3">
              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-relaxed">
                <span className="hero-title-line block text-amber-900 pb-2 opacity-0">
                  Purity,
                </span>
                <span className="hero-title-line block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent pb-2 opacity-0">
                  Pleasure
                </span>
                <span className="hero-title-line block text-amber-900 pb-2 opacity-0">
                  Perfection
                </span>
              </h1>
            </div>

            {/* Dynamic Subtitle */}
            <p className="hero-subtitle text-sm xs:text-base sm:text-lg lg:text-xl text-amber-800/80 leading-relaxed max-w-lg opacity-0">
              {selectedFruit.description}
            </p>

            {/* Benefits Tags */}
            <div className="hero-subtitle flex flex-wrap gap-2 opacity-0">
              {selectedFruit.benefits.map((benefit, index) => (
                <span
                  key={benefit}
                  className="px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium text-amber-800 border border-amber-200"
                >
                  {benefit}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="hero-buttons flex flex-col xs:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 opacity-0">
              <Link to="/products">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 w-full xs:w-auto"
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonHoverOut}
                >
                  Shop Premium Collection
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Button
                variant="outline"
                size="lg"
                className="group border-2 border-amber-400 text-amber-700 hover:bg-amber-50 shadow-md hover:shadow-lg transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 w-full xs:w-auto"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonHoverOut}
              >
                <Shield className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Quality Promise
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="hero-buttons flex items-center gap-4 sm:gap-6 pt-4 sm:pt-6 opacity-0">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                <span className="text-xs sm:text-sm text-amber-800/70 font-medium">Premium Grade</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="text-xs sm:text-sm text-amber-800/70 font-medium">100% Natural</span>
              </div>
            </div>
          </div>

          {/* Right Content - Interactive Fruit Ring */}
          <div className="relative flex items-center justify-center h-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
            <div
              ref={ringRef}
              className="relative w-full h-full max-w-[600px] max-h-[600px] aspect-square"
            >
              {/* Central Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-white/80 backdrop-blur-sm border-4 border-amber-200 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-500 hover:border-amber-300 hover:shadow-3xl">
                    <img
                      src={selectedFruit.image}
                      alt={selectedFruit.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Selected fruit info */}
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
                    <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-1">
                      {selectedFruit.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Fruit Ring */}
              <div className="absolute inset-0">
                {fruits.map((fruit, index) => {
                  const angle = (index * 360) / fruits.length;
                  const radian = (angle * Math.PI) / 180;
                  const x = Math.cos(radian) * ringRadius;
                  const y = Math.sin(radian) * ringRadius;
                  
                  const isSelected = fruit.id === selectedFruit.id;

                  return (
                    <div
                      key={fruit.id}
                      data-fruit-id={fruit.id}
                      className={`fruit-ring-item absolute w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 cursor-pointer transition-all duration-500 transform hover:scale-110 ${
                        isSelected 
                          ? 'scale-110 z-20' 
                          : 'scale-100 hover:z-10'
                      }`}
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) ${isSelected ? 'scale(1.1)' : 'scale(1)'}`,
                      }}
                      onClick={() => handleFruitSelect(fruit)}
                    >
                      <div className={`w-full h-full rounded-full border-3 shadow-lg transition-all duration-500 overflow-hidden ${
                        isSelected
                          ? 'border-amber-400 shadow-amber-200 shadow-xl'
                          : 'border-white/60 hover:border-amber-300 hover:shadow-xl'
                      }`}
                      style={{
                        background: isSelected 
                          ? `linear-gradient(135deg, ${fruit.colors.primary}20, ${fruit.colors.secondary}20)`
                          : 'rgba(255, 255, 255, 0.8)'
                      }}>
                        <img
                          src={fruit.image}
                          alt={fruit.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Fruit name tooltip */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <span className="text-xs font-medium text-amber-800 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md shadow-md whitespace-nowrap">
                          {fruit.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rotation Animation Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                <button
                  onClick={() => setIsRotating(!isRotating)}
                  className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-amber-800 border border-amber-200 hover:bg-white transition-colors duration-300"
                >
                  {isRotating ? 'Pause' : 'Rotate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionAnimated;