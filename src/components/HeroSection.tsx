import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const { scrollYProgress } = useScroll();
  
  // Parallax transforms with smooth spring physics
  const productY = useTransform(scrollYProgress, [0, 0.3], [0, -40]);
  const backgroundY = useTransform(scrollYProgress, [0, 0.3], [0, 20]);
  const shineX = useTransform(scrollYProgress, [0, 0.3], ["-30%", "130%"]);
  
  // Spring animation for smooth interactions
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const productYSpring = useSpring(productY, springConfig);

  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" style={{ height: 'calc(100vh - 4rem)' }}>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12 items-center w-full py-8 lg:py-12">
          {/* Left Content */}
          <div className="text-left space-y-4 lg:space-y-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-amber-200 shadow-lg">
                <Sparkles className="w-4 h-4 text-amber-500 mr-2" />
                <span className="text-sm font-medium text-amber-800">Premium Quality Guaranteed</span>
              </div>
            </motion.div>

            {/* Main Headline with Staggered Animation */}
            <div className="space-y-1 lg:space-y-2">
              <motion.h1
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.span
                  className="block text-amber-900"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  Harvest
                </motion.span>
                <motion.span
                  className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  Luxury,
                </motion.span>
                <motion.span
                  className="block text-amber-900"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  Daily
                </motion.span>
              </motion.h1>
            </div>

            {/* Subtitle */}
            <motion.p
              className="text-base sm:text-lg lg:text-xl text-amber-800/80 leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              Handpicked. Fresh. Traceable.
            </motion.p>

            <motion.p
              className="text-sm sm:text-base text-amber-700/70 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              Experience the finest selection of premium dry fruits, sourced directly from the world's best orchards.
            </motion.p>

            {/* Trust Badges */}
            <motion.div
              className="flex flex-wrap gap-4 lg:gap-6 items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-2 text-amber-700">
                <Shield className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="text-xs sm:text-sm font-medium">100% Natural</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700">
                <Award className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="text-xs sm:text-sm font-medium">Premium Grade</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700">
                <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="text-xs sm:text-sm font-medium">Fresh Guarantee</span>
              </div>
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
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-6 lg:px-8 py-3 lg:py-4 text-sm lg:text-base shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto"
                  >
                    Shop Signature Mix
                    <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
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
                    className="border-2 border-amber-600 text-amber-700 hover:bg-amber-50 font-semibold px-6 lg:px-8 py-3 lg:py-4 text-sm lg:text-base shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                  >
                    Try Samples First
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>

          {/* Right Product Visual */}
          <div className="relative lg:pl-4 xl:pl-8 flex items-center justify-center">
            <motion.div
              className="relative"
              style={{ y: productYSpring }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full blur-3xl opacity-30 scale-110" />
              
              {/* Main Product Image */}
              <motion.div
                className="relative z-10"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <img
                  src="/almond.png"
                  alt="Premium Almonds"
                  className="w-full h-auto max-w-xs sm:max-w-sm lg:max-w-md mx-auto drop-shadow-2xl"
                  loading="eager"
                />
                
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                  style={{ x: shineX }}
                  initial={{ x: "-30%" }}
                  animate={{ x: "130%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              {/* Floating Quality Badges */}
              <motion.div
                className="absolute -top-2 lg:-top-4 -right-2 lg:-right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 lg:px-4 py-1.5 lg:py-2 shadow-lg border border-amber-200"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.5, type: "spring" }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="flex items-center gap-1.5 lg:gap-2">
                  <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs lg:text-sm font-semibold text-amber-800">Fresh</span>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 lg:-bottom-6 -left-4 lg:-left-6 bg-white/90 backdrop-blur-sm rounded-full px-3 lg:px-4 py-1.5 lg:py-2 shadow-lg border border-amber-200"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.7, type: "spring" }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="flex items-center gap-1.5 lg:gap-2">
                  <Award className="w-3 h-3 lg:w-4 lg:h-4 text-amber-600" />
                  <span className="text-xs lg:text-sm font-semibold text-amber-800">Premium</span>
                </div>
              </motion.div>

              {/* Nutrition Ring Animation - Hidden on mobile */}
              <motion.div
                className="absolute top-1/2 -right-4 lg:-right-8 transform -translate-y-1/2 hidden lg:block"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 2, ease: "easeOut" }}
              >
                <div className="relative w-16 h-16 lg:w-20 lg:h-20">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                    {/* Background circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="6"
                    />
                    {/* Progress circle */}
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="30"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="6"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 0.75 }}
                      transition={{ duration: 2, delay: 2.5, ease: "easeOut" }}
                      style={{
                        strokeDasharray: "188.4 188.4",
                        transformOrigin: "center",
                      }}
                    />
                  </svg>
                  {/* Centered text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                      className="text-xs lg:text-sm font-bold text-amber-700 transform rotate-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 3 }}
                    >
                      75%
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-4 lg:bottom-6 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 2 }}
      >
        <motion.div
          className="w-5 h-8 lg:w-6 lg:h-10 border-2 border-amber-600 rounded-full flex justify-center"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="w-1 h-2 lg:h-3 bg-amber-600 rounded-full mt-1.5 lg:mt-2"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
