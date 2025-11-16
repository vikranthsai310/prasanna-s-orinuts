/**
 * Server-Side Logger Utility for API Routes
 * Provides consistent logging across Vercel serverless functions
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Format log message with timestamp and context
 */
function formatMessage(level, context, message) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] [${context}] ${message}`;
}

/**
 * Server-side logger for API routes
 */
export const logger = {
  /**
   * Info level logging - only in development
   */
  info: (context, message, data = null) => {
    if (isDevelopment) {
      console.log(formatMessage('INFO', context, message));
      if (data) console.log('  Data:', data);
    }
  },

  /**
   * Debug level logging - only in development
   */
  debug: (context, message, data = null) => {
    if (isDevelopment) {
      console.log(formatMessage('DEBUG', context, message));
      if (data) console.log('  Data:', data);
    }
  },

  /**
   * Warning level logging
   */
  warn: (context, message, data = null) => {
    console.warn(formatMessage('WARN', context, message));
    if (data && isDevelopment) console.warn('  Data:', data);
  },

  /**
   * Error level logging - always shown
   */
  error: (context, message, error = null, data = null) => {
    console.error(formatMessage('ERROR', context, message));
    
    if (error) {
      if (isDevelopment) {
        console.error('  Error:', error);
        if (error.stack) console.error('  Stack:', error.stack);
      } else {
        // Production: Only show sanitized error info
        console.error('  Error:', error.message || error);
      }
    }
    
    if (data) {
      if (isDevelopment) {
        console.error('  Data:', data);
      }
    }
  },

  /**
   * Success level logging - only in development
   */
  success: (context, message, data = null) => {
    if (isDevelopment) {
      console.log(formatMessage('SUCCESS', context, `✅ ${message}`));
      if (data) console.log('  Data:', data);
    }
  },

  /**
   * Request logging
   */
  request: (context, method, path, userId = null) => {
    const message = `${method} ${path}${userId ? ` (User: ${userId})` : ''}`;
    if (isDevelopment) {
      console.log(formatMessage('REQUEST', context, message));
    }
  },

  /**
   * Environment check logging
   */
  envCheck: (context, checks) => {
    if (isDevelopment) {
      console.log(formatMessage('ENV-CHECK', context, 'Environment Variables'));
      Object.entries(checks).forEach(([key, value]) => {
        console.log(`  ${key}:`, value);
      });
    }
  },

  /**
   * Security event logging - always shown
   */
  security: (context, event, data = null) => {
    console.warn(formatMessage('SECURITY', context, event));
    if (data && isDevelopment) {
      console.warn('  Data:', data);
    }
  }
};

export default logger;
