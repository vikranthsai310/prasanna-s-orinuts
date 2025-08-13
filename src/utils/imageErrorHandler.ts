/**
 * Global image error handler to prevent invalid URL errors
 */

// Set to track problematic URLs to avoid repeated logs
const problemUrls = new Set<string>();

/**
 * Initialize global image error handling
 */
export const initializeImageErrorHandling = () => {
  // Add global error handler for image loading errors
  window.addEventListener('error', (event) => {
    const target = event.target;
    
    // Check if the error is from an image element
    if (target instanceof HTMLImageElement) {
      const src = target.src;
      
      // Check for invalid URLs
      if (src && (
        src.includes('data:;base64,=') ||
        src.endsWith('=:1') ||
        src === '' ||
        src === 'undefined' ||
        src === 'null'
      )) {
        // Prevent the error from bubbling up
        event.preventDefault();
        event.stopPropagation();
        
        // Log only once per URL
        if (!problemUrls.has(src)) {
          console.warn(`Invalid image URL detected and handled: ${src}`);
          problemUrls.add(src);
        }
        
        // Set a fallback image
        target.src = '/placeholder.svg';
        target.alt = target.alt || 'Image not available';
      }
    }
  }, true); // Use capture phase
  
  // Also handle unhandled promise rejections that might be related to image loading
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    
    // Check if it's an image-related network error
    if (reason instanceof Error && 
        (reason.message.includes('ERR_INVALID_URL') || 
         reason.message.includes('net::ERR_INVALID_URL'))) {
      
      console.warn('Handled unhandled promise rejection for invalid URL:', reason.message);
      event.preventDefault(); // Prevent the error from being thrown
    }
  });
  
  console.log('✅ Image error handling initialized');
};

/**
 * Clean up resources
 */
export const cleanupImageErrorHandling = () => {
  problemUrls.clear();
};

/**
 * Manually validate and fix an image URL
 * @param url - URL to validate
 * @returns valid URL or fallback
 */
export const validateImageUrl = (url: string): string => {
  if (!url || 
      url.trim() === '' || 
      url === 'undefined' || 
      url === 'null' ||
      url.includes('data:;base64,=') ||
      url.endsWith('=:1')) {
    return '/placeholder.svg';
  }
  
  try {
    new URL(url, window.location.origin);
    return url;
  } catch {
    return '/placeholder.svg';
  }
};
