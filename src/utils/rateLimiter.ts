/**
 * Rate Limiting Utilities
 * 
 * SECURITY: Prevents brute force attacks, spam, and API abuse
 * Implements client-side rate limiting for sensitive operations
 */

interface RateLimitEntry {
  attempts: number[];
  blockedUntil?: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private maxAttempts: number;
  private windowMs: number;
  private blockDurationMs: number;

  constructor(
    maxAttempts: number = 5,
    windowMs: number = 60000, // 1 minute
    blockDurationMs: number = 300000 // 5 minutes
  ) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  /**
   * Check if a request can be made
   */
  canMakeRequest(key: string): {
    allowed: boolean;
    remainingAttempts: number;
    resetIn?: number;
    blockedUntil?: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key) || { attempts: [] };

    // Check if currently blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil: entry.blockedUntil
      };
    }

    // Remove old attempts outside the time window
    entry.attempts = entry.attempts.filter(
      timestamp => now - timestamp < this.windowMs
    );

    // Check if limit exceeded
    if (entry.attempts.length >= this.maxAttempts) {
      // Block the key
      entry.blockedUntil = now + this.blockDurationMs;
      this.store.set(key, entry);

      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil: entry.blockedUntil
      };
    }

    return {
      allowed: true,
      remainingAttempts: this.maxAttempts - entry.attempts.length,
      resetIn: this.windowMs
    };
  }

  /**
   * Record an attempt
   */
  recordAttempt(key: string): void {
    const now = Date.now();
    const entry = this.store.get(key) || { attempts: [] };

    // Remove expired attempts
    entry.attempts = entry.attempts.filter(
      timestamp => now - timestamp < this.windowMs
    );

    // Add new attempt
    entry.attempts.push(now);
    this.store.set(key, entry);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all rate limits (use with caution)
   */
  clearAll(): void {
    this.store.clear();
  }

  /**
   * Get current status for a key
   */
  getStatus(key: string): {
    attempts: number;
    isBlocked: boolean;
    blockedUntil?: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry) {
      return { attempts: 0, isBlocked: false };
    }

    // Clean up old attempts
    entry.attempts = entry.attempts.filter(
      timestamp => now - timestamp < this.windowMs
    );

    return {
      attempts: entry.attempts.length,
      isBlocked: entry.blockedUntil ? entry.blockedUntil > now : false,
      blockedUntil: entry.blockedUntil
    };
  }
}

// ============================================
// PREDEFINED RATE LIMITERS
// ============================================

/**
 * Login rate limiter
 * 5 attempts per 5 minutes
 */
export const loginRateLimiter = new RateLimiter(
  5,    // Max 5 attempts
  300000, // Within 5 minutes
  900000  // Block for 15 minutes
);

/**
 * Order creation rate limiter
 * 10 orders per minute
 */
export const orderRateLimiter = new RateLimiter(
  10,   // Max 10 orders
  60000, // Within 1 minute
  300000 // Block for 5 minutes
);

/**
 * Payment attempt rate limiter
 * 3 attempts per 5 minutes
 */
export const paymentRateLimiter = new RateLimiter(
  3,     // Max 3 attempts
  300000, // Within 5 minutes
  900000  // Block for 15 minutes
);

/**
 * Address creation rate limiter
 * 20 addresses per hour
 */
export const addressRateLimiter = new RateLimiter(
  20,      // Max 20 addresses
  3600000, // Within 1 hour
  3600000  // Block for 1 hour
);

/**
 * Review submission rate limiter
 * 5 reviews per hour
 */
export const reviewRateLimiter = new RateLimiter(
  5,       // Max 5 reviews
  3600000, // Within 1 hour
  3600000  // Block for 1 hour
);

/**
 * Search/API rate limiter
 * 100 requests per minute
 */
export const apiRateLimiter = new RateLimiter(
  100,   // Max 100 requests
  60000, // Within 1 minute
  60000  // Block for 1 minute
);

/**
 * Password reset rate limiter
 * 3 attempts per 15 minutes
 */
export const passwordResetRateLimiter = new RateLimiter(
  3,      // Max 3 attempts
  900000, // Within 15 minutes
  1800000 // Block for 30 minutes
);

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format remaining time for user display
 */
export const formatRemainingTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
  }
};

/**
 * Get rate limit error message
 */
export const getRateLimitMessage = (
  action: string,
  blockedUntil?: number
): string => {
  if (blockedUntil) {
    const remainingTime = formatRemainingTime(blockedUntil - Date.now());
    return `Too many ${action} attempts. Please try again in ${remainingTime}.`;
  }
  return `Rate limit exceeded for ${action}. Please try again later.`;
};

// ============================================
// EXPORT
// ============================================

export { RateLimiter };

export default {
  limiters: {
    login: loginRateLimiter,
    order: orderRateLimiter,
    payment: paymentRateLimiter,
    address: addressRateLimiter,
    review: reviewRateLimiter,
    api: apiRateLimiter,
    passwordReset: passwordResetRateLimiter
  },
  utils: {
    formatTime: formatRemainingTime,
    getMessage: getRateLimitMessage
  }
};
