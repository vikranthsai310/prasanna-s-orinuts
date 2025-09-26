import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingCart, Check, Shield, Award, Star } from 'lucide-react';
import HeroSectionAnimated from '@/components/HeroSectionAnimated';
import ProductCardAnimated from '@/components/ProductCardAnimated';
import AnimatedButton from '@/components/AnimatedButton';
import PageTransition from '@/components/PageTransition';
import { mockProducts } from '@/data/mockProducts';

const IndexAnimated = () => {
  const featuredProducts = mockProducts.slice(0, 4);

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero Section with Anime.js animations */}
        <HeroSectionAnimated />

        {/* Featured Products Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-amber-50/50 to-white">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-12 stagger-item">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-900 mb-4">
                Featured Premium Collection
              </h2>
              <p className="text-lg text-amber-800/70 max-w-2xl mx-auto">
                Handpicked premium nuts and dried fruits from the finest orchards around the world
              </p>
            </div>

            {/* Product Grid with Animated Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
              {featuredProducts.map((product, index) => (
                <ProductCardAnimated 
                  key={product.id} 
                  product={product} 
                  index={index}
                />
              ))}
            </div>

            {/* Call to Action with Animated Button */}
            <div className="text-center stagger-item">
              <Link to="/products">
                <AnimatedButton
                  size="lg"
                  animationType="glow"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-lg px-8 py-4"
                >
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 stagger-item">
              <h2 className="text-3xl sm:text-4xl font-bold text-amber-900 mb-4">
                Why Choose Prasanna Premium Orchard?
              </h2>
              <p className="text-lg text-amber-800/70 max-w-2xl mx-auto">
                We bring you the finest quality nuts and dried fruits with uncompromising standards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: "Premium Quality",
                  description: "Hand-selected nuts and fruits from certified organic farms"
                },
                {
                  icon: Award,
                  title: "Expert Curation",
                  description: "Years of expertise in selecting the finest products"
                },
                {
                  icon: Heart,
                  title: "Health First",
                  description: "Natural, preservative-free products for your wellbeing"
                }
              ].map((feature, index) => (
                <div key={index} className="stagger-item text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                    <feature.icon className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-amber-800/70">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-gradient-to-r from-amber-100 to-orange-100">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto stagger-item">
              <h2 className="text-3xl font-bold text-amber-900 mb-4">
                Stay Updated with Premium Offers
              </h2>
              <p className="text-amber-800/70 mb-8">
                Get exclusive access to new arrivals and special discounts
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <AnimatedButton
                  animationType="pulse"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3"
                >
                  Subscribe
                </AnimatedButton>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default IndexAnimated;