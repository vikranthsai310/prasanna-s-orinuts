import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FIREBASE_IMAGE_URLS } from '@/services/imageService';

const HeroSection = () => {
  const { scrollYProgress } = useScroll();
  
  // Fruit data with Firebase Storage images
  const fruits = [
    { 
      id: 'almond', 
      name: 'Premium Almonds', 
      image: FIREBASE_IMAGE_URLS.almond,
      description: 'California-sourced almonds with perfect crunch',
      benefits: ['Heart Health', 'Protein Rich'],
      colors: { primary: '#D2691E', secondary: '#F4A460' }
    },
    { 
      id: 'cashew', 
      name: 'Exotic Cashews', 
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
  
  // Compute a responsive radius so the items stay within the visible circle
  useEffect(() => {
    const computeRadius = () => {
      const el = ringRef.current;
      if (!el) return;
      const size = Math.min(el.clientWidth, el.clientHeight);
      const isLg = window.matchMedia('(min-width: 1024px)').matches; // tailwind lg breakpoint
      const imageSize = isLg ? 128 : 112; // lg:w-32 vs w-28
      const padding = -16; // slightly extended orbit but less than before
      const radiusScale = isLg ? 1.45 : 1.3; // reduce scale to decrease overall radius
      const r = (size / 2 - imageSize / 2 - padding) * radiusScale;
      setRingRadius(Math.max(120, r));
    };

    computeRadius();
    window.addEventListener('resize', computeRadius);
    return () => window.removeEventListener('resize', computeRadius);
  }, []);
  
  // Parallax transforms with smooth spring physics
  const backgroundY = useTransform(scrollYProgress, [0, 0.3], [0, 20]);
  const shineX = useTransform(scrollYProgress, [0, 0.3], ["-30%", "130%"]);
  
  // Spring animation for smooth interactions
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" style={{ height: 'calc(100vh - 3.5rem)' }}>
      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{ y: backgroundY }}
      >
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-gradient-to-r from-yellow-200 to-amber-200 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-r from-orange-200 to-red-200 rounded-full blur-2xl animate-pulse delay-500" />
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-amber-300 rounded-full opacity-60"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -20, 0],
              x: [null, Math.random() * 20 - 10, 0],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 z-10 max-w-7xl h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-center w-full py-4 sm:py-8 lg:py-12 relative">
          {/* Left Content */}
          <div className="text-left space-y-3 sm:space-y-4 lg:space-y-6 relative z-30">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-amber-200 shadow-lg">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 mr-1.5 sm:mr-2" />
                <span className="text-xs sm:text-sm font-medium text-amber-800">Premium Quality Guaranteed</span>
              </div>
            </motion.div>

            {/* Main Headline with Staggered Animation */}
            <div className="space-y-2 lg:space-y-3">
              <motion.h1
                className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.span
                  className="block text-amber-900 pb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  Purity,
                </motion.span>
                <motion.span
                  className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent pb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  Pleasure,
                </motion.span>
                <motion.span
                  className="block text-amber-900 pb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  Perfection
                </motion.span>
              </motion.h1>
            </div>

            {/* Dynamic Subtitle based on selected fruit */}
            <motion.p
              className="text-sm xs:text-base sm:text-lg lg:text-xl text-amber-800/80 leading-relaxed max-w-lg"
              key={`subtitle-${selectedFruit.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {selectedFruit.name}
            </motion.p>

            <motion.p
              className="text-xs xs:text-sm sm:text-base text-amber-700/70 leading-relaxed max-w-xl"
              key={`description-${selectedFruit.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {selectedFruit.description}
            </motion.p>

            {/* Dynamic Trust Badges based on selected fruit */}
            <motion.div
              className="flex flex-wrap gap-2 xs:gap-3 sm:gap-4 lg:gap-6 items-center"
              key={`badges-${selectedFruit.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-1.5 xs:gap-2 text-amber-700">
                <Shield className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
                <span className="text-xs font-medium">100% Natural</span>
              </div>
              {selectedFruit.benefits.map((benefit, index) => (
                <div key={benefit} className="flex items-center gap-1.5 xs:gap-2 text-amber-700">
                  <div 
                    className="w-2 h-2 xs:w-3 xs:h-3 rounded-full"
                    style={{ backgroundColor: selectedFruit.colors.primary }}
                  />
                  <span className="text-xs font-medium">{benefit}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-1 lg:pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to="/products">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button 
                    className="text-white font-semibold px-4 xs:px-6 lg:px-8 py-2.5 xs:py-3 lg:py-4 text-xs xs:text-sm lg:text-base shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto"
                    style={{
                      background: `linear-gradient(135deg, ${selectedFruit.colors.primary}, ${selectedFruit.colors.secondary})`,
                    }}
                  >
                    Shop {selectedFruit.name}
                    <ArrowRight className="ml-1.5 xs:ml-2 h-3 w-3 xs:h-4 xs:w-4 lg:h-5 lg:w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/samples">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button 
                    variant="outline"
                    className="border-2 font-semibold px-4 xs:px-6 lg:px-8 py-2.5 xs:py-3 lg:py-4 text-xs xs:text-sm lg:text-base shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                    style={{
                      borderColor: selectedFruit.colors.primary,
                      color: selectedFruit.colors.primary,
                    }}
                  >
                    Try Sample First
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>

          {/* Right Rotating Ring Visual - Background on Mobile, Prominent on Desktop */}
          <div className="absolute lg:relative inset-0 lg:inset-auto lg:pl-4 xl:pl-8 flex items-center justify-center opacity-20 lg:opacity-100 z-0 lg:z-auto">
            <div ref={ringRef} className="relative w-[30rem] h-[30rem] sm:w-[40rem] sm:h-[40rem] lg:w-[72rem] lg:h-[72rem] overflow-visible">
              
              {/* Central Selected Fruit */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center z-20"
                key={selectedFruit.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Background Glow with Dynamic Color */}
                <div 
                  className="absolute inset-0 rounded-full blur-xl lg:blur-3xl opacity-20 scale-50 sm:scale-60 lg:scale-75"
                  style={{ 
                    background: `linear-gradient(135deg, ${selectedFruit.colors.primary}40, ${selectedFruit.colors.secondary}40)` 
                  }}
                />
                
                <motion.img
                  src={selectedFruit.image}
                  alt={selectedFruit.name}
                  className="w-20 h-20 sm:w-32 sm:h-32 lg:w-64 lg:h-64 object-contain drop-shadow-2xl z-10"
                  whileHover={{ scale: 1.1, rotateY: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 rounded-full"
                  style={{ x: shineX }}
                  initial={{ x: "-30%" }}
                  animate={{ x: "130%" }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 4,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              {/* Rotating Ring of Fruits */}
              <motion.div
                className="absolute inset-0 z-10"
                animate={{ rotate: isRotating ? [0, 360] : 0 }}
                transition={{
                  duration: 60,
                  repeat: isRotating ? Infinity : 0,
                  ease: "linear",
                }}
                onHoverStart={() => setIsRotating(false)}
                onHoverEnd={() => setIsRotating(true)}
              >
                {fruits.filter(fruit => fruit.id !== selectedFruit.id).map((fruit, index, arr) => {
                  const startAngle = -90; // place first item at top center
                  const angle = startAngle + (index * 360) / arr.length;
                  const radius = ringRadius || 140;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  const isSelected = false;

                  return (
                    <motion.div
                      key={fruit.id}
                      className={`absolute cursor-pointer ${
                        fruit.id === 'pista' || fruit.id === 'walnut' ? 'z-20' : ''
                      }`}
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      whileHover={{ scale: 1.2, z: 10 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedFruit(fruit);
                        setIsRotating(false);
                        setTimeout(() => setIsRotating(true), 2000);
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: fruit.id === 'pista' || fruit.id === 'walnut' ? 1.2 : 0.8,
                      }}
                      transition={{ 
                        duration: 0.5,
                        delay: index * 0.15,
                        ease: "easeOut"
                      }}
                    >
                                              <div className={`relative ${
                          fruit.id === 'pista' || fruit.id === 'walnut' 
                            ? 'border-4 border-transparent bg-transparent rounded-lg p-4 min-w-[100px] min-h-[100px]' 
                            : ''
                        }`}>
                        <img
                          src={fruit.image}
                          alt={fruit.name}
                          className={`object-contain filter drop-shadow-lg ${
                            fruit.id === 'pista' || fruit.id === 'walnut' 
                              ? 'w-16 h-16 sm:w-24 sm:h-24 lg:w-56 lg:h-56' 
                              : 'w-12 h-12 sm:w-16 sm:h-16 lg:w-32 lg:h-32'
                          }`}

                        />
                        
                        {/* Subtle glow for non-selected items */}
                        {!isSelected && (
                          <div 
                            className="absolute inset-0 rounded-full blur-lg opacity-30"
                            style={{ 
                              background: `linear-gradient(135deg, ${fruit.colors.primary}60, ${fruit.colors.secondary}60)` 
                            }}
                          />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Dynamic Quality Badges for Selected Fruit - Hidden on mobile since animation is background */}
              <motion.div
                className="hidden lg:block absolute lg:-top-12 lg:-right-6 bg-white/90 backdrop-blur-sm rounded-full lg:px-4 lg:py-2 shadow-lg border-2"
                style={{ borderColor: selectedFruit.colors.primary }}
                key={`fresh-${selectedFruit.id}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="flex items-center lg:gap-2">
                  <div 
                    className="lg:w-3 lg:h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: selectedFruit.colors.primary }}
                  />
                  <span className="lg:text-sm font-semibold text-amber-800">Fresh</span>
                </div>
              </motion.div>

              <motion.div
                className="hidden lg:block absolute lg:-bottom-16 lg:-left-8 bg-white/90 backdrop-blur-sm rounded-full lg:px-4 lg:py-2 shadow-lg border-2"
                style={{ borderColor: selectedFruit.colors.primary }}
                key={`premium-${selectedFruit.id}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="flex items-center lg:gap-2">
                  <Award 
                    className="lg:w-4 lg:h-4"
                    style={{ color: selectedFruit.colors.primary }}
                  />
                  <span className="lg:text-sm font-semibold text-amber-800">Premium</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>


    </section>
  );
};

export default HeroSection;
