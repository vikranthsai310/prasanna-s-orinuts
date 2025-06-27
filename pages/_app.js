// pages/_app.js - App wrapper replacing App.tsx
import { useEffect } from 'react';
import Head from 'next/head';
import { AuthProvider } from '../src/contexts/AuthContext';
import { CartProvider } from '../src/contexts/CartContext';
import { Toaster } from '../src/components/ui/toaster';
import { Toaster as Sonner } from '../src/components/ui/sonner';
import { TooltipProvider } from '../src/components/ui/tooltip';
import '../src/index.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Prasanna's Orinut - Premium Dry Fruits</title>
        <meta name="description" content="Premium quality dry fruits - Fresh, nutritious and carefully selected" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <Component {...pageProps} />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </>
  );
}