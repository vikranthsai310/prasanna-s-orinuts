import { storage } from '../lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { firebaseStorageUrls, localImageUrls } from '@/config';

// Image URL cache to avoid repeated Firebase calls
const imageUrlCache = new Map<string, string>();

// Primary Firebase Storage URLs (use Firebase URLs for better performance)
export const FIREBASE_IMAGE_URLS: Record<string, string> = firebaseStorageUrls;

// Firebase Storage URLs with access tokens (primary source)
export const FIREBASE_STORAGE_URLS = firebaseStorageUrls;

// Local image fallbacks
export const LOCAL_IMAGE_URLS = localImageUrls;

/**
 * Validate if a URL is valid and not empty
 * @param url - URL to validate
 * @returns boolean - true if valid
 */
const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '' || url === 'undefined' || url === 'null') {
    return false;
  }
  
  // Check for malformed data URLs (common issue with extensions/plugins)
  if (url.startsWith('data:') && (
    url.includes('base64,=:') || 
    url === 'data:;base64,=' || 
    url.endsWith('=:1') ||
    url === 'data:;base64,=:1'
  )) {
    console.warn('Detected malformed data URL:', url);
    return false;
  }
  
  try {
    new URL(url, window.location.origin);
    return true;
  } catch {
    return false;
  }
};

/**
 * Clean and fix potentially malformed URLs
 * @param url - URL to clean
 * @returns string - cleaned URL or placeholder
 */
export const cleanImageUrl = (url: string): string => {
  if (!url || !isValidUrl(url)) {
    return '/placeholder.svg';
  }
  return url;
};

/**
 * Get image URL from Firebase Storage
 * @param imageName - Name of the image (without extension)
 * @returns Promise<string> - Download URL
 */
export const getImageUrl = async (imageName: string): Promise<string> => {
  // Validate input
  if (!imageName || imageName.trim() === '') {
    console.warn('Empty or invalid image name provided');
    return '/placeholder.svg';
  }

  // Check cache first
  if (imageUrlCache.has(imageName)) {
    const cachedUrl = imageUrlCache.get(imageName)!;
    if (isValidUrl(cachedUrl)) {
      return cachedUrl;
    } else {
      // Remove invalid cached URL
      imageUrlCache.delete(imageName);
    }
  }

  // Check preloaded URLs
  const preloadedUrl = FIREBASE_IMAGE_URLS[imageName as keyof typeof FIREBASE_IMAGE_URLS];
  if (preloadedUrl && isValidUrl(preloadedUrl)) {
    imageUrlCache.set(imageName, preloadedUrl);
    return preloadedUrl;
  }

  try {
    // Determine the storage path based on image type
    const storagePath = imageName === 'logo' ? `branding/${imageName}.png` : `products/${imageName}.png`;
    const imageRef = ref(storage, storagePath);
    const url = await getDownloadURL(imageRef);
    
    // Validate the URL before caching
    if (isValidUrl(url)) {
      imageUrlCache.set(imageName, url);
      return url;
    } else {
      throw new Error('Invalid URL returned from Firebase');
    }
  } catch (error) {
    console.error(`Error fetching image URL for ${imageName}:`, error);
    
    // Fallback to local image from centralized config
    const localFallback = localImageUrls[imageName as keyof typeof localImageUrls];
    if (localFallback && isValidUrl(localFallback)) {
      console.log(`Using local fallback for ${imageName}: ${localFallback}`);
      return localFallback;
    }
    
    // Final fallback to placeholder
    return '/placeholder.svg';
  }
};

/**
 * Preload all image URLs for better performance
 */
export const preloadImageUrls = async (): Promise<void> => {
  const imageNames = Object.keys(FIREBASE_IMAGE_URLS);
  
  try {
    const urlPromises = imageNames.map(async (imageName) => {
      try {
        const url = await getImageUrl(imageName);
        FIREBASE_IMAGE_URLS[imageName as keyof typeof FIREBASE_IMAGE_URLS] = url;
        return { imageName, url };
      } catch (error) {
        console.warn(`Failed to preload ${imageName}:`, error);
        return { imageName, url: `/${imageName}.png` };
      }
    });

    const results = await Promise.all(urlPromises);
    console.log('✅ Preloaded image URLs:', results);
  } catch (error) {
    console.error('Error preloading image URLs:', error);
  }
};

/**
 * Update the Firebase image URLs configuration
 * This should be called after uploading images to Firebase
 */
export const updateFirebaseImageUrls = (urls: Record<string, string>): void => {
  Object.keys(urls).forEach(key => {
    if (key in FIREBASE_IMAGE_URLS) {
      FIREBASE_IMAGE_URLS[key as keyof typeof FIREBASE_IMAGE_URLS] = urls[key];
      imageUrlCache.set(key, urls[key]);
    }
  });
};

/**
 * Get product image URL with fallback
 * @param productName - Name of the product
 * @returns Promise<string> - Image URL
 */
export const getProductImageUrl = async (productName: string): Promise<string> => {
  // Map product names to image names
  const imageMapping: Record<string, string> = {
    'Premium Almonds': 'almond',
    'Afghani Dates': 'dates',
    'Medjool Dates': 'dates',
    'Kashmir Walnuts': 'walnut',
    'Organic Walnuts': 'walnut',
    'Iranian Pistachios': 'pista',
    'Premium Pistachios': 'pista',
    'Brazilian Cashews': 'cashew',
    'Exotic Cashews': 'cashew',
    'Dried Apricots': 'apricot',
    'Golden Raisins': 'rasins'
  };

  const imageName = imageMapping[productName];
  if (imageName) {
    return getImageUrl(imageName);
  }

  // Default fallback
  return '/placeholder.svg';
};

/**
 * Switch to Firebase Storage URLs (call after fixing Storage rules)
 */
export const enableFirebaseStorage = (): void => {
  Object.keys(FIREBASE_STORAGE_URLS).forEach(key => {
    FIREBASE_IMAGE_URLS[key as keyof typeof FIREBASE_IMAGE_URLS] = 
      FIREBASE_STORAGE_URLS[key as keyof typeof FIREBASE_STORAGE_URLS];
  });
  clearImageCache();
  console.log('✅ Switched to Firebase Storage URLs');
};

/**
 * Switch back to local URLs (fallback)
 */
export const useLocalImages = (): void => {
  FIREBASE_IMAGE_URLS.almond = '/almond.png';
  FIREBASE_IMAGE_URLS.apricot = '/apricot.png';
  FIREBASE_IMAGE_URLS.cashew = '/cashew.png';
  FIREBASE_IMAGE_URLS.dates = '/dates.png';
  FIREBASE_IMAGE_URLS.logo = '/Logo.png';
  FIREBASE_IMAGE_URLS.pista = '/pista.png';
  FIREBASE_IMAGE_URLS.rasins = '/rasins.png';
  FIREBASE_IMAGE_URLS.walnut = '/walnut.png';
  clearImageCache();
  console.log('📁 Switched to local image URLs');
};

/**
 * Clear image cache (useful for development)
 */
export const clearImageCache = (): void => {
  imageUrlCache.clear();
};

// Make functions available globally for easy testing
declare global {
  interface Window {
    enableFirebaseStorage: () => void;
    useLocalImages: () => void;
  }
}

if (typeof window !== 'undefined') {
  window.enableFirebaseStorage = enableFirebaseStorage;
  window.useLocalImages = useLocalImages;
}
