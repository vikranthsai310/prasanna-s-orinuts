
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockProducts } from '@/data/mockProducts';
import { useCart } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import ProductStructuredData from '@/components/ProductStructuredData';
import { SEO } from '@/components/SEO';
import { getProductById, getAllProducts } from '@/services/productService';
import { getProductDiscount, calculateDiscountedPrice } from '@/services/discountService';
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
  const [discount, setDiscount] = useState<number | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Fetch the product
        const fetchedProduct = await getProductById(id);
        
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          
          // Fetch discount
          const productDiscount = await getProductDiscount(id);
          if (productDiscount && productDiscount.isActive) {
            setDiscount(productDiscount.discountPercentage);
          }
          
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
    
    const basePrice = product.prices[selectedWeight];
    const finalPrice = discount !== null ? calculateDiscountedPrice(basePrice, discount) : basePrice;
    
    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
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
              loading="eager"
              decoding="async"
              fetchPriority="high"
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
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all bg-accent ${
                    selectedImageIndex === index
                      ? 'border-secondary ring-2 ring-secondary/30'
                      : 'border-border hover:border-secondary/50'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start gap-4 mb-3">
              <h1 className="font-playfair text-3xl font-bold flex-1">{product.name}</h1>
              {discount !== null && (
                <div className="relative flex-shrink-0">
                  <div className="bg-[#C99700] text-white px-4 py-2 rounded-xl shadow-xl border-2 border-[#DAA520]">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-bold text-lg tracking-tight">{discount}% OFF</span>
                    </div>
                    <div className="text-[10px] font-semibold tracking-wider uppercase opacity-90 mt-0.5">
                      Special Offer
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-lg">{product.description}</p>
          </div>

          {/* Weight Selection */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Select Weight</h3>
            <div className="space-y-3">
              {Object.entries(product.prices).map(([weight, price]) => {
                const discountedPrice = discount !== null ? calculateDiscountedPrice(price, discount) : null;
                const isSelected = selectedWeight === weight;
                return (
                  <label 
                    key={weight} 
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-secondary bg-secondary/5 shadow-md' 
                        : 'border-gray-200 hover:border-secondary/50 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="weight"
                      value={weight}
                      checked={isSelected}
                      onChange={(e) => setSelectedWeight(e.target.value as '250g' | '500g' | '1kg')}
                      className="text-secondary focus:ring-secondary w-5 h-5"
                    />
                    <span className={`flex-1 font-medium ${isSelected ? 'text-secondary' : ''}`}>{weight}</span>
                    {discountedPrice !== null ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <span className="text-sm text-muted-foreground/80 font-medium">₹{price}</span>
                            <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-red-500/70 transform -rotate-12"></div>
                          </div>
                          <span className="font-bold text-lg text-[#C99700]">
                            ₹{discountedPrice.toFixed(0)}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#C99700]/90 tracking-wide">
                          SAVE ₹{(price - discountedPrice).toFixed(0)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-lg text-secondary">₹{price}</span>
                    )}
                  </label>
                );
              })}
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
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col gap-2">
                  {discount !== null ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Price</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <span className="text-xl text-muted-foreground/70 font-semibold">
                            ₹{(product.prices[selectedWeight] * quantity).toLocaleString()}
                          </span>
                          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500/80 transform -rotate-12"></div>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-[#C99700]">
                            ₹{Math.floor(calculateDiscountedPrice(product.prices[selectedWeight], discount) * quantity)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="bg-[#C99700] text-white px-3 py-1 rounded-lg border-2 border-[#DAA520]">
                          <span className="text-sm font-bold tracking-wide">
                            YOU SAVE ₹{((product.prices[selectedWeight] - calculateDiscountedPrice(product.prices[selectedWeight], discount)) * quantity).toFixed(0)}
                          </span>
                        </div>
                        <span className="text-xs text-[#C99700]/80 font-semibold">
                          ({discount}% discount applied)
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Price</span>
                      <span className="text-4xl font-bold text-secondary">
                        ₹{(product.prices[selectedWeight] * quantity).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm text-muted-foreground font-medium">Availability</span>
                  {product.stock > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm font-semibold text-green-600">{product.stock} in stock</span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-red-600">Out of stock</span>
                  )}
                </div>
              </div>
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
