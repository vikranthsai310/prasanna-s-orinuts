
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { mockProducts } from '@/data/mockProducts';
import { Button } from '@/components/ui/button';
import { getAllProducts } from '@/services/productService';
import { Product } from '@/types/product';
import { Loader2 } from 'lucide-react';

const Products = () => {
  const [filter, setFilter] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const fetchedProducts = await getAllProducts();
        setProducts(fetchedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        // Fallback to mock data if fetch fails
        setProducts(mockProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'nuts', name: 'Nuts' },
    { id: 'dates', name: 'Dates' },
    { id: 'dried-fruits', name: 'Dried Fruits' },
    { id: 'mixed', name: 'Mixed' }
  ];

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(product => product.category === filter);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-4">
          Our Premium Collection
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover our carefully curated selection of the finest dry fruits from around the world
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={filter === category.id ? "default" : "outline"}
            onClick={() => setFilter(category.id)}
            className="mb-2"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          <span className="ml-2">Loading products...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center text-red-500 py-8">
          <p>{error}</p>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-3 text-center py-16">
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;
