/**
 * SEO Component
 * Manages meta tags, Open Graph, Twitter Cards, and structured data for better SEO
 */

import { useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  price?: number;
  currency?: string;
  availability?: 'instock' | 'outofstock' | 'preorder';
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

interface StructuredDataProps {
  type: 'Product' | 'Organization' | 'WebSite' | 'BreadcrumbList';
  data: any;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_TITLE = 'Prasanna Premium Orchard - Premium Quality Dry Fruits & Nuts';
const DEFAULT_DESCRIPTION = 'Shop premium quality dry fruits, nuts, and healthy snacks. Fresh almonds, cashews, walnuts, dates, and more delivered to your doorstep.';
const DEFAULT_IMAGE = '/Logo.png';
const DEFAULT_URL = 'https://prasanna-premium-orchard.vercel.app';
const SITE_NAME = 'Prasanna Premium Orchard';
const TWITTER_HANDLE = '@prasannaorchard';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Update or create a meta tag
 */
const updateMetaTag = (
  attribute: 'name' | 'property',
  key: string,
  content: string
): void => {
  if (!content) return;

  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
};

/**
 * Update or create a link tag
 */
const updateLinkTag = (rel: string, href: string): void => {
  if (!href) return;

  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  
  element.href = href;
};

/**
 * Add structured data (JSON-LD)
 */
const addStructuredData = (id: string, data: any): void => {
  // Remove existing script if present
  const existingScript = document.querySelector(`script[data-schema="${id}"]`);
  if (existingScript) {
    existingScript.remove();
  }

  // Create new script
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-schema', id);
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * Remove structured data
 */
const removeStructuredData = (id: string): void => {
  const script = document.querySelector(`script[data-schema="${id}"]`);
  if (script) {
    script.remove();
  }
};

// ============================================================================
// SEO Component
// ============================================================================

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  price,
  currency = 'INR',
  availability = 'instock',
  canonicalUrl,
  noindex = false,
  nofollow = false,
}) => {
  useEffect(() => {
    // Update title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    document.title = fullTitle;

    // Update meta description
    updateMetaTag('name', 'description', description || DEFAULT_DESCRIPTION);

    // Update keywords
    if (keywords && keywords.length > 0) {
      updateMetaTag('name', 'keywords', keywords.join(', '));
    }

    // Update robots
    const robotsContent = [];
    if (noindex) robotsContent.push('noindex');
    if (nofollow) robotsContent.push('nofollow');
    if (robotsContent.length > 0) {
      updateMetaTag('name', 'robots', robotsContent.join(', '));
    }

    // Update author
    if (author) {
      updateMetaTag('name', 'author', author);
    }

    // Update canonical URL
    updateLinkTag('canonical', canonicalUrl || url || DEFAULT_URL);

    // Open Graph tags
    updateMetaTag('property', 'og:title', title || DEFAULT_TITLE);
    updateMetaTag('property', 'og:description', description || DEFAULT_DESCRIPTION);
    updateMetaTag('property', 'og:image', image || DEFAULT_IMAGE);
    updateMetaTag('property', 'og:url', url || DEFAULT_URL);
    updateMetaTag('property', 'og:type', type);
    updateMetaTag('property', 'og:site_name', SITE_NAME);
    
    if (publishedTime) {
      updateMetaTag('property', 'article:published_time', publishedTime);
    }
    if (modifiedTime) {
      updateMetaTag('property', 'article:modified_time', modifiedTime);
    }
    if (section) {
      updateMetaTag('property', 'article:section', section);
    }
    if (tags && tags.length > 0) {
      tags.forEach((tag, index) => {
        updateMetaTag('property', `article:tag`, tag);
      });
    }

    // Twitter Card tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:site', TWITTER_HANDLE);
    updateMetaTag('name', 'twitter:title', title || DEFAULT_TITLE);
    updateMetaTag('name', 'twitter:description', description || DEFAULT_DESCRIPTION);
    updateMetaTag('name', 'twitter:image', image || DEFAULT_IMAGE);

    // Product-specific tags
    if (type === 'product' && price) {
      updateMetaTag('property', 'product:price:amount', price.toString());
      updateMetaTag('property', 'product:price:currency', currency);
      updateMetaTag('property', 'product:availability', availability);
    }

    // Add basic organization structured data
    addStructuredData('organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: DEFAULT_URL,
      logo: `${DEFAULT_URL}${DEFAULT_IMAGE}`,
      sameAs: [
        // Add social media links here
      ],
    });

    // Cleanup function
    return () => {
      // We don't remove meta tags on unmount as they should persist
      // But we remove structured data if needed
      // removeStructuredData('organization');
    };
  }, [
    title,
    description,
    keywords,
    image,
    url,
    type,
    author,
    publishedTime,
    modifiedTime,
    section,
    tags,
    price,
    currency,
    availability,
    canonicalUrl,
    noindex,
    nofollow,
  ]);

  return null; // This component doesn't render anything
};

// ============================================================================
// Structured Data Component
// ============================================================================

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  useEffect(() => {
    const id = `structured-data-${type.toLowerCase()}`;
    
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    };

    addStructuredData(id, structuredData);

    return () => {
      removeStructuredData(id);
    };
  }, [type, data]);

  return null;
};

// ============================================================================
// Preset SEO Configurations
// ============================================================================

export const homeSEO: SEOProps = {
  title: 'Home',
  description: DEFAULT_DESCRIPTION,
  keywords: ['dry fruits', 'nuts', 'almonds', 'cashews', 'walnuts', 'dates', 'healthy snacks'],
  type: 'website',
};

export const productsSEO: SEOProps = {
  title: 'Premium Dry Fruits & Nuts',
  description: 'Browse our collection of premium quality dry fruits and nuts. Fresh, organic, and delivered directly to you.',
  keywords: ['dry fruits', 'nuts', 'almonds', 'cashews', 'walnuts', 'pistachios', 'dates', 'raisins'],
  type: 'website',
};

export const aboutSEO: SEOProps = {
  title: 'About Us',
  description: 'Learn about Prasanna Premium Orchard and our commitment to delivering the finest quality dry fruits and nuts.',
  type: 'website',
};

export const contactSEO: SEOProps = {
  title: 'Contact Us',
  description: 'Get in touch with Prasanna Premium Orchard. We\'re here to help with your orders and questions.',
  type: 'website',
};

// ============================================================================
// Helper function to generate product SEO
// ============================================================================

export const generateProductSEO = (product: {
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
  slug?: string;
}): SEOProps => ({
  title: product.name,
  description: product.description,
  image: product.image,
  type: 'product',
  price: product.price,
  currency: 'INR',
  availability: product.inStock ? 'instock' : 'outofstock',
  url: product.slug ? `${DEFAULT_URL}/products/${product.slug}` : undefined,
});

export default SEO;
