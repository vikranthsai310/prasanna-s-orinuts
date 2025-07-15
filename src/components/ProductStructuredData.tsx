import { useEffect } from 'react';

interface ProductStructuredDataProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    stock: number;
  };
}

const ProductStructuredData = ({ product }: ProductStructuredDataProps) => {
  useEffect(() => {
    // Create structured data script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = `product-jsonld-${product.id}`;

    // Create structured data content
    const structuredData = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.imageUrl,
      sku: `SKU-${product.id}`,
      mpn: `MPN-${product.id}`,
      brand: {
        '@type': 'Brand',
        name: "Prasanna's Orinut"
      },
      offers: {
        '@type': 'Offer',
        url: `https://premiumorchard.com/product/${product.id}`,
        priceCurrency: 'INR',
        price: product.price,
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        itemCondition: 'https://schema.org/NewCondition',
        availability: product.stock > 0 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: "Prasanna's Orinut - Premium Orchard"
        }
      }
    };

    script.innerHTML = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Clean up
    return () => {
      const existingScript = document.getElementById(`product-jsonld-${product.id}`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [product]);

  return null; // This component doesn't render anything visible
};

export default ProductStructuredData; 