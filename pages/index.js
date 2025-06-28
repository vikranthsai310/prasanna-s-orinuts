import Head from 'next/head';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

export default function Home() {
  return (
    <AuthProvider>
      <CartProvider>
        <div>
          <Head>
            <title>Prasanna's Orinut - Premium Dry Fruits</title>
            <meta name="description" content="Premium quality dry fruits - Fresh, nutritious and carefully selected" />
          </Head>
          
          <main className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="font-playfair text-4xl font-bold mb-4 text-primary">
                Welcome to Prasanna's Orinut
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Premium quality dry fruits - Fresh, nutritious and carefully selected
              </p>
              <div className="bg-card p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Next.js Migration Successful!</h2>
                <p className="text-muted-foreground">
                  Your e-commerce application has been successfully migrated to Next.js.
                  The contexts, styling, and basic structure are now working properly.
                </p>
              </div>
            </div>
          </main>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}