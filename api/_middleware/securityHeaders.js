/**
 * Security Headers Middleware
 * Adds essential HTTP security headers to protect against common attacks
 * 
 * Protects against:
 * - XSS attacks
 * - Clickjacking
 * - MIME type sniffing
 * - Information disclosure
 */

/**
 * Configure security headers
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 */
export function setSecurityHeaders(req, res) {
    // Prevent XSS attacks
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Control referrer information
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy (formerly Feature-Policy)
    res.setHeader('Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=(self)'
    );

    // Strict Transport Security (HSTS) - force HTTPS
    // Only in production to avoid issues with local development
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        );
    }

    // Content Security Policy (moderate - adjust based on your needs)
    // This is a baseline policy - customize for your specific requirements
    const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.razorpay.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://api.razorpay.com https://lux-checkout.razorpay.com https://apiv2.shiprocket.in wss://*.firebaseio.com",
        "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; ');

    // Only set CSP in production to avoid breaking dev tools
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Content-Security-Policy', cspDirectives);
    }
}

/**
 * Higher-order function to wrap API handlers with security headers
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with security headers
 */
export function withSecurityHeaders(handler) {
    return async (req, res) => {
        // Set security headers
        setSecurityHeaders(req, res);

        // Call the original handler
        return await handler(req, res);
    };
}

export default {
    setSecurityHeaders,
    withSecurityHeaders,
};
