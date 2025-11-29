/**
 * Image URL Error Handler
 * Helps identify and fix malformed data URL issues
 */

/**
 * Check for and suppress malformed data URLs that might be causing network errors
 */
export const detectMalformedDataUrls = () => {
  // Override console.error to catch malformed data URL errors
  const originalConsoleError = console.error;
  
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Check for data URL related errors - suppress them silently
    if (message.includes('data:;base64,=') || 
        message.includes('net::ERR_INVALID_URL') ||
        message.includes('base64,=:1')) {
      // Don't propagate the error to avoid console spam
      return;
    }
    
    // Call original console.error for other errors
    originalConsoleError.apply(console, args);
  };
};

/**
 * Clean up malformed URLs from the DOM
 */
export const cleanMalformedImageUrls = () => {
  // Find all img elements with malformed data URLs
  const images = document.querySelectorAll('img');
  let cleanedCount = 0;
  
  images.forEach((img) => {
    const src = img.src;
    
    if (src && (
      src.includes('data:;base64,=:') ||
      src === 'data:;base64,=' ||
      src.endsWith('=:1')
    )) {
      img.src = '/placeholder.svg';
      img.alt = img.alt || 'Image not available';
      cleanedCount++;
    }
  });
  
  return cleanedCount;
};

/**
 * Monitor for malformed URLs being added to the DOM
 */
export const monitorForMalformedUrls = () => {
  if (typeof MutationObserver === 'undefined') {
    return;
  }
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if it's an img element or contains img elements
            const images = element.tagName === 'IMG' ? [element] : element.querySelectorAll('img');
            
            images.forEach((img) => {
              const src = (img as HTMLImageElement).src;
              if (src && (
                src.includes('data:;base64,=:') ||
                src === 'data:;base64,=' ||
                src.endsWith('=:1')
              )) {
                (img as HTMLImageElement).src = '/placeholder.svg';
              }
            });
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
};

/**
 * Initialize malformed URL protection
 */
export const initializeMalformedUrlProtection = () => {
  // Detect and handle malformed data URLs
  detectMalformedDataUrls();
  
  // Clean existing malformed URLs
  const cleanedCount = cleanMalformedImageUrls();
  
  // Monitor for new malformed URLs
  const observer = monitorForMalformedUrls();
  
  return {
    cleanedCount,
    observer,
    cleanup: () => {
      observer?.disconnect();
    }
  };
};

// Auto-initialize in development mode
if (process.env.NODE_ENV === 'development') {
  // Run after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMalformedUrlProtection);
  } else {
    initializeMalformedUrlProtection();
  }
}