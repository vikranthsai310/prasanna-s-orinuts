/**
 * Production Console Configuration
 * 
 * Suppresses known, non-critical warnings in production
 * while keeping critical errors visible
 */

/**
 * Initialize production console configuration
 * Call this once at app startup
 */
export const initializeProductionConsole = () => {
  // Only run in production
  if (import.meta.env.PROD) {
    
    // List of known warning patterns to suppress
    const suppressedWarnings = [
      'Checkout options are mandatory',
      'Razorpay modal closed',
      'DevTools',
      '[vite]',
      'Download the React DevTools'
    ];

    // Backup original console methods
    const originalWarn = console.warn;
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalDebug = console.debug;

    // Override console.warn to filter known warnings
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      const shouldSuppress = suppressedWarnings.some(pattern => 
        message.includes(pattern)
      );
      
      if (!shouldSuppress) {
        originalWarn(...args);
      }
    };

    // Completely silence info, log, and debug in production
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};

    // Keep console.error untouched for critical errors
    // console.error remains as-is

    // Add a subtle watermark (optional)
    console.log = (...args: any[]) => {
      // Only allow our logger or nothing at all
      if (args[0]?.includes?.('[ERROR]')) {
        originalLog(...args);
      }
    };
  }
};

/**
 * Restore original console (for debugging)
 * Use in development only
 */
export const restoreConsole = () => {
  if (typeof window !== 'undefined' && (window as any)._originalConsole) {
    Object.assign(console, (window as any)._originalConsole);
    delete (window as any)._originalConsole;
  }
};

/**
 * Add a professional error handler for uncaught errors
 */
export const initializeGlobalErrorHandler = () => {
  if (import.meta.env.PROD) {
    window.addEventListener('error', (event) => {
      // Log critical errors with professional format
      const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
      console.error(`[${timestamp}] ❌ Uncaught Error:`, event.error?.message || event.message);
      
      // Prevent default console noise
      if (event.error?.message?.includes('ResizeObserver') || 
          event.error?.message?.includes('Script error')) {
        event.preventDefault();
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      // Log critical promise rejections
      const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
      console.error(`[${timestamp}] ❌ Unhandled Promise Rejection:`, event.reason);
    });
  }
};

/**
 * Initialize all production console features
 * Call this at app startup (e.g., in main.tsx)
 */
export const initializeProductionLogging = () => {
  initializeProductionConsole();
  initializeGlobalErrorHandler();
  
  // Optional: Add a subtle watermark to indicate production mode
  if (import.meta.env.PROD) {
    const styles = [
      'color: #4CAF50',
      'background: #1a1a1a',
      'font-size: 12px',
      'padding: 4px 8px',
      'border-radius: 4px'
    ].join(';');
    
    console.log('%c🌲 Premium Orchard - Production Mode', styles);
  }
};

export default {
  initializeProductionConsole,
  initializeGlobalErrorHandler,
  initializeProductionLogging,
  restoreConsole
};
