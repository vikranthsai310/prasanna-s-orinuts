/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse, DDoS, and brute force attacks
 * 
 * SECURITY: Uses in-memory store (Vercel serverless functions)
 * For production scaling, consider using Redis or similar
 */

// In-memory store for rate limiting (per-instance)
const rateLimitStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now - value.firstRequest > 60000) { // 1 minute window
            rateLimitStore.delete(key);
        }
    }
}, 300000);

/**
 * Rate limiting configuration per endpoint type
 */
const RATE_LIMITS = {
    // Strict limits for payment/order endpoints
    payment: {
        windowMs: 60000, // 1 minute
        maxRequests: 10, // 10 requests per minute
    },
    // Standard API limits
    api: {
        windowMs: 60000,
        maxRequests: 60, // 60 requests per minute
    },
    // Very strict for email endpoints (prevent spam)
    email: {
        windowMs: 60000,
        maxRequests: 5, // 5 emails per minute
    },
    // Auth endpoints (prevent brute force)
    auth: {
        windowMs: 300000, // 5 minutes
        maxRequests: 10, // 10 attempts per 5 minutes
    },
};

/**
 * Generate a unique key for rate limiting
 * Uses IP address + user ID (if authenticated)
 */
function getRateLimitKey(req, endpoint) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip'] ||
        req.socket?.remoteAddress ||
        'unknown';
    const userId = req.user?.uid || 'anonymous';
    return `${endpoint}:${ip}:${userId}`;
}

/**
 * Check if request should be rate limited
 * @param {string} key - Unique identifier for the client
 * @param {object} limits - Rate limit configuration
 * @returns {object} - { limited: boolean, remaining: number, resetTime: number }
 */
function checkRateLimit(key, limits) {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record) {
        // First request from this client
        rateLimitStore.set(key, {
            count: 1,
            firstRequest: now,
        });
        return {
            limited: false,
            remaining: limits.maxRequests - 1,
            resetTime: now + limits.windowMs,
        };
    }

    // Check if window has expired
    if (now - record.firstRequest > limits.windowMs) {
        // Reset the window
        rateLimitStore.set(key, {
            count: 1,
            firstRequest: now,
        });
        return {
            limited: false,
            remaining: limits.maxRequests - 1,
            resetTime: now + limits.windowMs,
        };
    }

    // Increment count
    record.count++;
    rateLimitStore.set(key, record);

    const remaining = Math.max(0, limits.maxRequests - record.count);
    const resetTime = record.firstRequest + limits.windowMs;

    return {
        limited: record.count > limits.maxRequests,
        remaining,
        resetTime,
    };
}

/**
 * Rate limiting middleware factory
 * @param {string} type - Type of rate limit ('payment', 'api', 'email', 'auth')
 * @returns {function} - Middleware function
 */
export function rateLimit(type = 'api') {
    const limits = RATE_LIMITS[type] || RATE_LIMITS.api;

    return (req, res, next) => {
        const key = getRateLimitKey(req, type);
        const result = checkRateLimit(key, limits);

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', limits.maxRequests);
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

        if (result.limited) {
            res.setHeader('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000));
            return res.status(429).json({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
            });
        }

        // Continue to handler
        if (typeof next === 'function') {
            return next();
        }
        return false; // Not rate limited
    };
}

/**
 * Check rate limit without middleware pattern
 * For use in existing handlers
 */
export function checkRateLimitForRequest(req, res, type = 'api') {
    const limits = RATE_LIMITS[type] || RATE_LIMITS.api;
    const key = getRateLimitKey(req, type);
    const result = checkRateLimit(key, limits);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limits.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

    if (result.limited) {
        res.setHeader('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000));
        return {
            limited: true,
            response: {
                status: 429,
                body: {
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
                },
            },
        };
    }

    return { limited: false };
}

export default {
    rateLimit,
    checkRateLimitForRequest,
    RATE_LIMITS,
};
