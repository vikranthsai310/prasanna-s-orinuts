/**
 * Suppressor for browser extension related errors
 * Specifically targets MetaMask and other Web3 extension errors
 */

const suppressedErrors = new Set<string>();

/**
 * Initialize extension error suppression
 */
export const initializeExtensionErrorSuppression = () => {
  // Suppress specific known extension errors
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    
    // Check for the specific data URL error
    if (message.includes('data:;base64,=') && message.includes('net::ERR_INVALID_URL')) {
      if (!suppressedErrors.has(message)) {
        console.warn('🔇 Suppressed browser extension error:', message);
        suppressedErrors.add(message);
      }
      return; // Don't log the error
    }
    
    // Call original console.error for other messages
    originalConsoleError.apply(console, args);
  };
  
  // Suppress network errors in the global error handler
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    const filename = event.filename || '';
    
    // Check if error is from extension (inpage.js, content script, etc.)
    if (filename.includes('inpage.js') || 
        filename.includes('content-script') ||
        filename.includes('chrome-extension://') ||
        filename.includes('moz-extension://')) {
      
      // Specifically suppress the data URL error
      if (message.includes('data:;base64,=') || message.includes('ERR_INVALID_URL')) {
        console.warn('🔇 Suppressed extension script error:', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno
        });
        event.preventDefault();
        return false;
      }
    }
  });
  
  // Intercept and block problematic network requests
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
    const urlString = url.toString();
    
    // Block invalid data URLs
    if (urlString.includes('data:;base64,=') || urlString.endsWith('=:1')) {
      console.warn('🚫 Blocked XHR request to invalid URL:', urlString);
      // Don't call the original open method
      return;
    }
    
    return originalOpen.call(this, method, url, ...args);
  };
  
  // Also handle for fetch API (already done in imageErrorHandler but adding here for completeness)
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = input instanceof Request ? input.url : input.toString();
    
    // Block invalid data URLs from extensions
    if (url.includes('data:;base64,=') || url.endsWith('=:1')) {
      console.warn('🚫 Blocked fetch request to invalid URL:', url);
      return Promise.reject(new Error('Invalid data URL blocked by extension error suppressor'));
    }
    
    return originalFetch.call(this, input, init);
  };
  
  console.log('🛡️ Extension error suppression initialized');
};

/**
 * Check if current environment has known problematic extensions
 */
export const detectProblematicExtensions = () => {
  const extensions = [];
  
  // Check for MetaMask
  if ((window as any).ethereum) {
    extensions.push('MetaMask or Web3 wallet');
  }
  
  // Check for extension injected scripts
  const scripts = Array.from(document.querySelectorAll('script'));
  const extensionScripts = scripts.filter(script => 
    script.src.includes('chrome-extension://') || 
    script.src.includes('moz-extension://') ||
    script.innerHTML.includes('inpage')
  );
  
  if (extensionScripts.length > 0) {
    extensions.push(`${extensionScripts.length} extension script(s)`);
  }
  
  if (extensions.length > 0) {
    console.log('🔍 Detected browser extensions:', extensions.join(', '));
    console.log('💡 If you see data URL errors, they are likely from these extensions and can be safely ignored.');
  }
  
  return extensions;
};
