// pages/products/[slug].js - Product Detail Page with SSG
import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import Layout from '../../components/Layout/Layout';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../contexts/CartContext';
import { mockProducts } from '../../data/mockProducts';

export default function ProductDetail({ product, relatedProducts }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedWeight, setSelectedWeight] = useState('250g');
  const [quantity, setQuantity] = useState(1);

  if (router.isFallback) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <Head>
          <title>Product Not Found - Prasanna's Orinut</title>
        </Head>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Link href="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </div>
      </Layout>
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

  return (
    <Layout>
      <Head>
        <title>{product.name} - Prasanna's Orinut</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={`${product.name} - Prasanna's Orinut`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
        <meta property="og:type" content="product" />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": product.name,
              "description": product.description,
              "image": product.image,
              "offers": {
                "@type": "AggregateOffer",
                "lowPrice": Math.min(...Object.values(product.prices)),
                "highPrice": Math.max(...Object.values(product.prices)),
                "priceCurrency": "INR",
                "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
              },
              "brand": {
                "@type": "Brand",
                "name": "Prasanna's Orinut"
              }
            })
          }}
        />
      </Head>

      <div className="container mx-auto px-4 py-8 animate-fade-in">
        {/* Back Button */}
        <Link href="/products" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden relative">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
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
                      onChange={(e) => setSelectedWeight(e.target.value)}
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Static Site Generation
export async function getStaticPaths() {
  // Generate paths for all products
  const paths = mockProducts.map((product) => ({
    params: { slug: product.id }
  }));

  return {
    paths,
    fallback: true // Enable ISR for new products
  };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  
  // Find the product
  const product = mockProducts.find(p => p.id === slug);
  
  if (!product) {
    return {
      notFound: true
    };
  }

  // Get related products
  const relatedProducts = mockProducts
    .filter(p => p.id !== slug && p.category === product.category)
    .slice(0, 4);

  return {
    props: {
      product,
      relatedProducts
    },
    revalidate: 3600 // Revalidate every hour
  };
}