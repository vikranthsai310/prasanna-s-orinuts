/**
 * Production-Safe Logging Utility
 * 
 * Prevents sensitive data leakage in production while maintaining
 * useful debugging in development.
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

interface LoggerOptions {
  context?: string;
  timestamp?: boolean;
}

/**
 * Logger utility that respects environment
 */
export const logger = {
  /**
   * Info level logging - only in development
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Debug level logging - only in development
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Warning level logging - only in development
   * In production, warnings are silent unless critical
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Error level logging - always shown with professional formatting
   */
  error: (context: string, error?: any, additionalData?: any) => {
    if (isProduction) {
      // Production: Clean, minimal error format
      const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
      const errorMsg = error?.message || error || 'Unknown error';
      console.error(`[${timestamp}] ❌ ${context}: ${errorMsg}`);
      
      // Only show additional data if explicitly marked as critical
      if (additionalData?.critical) {
        console.error('Critical:', additionalData.data);
      }
    } else {
      // Development: Full verbose error logging
      console.error(`[ERROR] ${context}:`, error);
      if (additionalData) {
        console.error('Additional Data:', additionalData);
      }
    }
  },

  /**
   * Success level logging - only in development
   */
  success: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[SUCCESS] ✅', ...args);
    }
  },

  /**
   * API call logging - only in development
   */
  api: (method: string, url: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[API] ${method} ${url}`, data || '');
    }
  },

  /**
   * Performance logging - only in development
   */
  perf: (label: string, duration: number) => {
    if (isDevelopment) {
      console.log(`[PERF] ${label}: ${duration}ms`);
    }
  },

  /**
   * Security event logging - always shown but sanitized
   */
  security: (event: string, sanitizedData?: any) => {
    if (isProduction) {
      // In production, log without sensitive details
      console.warn('[SECURITY]', event);
    } else {
      console.warn('[SECURITY]', event, sanitizedData);
    }
  }
};

/**
 * Sanitize data before logging
 * Removes sensitive fields
 */
export const sanitizeForLogging = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'apiKey',
    'accessToken',
    'refreshToken',
    'creditCard',
    'cvv',
    'ssn',
    'key_secret',
    'keySecret'
  ];

  const sanitized = { ...data };

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }

  return sanitized;
};

/**
 * Log with context
 */
export const logWithContext = (
  level: 'info' | 'debug' | 'warn' | 'error',
  message: string,
  context?: any
) => {
  const sanitizedContext = context ? sanitizeForLogging(context) : undefined;
  
  if (sanitizedContext) {
    logger[level](message, sanitizedContext);
  } else {
    logger[level](message);
  }
};

export default logger;
