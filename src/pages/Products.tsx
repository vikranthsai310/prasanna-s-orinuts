
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { SEO } from '@/components/SEO';
import { mockProducts } from '@/data/mockProducts';
import { Button } from '@/components/ui/button';
import { getAllProducts, searchProducts } from '@/services/productService';
import { Product } from '@/types/product';
import { Loader2, Search } from 'lucide-react';

const Products = () => {
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        let fetchedProducts: Product[] = [];
        
        if (searchQuery) {
          // Search for products if search query exists
          try {
            fetchedProducts = await searchProducts(searchQuery);
          } catch (error) {
            // Fallback to searching mock products
            fetchedProducts = mockProducts.filter(product =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
        } else {
          // Fetch all products if no search query
          try {
            fetchedProducts = await getAllProducts();
          } catch (error) {
            fetchedProducts = mockProducts;
          }
        }
        
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
  }, [searchQuery]);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'nuts', name: 'Nuts' },
    { id: 'dates', name: 'Dates' },
    { id: 'dried-fruits', name: 'Dried Fruits' },
    { id: 'mixed', name: 'Mixed' }
  ];

  // Apply category filter only when not searching
  const filteredProducts = searchQuery 
    ? products 
    : filter === 'all' 
      ? products 
      : products.filter(product => product.category === filter);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* SEO */}
      <SEO
        title="Premium Dry Fruits & Nuts Online - Almonds, Cashews, Walnuts, Dates | Best Prices"
        description="Shop Premium Quality Dry Fruits Online ✓ California Almonds ✓ Jumbo Cashews ✓ Kashmir Walnuts ✓ Afghani Dates ✓ Iranian Pistachios ✓ Golden Raisins ✓ 100% Natural ✓ Free Shipping ✓ Best Wholesale Prices in India"
        keywords={['dry fruits online shopping', 'buy almonds online', 'buy cashews online', 'buy walnuts online', 'buy dates online', 'buy pistachios online', 'dry fruits shop near me', 'online dry fruits store', 'fresh dry fruits', 'premium nuts online']}
        canonicalUrl="https://prasannasorinuts.com/products"
        type="website"
      />
      
      <div className="text-center mb-8">
        {searchQuery ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Search className="h-6 w-6 text-secondary" />
              <h1 className="font-playfair text-3xl md:text-4xl font-bold">
                Search Results
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Found {products.length} result{products.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          </>
        ) : (
          <>
            <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-4">
              Our Premium Collection
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our carefully curated selection of the finest dry fruits from around the world
            </p>
          </>
        )}
      </div>

      {/* Category Filter - Only show when not searching */}
      {!searchQuery && (
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
      )}

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
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No products found for "${searchQuery}". Try a different search term.`
                  : 'No products found in this category.'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;
