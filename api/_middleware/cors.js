/**
 * CORS Configuration Middleware
 * Handles Cross-Origin Resource Sharing for API endpoints
 */

/**
 * Configure CORS headers for API routes
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @returns {boolean} - True if OPTIONS request handled
 */
export function configureCors(req, res) {
  // Define allowed origins based on environment
  const allowedOrigins = [
    'https://prasanna-premium-orchard.vercel.app',
    'https://www.prasanna-premium-orchard.vercel.app',
    'https://premiumorchard.com',
    'https://www.premiumorchard.com',
    // Allow localhost in development
    process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : null,
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
    process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : null,
  ].filter(Boolean);

  // Get request origin
  const origin = req.headers.origin;

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (process.env.NODE_ENV === 'development') {
    // In development, allow all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // Set allowed methods
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, PATCH'
  );

  // Set allowed headers
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin'
  );

  // Set max age for preflight cache
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // Indicates OPTIONS was handled
  }

  return false; // Continue to actual handler
}

/**
 * Higher-order function to wrap API handlers with CORS
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with CORS
 */
export function withCors(handler) {
  return async (req, res) => {
    // Configure CORS
    const optionsHandled = configureCors(req, res);
    
    // If OPTIONS request, it's already handled
    if (optionsHandled) {
      return;
    }

    // Call the original handler
    return await handler(req, res);
  };
}

export default {
  configureCors,
  withCors,
};
