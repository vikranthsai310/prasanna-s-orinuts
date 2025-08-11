import { storage } from '../lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

// Image URL cache to avoid repeated Firebase calls
const imageUrlCache = new Map<string, string>();

// Using Firebase Storage URLs with access tokens
export const FIREBASE_IMAGE_URLS = {
  almond: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Falmond.png?alt=media&token=b170e0bf-b602-4211-8049-45f5a0b91b01',
  apricot: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Fapricot.png?alt=media&token=2071be84-fa26-491b-867a-8f0cc3041e31',
  cashew: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Fcashew.png?alt=media&token=6ea5e570-ee2c-46a2-888f-9cb7a540744c',
  dates: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Fdates.png?alt=media&token=6e7ae1e5-cf65-46e8-926f-fe3169bf53a0',
  logo: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/branding%2Flogo.png?alt=media',
  pista: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Fpista.png?alt=media&token=aca2b4cf-0083-4dab-b9e6-cf2b328f4385',
  rasins: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Frasins.png?alt=media&token=017e6c45-d8c8-4db8-9c4c-43bbd44389a7',
  walnut: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Fwalnut.png?alt=media&token=4336cad7-0a50-4762-bed7-1736cff605a0'
};

// Firebase Storage URLs with access tokens (backup reference)
export const FIREBASE_STORAGE_URLS = {
  almond: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Falmond.png?alt=media&token=b170e0bf-b602-4211-8049-45f5a0b91b01',
  apricot: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Fapricot.png?alt=media&token=2071be84-fa26-491b-867a-8f0cc3041e31',
  cashew: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Fcashew.png?alt=media&token=6ea5e570-ee2c-46a2-888f-9cb7a540744c',
  dates: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Fdates.png?alt=media&token=6e7ae1e5-cf65-46e8-926f-fe3169bf53a0',
  logo: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/branding%2Flogo.png?alt=media',
  pista: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Fpista.png?alt=media&token=aca2b4cf-0083-4dab-b9e6-cf2b328f4385',
  rasins: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Frasins.png?alt=media&token=017e6c45-d8c8-4db8-9c4c-43bbd44389a7',
  walnut: 'https://firebasestorage.googleapis.com/v0/b/orinut-494cc.firebasestorage.app/o/products%2Fwalnut.png?alt=media&token=4336cad7-0a50-4762-bed7-1736cff605a0'
};

/**
 * Get image URL from Firebase Storage
 * @param imageName - Name of the image (without extension)
 * @returns Promise<string> - Download URL
 */
export const getImageUrl = async (imageName: string): Promise<string> => {
  // Check cache first
  if (imageUrlCache.has(imageName)) {
    return imageUrlCache.get(imageName)!;
  }

  // Check preloaded URLs
  if (FIREBASE_IMAGE_URLS[imageName as keyof typeof FIREBASE_IMAGE_URLS]) {
    const url = FIREBASE_IMAGE_URLS[imageName as keyof typeof FIREBASE_IMAGE_URLS];
    imageUrlCache.set(imageName, url);
    return url;
  }

  try {
    // Determine the storage path based on image type
    const storagePath = imageName === 'logo' ? `branding/${imageName}.png` : `products/${imageName}.png`;
    const imageRef = ref(storage, storagePath);
    const url = await getDownloadURL(imageRef);
    
    // Cache the URL
    imageUrlCache.set(imageName, url);
    return url;
  } catch (error) {
    console.error(`Error fetching image URL for ${imageName}:`, error);
    // Fallback to local image
    return `/${imageName}.png`;
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
