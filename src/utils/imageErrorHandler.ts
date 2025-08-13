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
        src === 'data:;base64,=' ||
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
  
  // Enhanced handler specifically for browser extension related errors
  window.addEventListener('error', (event) => {
    // Check if the error message contains the specific malformed data URL
    if (event.message && event.message.includes('data:;base64,=')) {
      console.warn('Browser extension data URL error suppressed:', event.message);
      event.preventDefault();
      return false;
    }
  });
  
  // Also handle unhandled promise rejections that might be related to image loading
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    
    // Check if it's an image-related network error
    if (reason instanceof Error && 
        (reason.message.includes('ERR_INVALID_URL') || 
         reason.message.includes('net::ERR_INVALID_URL') ||
         reason.message.includes('data:;base64,='))) {
      
      console.warn('Handled unhandled promise rejection for invalid URL:', reason.message);
      event.preventDefault(); // Prevent the error from being thrown
    }
  });
  
  // Intercept fetch calls that might be made with invalid data URLs
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = input instanceof Request ? input.url : input.toString();
    
    // Block invalid data URLs
    if (url.includes('data:;base64,=') || url.endsWith('=:1')) {
      console.warn('Blocked fetch request to invalid data URL:', url);
      return Promise.reject(new Error('Invalid data URL blocked'));
    }
    
    return originalFetch.call(this, input, init);
  };
  
  // Override Image constructor to validate URLs
  const OriginalImage = window.Image;
  window.Image = function(width?: number, height?: number) {
    const img = new OriginalImage(width, height);
    
    // Override the src setter
    let _src = '';
    Object.defineProperty(img, 'src', {
      get() { return _src; },
      set(value: string) {
        // Validate the URL before setting
        if (value && (
          value.includes('data:;base64,=') ||
          value.endsWith('=:1') ||
          value === 'data:;base64,='
        )) {
          console.warn('Invalid image src blocked:', value);
          _src = '/placeholder.svg';
        } else {
          _src = value;
        }
        // Set the actual src using the original property descriptor
        Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')?.set?.call(img, _src);
      },
      configurable: true
    });
    
    return img;
  } as any;
  
  console.log('✅ Comprehensive image error handling initialized');
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
