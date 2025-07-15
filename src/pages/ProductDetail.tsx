
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockProducts } from '@/data/mockProducts';
import { useCart } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import ProductStructuredData from '@/components/ProductStructuredData';
import ProductFAQ from '@/components/ProductFAQ';

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const [selectedWeight, setSelectedWeight] = useState<'250g' | '500g' | '1kg'>('250g');
  const [quantity, setQuantity] = useState(1);

  const product = mockProducts.find(p => p.id === id);
  const relatedProducts = mockProducts
    .filter(p => p.id !== id && p.category === product?.category)
    .slice(0, 4);

  if (!product) {
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

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.prices[selectedWeight],
      weight: selectedWeight,
      image: product.image
    });
  };

  // Add title and meta tags for SEO
  useEffect(() => {
    // Update the page title
    document.title = `${product.name} - Premium Dry Fruits | Prasanna's Orinut`;
    
    // Find and update the meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `Buy premium quality ${product.name} online. ${product.description}. 100% natural with no additives.`);
    }
    
    return () => {
      document.title = "Premium Dry Fruits & Nuts | Prasanna's Orinut | High-Quality Almonds, Cashews & Walnuts";
      if (metaDescription) {
        metaDescription.setAttribute('content', "Buy premium quality dry fruits and nuts online. Fresh, nutritious and carefully selected almonds, cashews, walnuts and more. 100% natural with no additives.");
      }
    };
  }, [product]);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Add structured data for this product */}
      <ProductStructuredData product={{
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.prices[selectedWeight],
        imageUrl: product.image,
        category: product.category,
        stock: product.stock
      }} />
      
      {/* Back Button */}
      <Link to="/products" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
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
          <div className="border-t pt-6">
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
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition Facts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="mt-6">
          <div className="prose max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
            <p className="mt-4 text-muted-foreground">
              Our {product.name.toLowerCase()} are carefully selected and processed to maintain their natural goodness. 
              Rich in essential nutrients, they make for a perfect healthy snack or ingredient for your recipes.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="nutrition" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-accent/20 rounded-lg">
              <div className="text-2xl font-bold text-secondary">{product.nutritionalInfo.calories}</div>
              <div className="text-sm text-muted-foreground">Calories</div>
            </div>
            <div className="text-center p-4 bg-accent/20 rounded-lg">
              <div className="text-2xl font-bold text-secondary">{product.nutritionalInfo.protein}g</div>
              <div className="text-sm text-muted-foreground">Protein</div>
            </div>
            <div className="text-center p-4 bg-accent/20 rounded-lg">
              <div className="text-2xl font-bold text-secondary">{product.nutritionalInfo.fat}g</div>
              <div className="text-sm text-muted-foreground">Fat</div>
            </div>
            <div className="text-center p-4 bg-accent/20 rounded-lg">
              <div className="text-2xl font-bold text-secondary">{product.nutritionalInfo.carbs}g</div>
              <div className="text-sm text-muted-foreground">Carbs</div>
            </div>
            <div className="text-center p-4 bg-accent/20 rounded-lg">
              <div className="text-2xl font-bold text-secondary">{product.nutritionalInfo.fiber}g</div>
              <div className="text-sm text-muted-foreground">Fiber</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* FAQ Section */}
      <ProductFAQ product={{
        id: product.id,
        name: product.name,
        category: product.category
      }} />
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="font-playfair text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
