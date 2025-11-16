import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingCart, Check, Shield, Award, Star } from 'lucide-react';
import HeroSectionAnimated from '@/components/HeroSectionAnimated';
import ProductCardAnimated from '@/components/ProductCardAnimated';
import AnimatedButton from '@/components/AnimatedButton';
import PageTransition from '@/components/PageTransition';
import { getAllProducts } from '@/services/productService';
import type { Product } from '@/types';

const IndexAnimated = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getAllProducts();
        setFeaturedProducts(products.slice(0, 4));
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
              {isLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                  <p className="mt-4 text-amber-800">Loading products...</p>
                </div>
              ) : featuredProducts.length > 0 ? (
                featuredProducts.map((product, index) => (
                  <ProductCardAnimated 
                    key={product.id} 
                    product={product} 
                    index={index}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-amber-800">No products available at the moment.</p>
                </div>
              )}
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


      </div>
    </PageTransition>
  );
};

export default IndexAnimated;