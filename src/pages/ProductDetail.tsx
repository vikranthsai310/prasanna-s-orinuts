
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockProducts } from '@/data/mockProducts';
import { useCart } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import ProductStructuredData from '@/components/ProductStructuredData';
import { SEO } from '@/components/SEO';
import { getProductById, getAllProducts } from '@/services/productService';
import { Product } from '@/types/product';

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const [selectedWeight, setSelectedWeight] = useState<'250g' | '500g' | '1kg'>('250g');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Fetch the product
        const fetchedProduct = await getProductById(id);
        
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          
          // Fetch related products
          const allProducts = await getAllProducts();
          const related = allProducts
            .filter(p => p.id !== id && p.category === fetchedProduct.category)
            .slice(0, 4);
          
          setRelatedProducts(related);
        } else {
          setError('Product not found');
          
          // Fallback to mock data if product not found
          const mockProduct = mockProducts.find(p => p.id === id);
          if (mockProduct) {
            setProduct(mockProduct);
            
            const mockRelated = mockProducts
              .filter(p => p.id !== id && p.category === mockProduct.category)
              .slice(0, 4);
            
            setRelatedProducts(mockRelated);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again later.');
        
        // Fallback to mock data if fetch fails
        const mockProduct = mockProducts.find(p => p.id === id);
        if (mockProduct) {
          setProduct(mockProduct);
          
          const mockRelated = mockProducts
            .filter(p => p.id !== id && p.category === mockProduct.category)
            .slice(0, 4);
          
          setRelatedProducts(mockRelated);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.prices[selectedWeight],
      weight: selectedWeight,
      image: product.image
    }, quantity);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        <span className="ml-2">Loading product...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* SEO */}
      {product && (
        <SEO
          title={`Buy ${product.name} Online | Premium Quality | Best Price in India`}
          description={`${product.description} ✓ 100% Natural ✓ Fresh & Hygienic ✓ Free Shipping ✓ Starting from ₹${product.prices['250g']} for 250g | Order Premium ${product.name} Today!`}
          keywords={[
            `buy ${product.name.toLowerCase()} online`,
            `${product.name.toLowerCase()} price`,
            `${product.name.toLowerCase()} online india`,
            `fresh ${product.name.toLowerCase()}`,
            `premium ${product.name.toLowerCase()}`,
            `${product.name.toLowerCase()} nutrition`,
            `${product.name.toLowerCase()} benefits`,
            `${product.name.toLowerCase()} wholesale`
          ]}
          image={product.image}
          canonicalUrl={`https://prasannasorinuts.com/products/${product.id}`}
          type="product"
          price={product.prices[selectedWeight]}
          currency="INR"
          availability={product.stock > 0 ? 'instock' : 'outofstock'}
        />
      )}
      
      {/* Add structured data for this product */}
      <ProductStructuredData product={{
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.prices[selectedWeight],
        imageUrl: product.image,
        category: product.category,
        stock: product.stock,
        nutritionalInfo: product.nutritionalInfo
      }} />
      
      {/* Back Button */}
      <Link to="/products" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-accent group">
            <img
              src={(product.images && product.images[selectedImageIndex]) || product.image}
              alt={`${product.name} - Image ${selectedImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation Arrows (only show if multiple images) */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((prev) => 
                    prev === 0 ? product.images!.length - 1 : prev - 1
                  )}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setSelectedImageIndex((prev) => 
                    prev === product.images!.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {product.images.length}
                </div>
              </>
            )}
          </div>
          
          {/* Thumbnail Gallery (only show if multiple images) */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-secondary ring-2 ring-secondary/30'
                      : 'border-border hover:border-secondary/50'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="font-playfair text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground text-lg">{product.description}</p>
          </div>

          {/* Weight Selection */}
          <div>
            <h3 className="font-semibold mb-3">Select Weight</h3>
            <div className="space-y-2">
              {Object.entries(product.prices).map(([weight, price]) => (
                <label key={weight} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="weight"
                    value={weight}
                    checked={selectedWeight === weight}
                    onChange={(e) => setSelectedWeight(e.target.value as '250g' | '500g' | '1kg')}
                    className="text-secondary focus:ring-secondary"
                  />
                  <span className="flex-1">{weight}</span>
                  <span className="font-semibold text-secondary">₹{price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <h3 className="font-semibold mb-3">Quantity</h3>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="px-4 py-2 border rounded-md min-w-16 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Price & Actions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-secondary">
                ₹{(product.prices[selectedWeight] * quantity).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 btn-secondary"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-16">
        <Tabs defaultValue="description">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition Facts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <h3>About {product.name}</h3>
              <p>{product.description}</p>
              <p>Our premium quality dry fruits are sourced directly from the best farms around the world. We ensure that each product meets our strict quality standards before it reaches you.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="nutrition" className="mt-6">
            <div className="prose max-w-none">
              <h3>Nutrition Information</h3>
              <p>Nutritional values per 100g:</p>
              <ul>
                <li><strong>Calories:</strong> {product.nutritionalInfo.calories} kcal</li>
                <li><strong>Protein:</strong> {product.nutritionalInfo.protein}g</li>
                <li><strong>Fat:</strong> {product.nutritionalInfo.fat}g</li>
                <li><strong>Carbohydrates:</strong> {product.nutritionalInfo.carbs}g</li>
                <li><strong>Fiber:</strong> {product.nutritionalInfo.fiber}g</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="font-playfair text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
