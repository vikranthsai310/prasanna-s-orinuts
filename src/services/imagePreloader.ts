import { FIREBASE_IMAGE_URLS } from './imageService';

// Cache for preloaded images
const preloadedImages = new Map<string, HTMLImageElement>();
const preloadPromises = new Map<string, Promise<HTMLImageElement>>();

/**
 * Preload a single image
 * @param src - Image URL to preload
 * @param alt - Alt text for the image
 * @returns Promise<HTMLImageElement>
 */
/**
 * Validate if a URL is valid and safe to load
 * @param url - URL to validate
 * @returns boolean - true if valid
 */
const isValidImageUrl = (url: string): boolean => {
  if (!url || url.trim() === '' || url === 'undefined' || url === 'null') {
    return false;
  }
  
  // Check for malformed data URLs
  if (url.startsWith('data:') && (url.includes('base64,=:') || url === 'data:;base64,=')) {
    return false;
  }
  
  try {
    new URL(url, window.location.origin);
    return true;
  } catch {
    return false;
  }
};

export const preloadImage = (src: string, alt: string = ''): Promise<HTMLImageElement> => {
  // Validate URL first
  if (!isValidImageUrl(src)) {
    console.warn(`Invalid image URL skipped: ${src}`);
    return Promise.reject(new Error(`Invalid image URL: ${src}`));
  }

  // Return cached image if already preloaded
  if (preloadedImages.has(src)) {
    return Promise.resolve(preloadedImages.get(src)!);
  }

  // Return existing promise if already being loaded
  if (preloadPromises.has(src)) {
    return preloadPromises.get(src)!;
  }

  // Create new preload promise
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      preloadedImages.set(src, img);
      preloadPromises.delete(src);
      console.log(`✅ Preloaded image: ${src}`);
      resolve(img);
    };
    
    img.onerror = (error) => {
      preloadPromises.delete(src);
      console.error(`❌ Failed to preload image: ${src}`, error);
      reject(error);
    };
    
    img.alt = alt;
    img.src = src;
  });

  preloadPromises.set(src, promise);
  return promise;
};

/**
 * Preload multiple images
 * @param images - Array of image objects with src and alt
 * @returns Promise<HTMLImageElement[]>
 */
export const preloadImages = async (images: Array<{ src: string; alt: string }>): Promise<HTMLImageElement[]> => {
  const promises = images.map(img => preloadImage(img.src, img.alt));
  
  try {
    const results = await Promise.allSettled(promises);
    const successful = results
      .filter((result): result is PromiseFulfilledResult<HTMLImageElement> => result.status === 'fulfilled')
      .map(result => result.value);
    
    const failed = results.filter(result => result.status === 'rejected').length;
    
    console.log(`🎯 Preloaded ${successful.length} images successfully, ${failed} failed`);
    return successful;
  } catch (error) {
    console.error('Error preloading images:', error);
    return [];
  }
};

/**
 * Preload all Firebase product images
 * @returns Promise<HTMLImageElement[]>
 */
export const preloadFirebaseImages = async (): Promise<HTMLImageElement[]> => {
  const firebaseImages = Object.entries(FIREBASE_IMAGE_URLS).map(([name, url]) => ({
    src: url,
    alt: `${name} image`
  }));
  
  console.log('🚀 Starting to preload Firebase Storage images...');
  return preloadImages(firebaseImages);
};

/**
 * Preload critical images (hero section images)
 * @returns Promise<HTMLImageElement[]>
 */
export const preloadCriticalImages = async (): Promise<HTMLImageElement[]> => {
  const criticalImages = [
    { src: FIREBASE_IMAGE_URLS.almond, alt: 'Premium Almonds' },
    { src: FIREBASE_IMAGE_URLS.cashew, alt: 'Exotic Cashews' },
    { src: FIREBASE_IMAGE_URLS.walnut, alt: 'Organic Walnuts' },
    { src: FIREBASE_IMAGE_URLS.pista, alt: 'Premium Pistachios' },
    { src: FIREBASE_IMAGE_URLS.dates, alt: 'Medjool Dates' },
    { src: FIREBASE_IMAGE_URLS.apricot, alt: 'Dried Apricots' },
    { src: FIREBASE_IMAGE_URLS.rasins, alt: 'Golden Raisins' }
  ];
  
  console.log('⚡ Preloading critical images for hero section...');
  return preloadImages(criticalImages);
};

/**
 * Get preloaded image if available
 * @param src - Image URL
 * @returns HTMLImageElement | null
 */
export const getPreloadedImage = (src: string): HTMLImageElement | null => {
  return preloadedImages.get(src) || null;
};

/**
 * Check if image is preloaded
 * @param src - Image URL
 * @returns boolean
 */
export const isImagePreloaded = (src: string): boolean => {
  return preloadedImages.has(src);
};

/**
 * Clear preloaded images cache (useful for memory management)
 */
export const clearPreloadCache = (): void => {
  preloadedImages.clear();
  preloadPromises.clear();
  console.log('🧹 Cleared image preload cache');
};

/**
 * Get cache statistics
 * @returns object with cache info
 */
export const getCacheStats = () => {
  return {
    preloadedCount: preloadedImages.size,
    loadingCount: preloadPromises.size,
    totalMemory: Array.from(preloadedImages.values()).reduce((total, img) => {
      return total + (img.naturalWidth * img.naturalHeight * 4); // Rough estimate
    }, 0)
  };
};
