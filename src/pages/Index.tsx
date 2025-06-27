
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { mockProducts } from '@/data/mockProducts';

const Index = () => {
  const featuredProducts = mockProducts.slice(0, 4);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60">
          <img 
            src="/placeholder.svg" 
            alt="Premium dry fruits"
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-6">
            Fresh Premium Dry Fruits
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Handpicked, naturally dried, and delivered fresh to your doorstep
          </p>
          <Link to="/products">
            <Button size="lg" className="btn-secondary text-lg px-8 py-4">
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
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
      <section className="py-16 bg-accent/20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-playfair text-3xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-muted-foreground mb-8">
              Get the latest updates on new products, special offers, and health tips
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field flex-1"
              />
              <Button className="btn-primary">
                Subscribe
              </Button>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Or connect with us on WhatsApp for instant updates
              </p>
              <Button variant="outline" className="bg-green-500 text-white hover:bg-green-600 border-green-500">
                WhatsApp Updates
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
