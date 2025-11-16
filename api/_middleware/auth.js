/**
 * Firebase Admin Authentication Middleware
 * Verifies Firebase ID tokens and provides user authentication for API routes
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { configureCors } from './cors.js';

let adminAuth = null;

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variable
 */
function initializeFirebaseAdmin() {
  if (adminAuth) {
    return adminAuth;
  }

  try {
    const existingApps = getApps();
    
    if (existingApps.length === 0) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (!serviceAccountKey) {
        console.error('❌ Firebase Admin: FIREBASE_SERVICE_ACCOUNT_KEY not configured');
        return null;
      }

      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        
        initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
      } catch (parseError) {
        console.error('❌ Firebase Admin: Failed to parse service account credentials');
        return null;
      }
    }
    
    adminAuth = getAuth();
    return adminAuth;
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    return null;
  }
}

/**
 * Verify Firebase ID Token from Authorization header
 * @param {Request} req - HTTP request object
 * @returns {Promise<Object>} Decoded token with user information
 * @throws {Error} If token is missing, invalid, or expired
 */
export async function verifyAuthToken(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization format. Expected: Bearer <token>');
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  if (!token || token.trim() === '') {
    throw new Error('Empty authorization token');
  }
  
  const auth = initializeFirebaseAdmin();
  
  if (!auth) {
    throw new Error('Firebase Admin is not configured. Check server logs.');
  }
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      isAdmin: decodedToken.admin === true,
      authTime: decodedToken.auth_time,
      iat: decodedToken.iat,
      exp: decodedToken.exp,
    };
  } catch (error) {
    console.error('❌ Token verification failed:', error.code || error.message);
    
    if (error.code === 'auth/id-token-expired') {
      throw new Error('Token has expired. Please refresh and try again.');
    }
    
    if (error.code === 'auth/argument-error') {
      throw new Error('Invalid token format');
    }
    
    throw new Error('Token verification failed: ' + error.message);
  }
}

/**
 * Higher-order function to wrap API handlers with authentication
 * Automatically verifies token and attaches user to request
 * 
 * @param {Function} handler - The API route handler function
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireAdmin - Whether route requires admin privileges
 * @returns {Function} Wrapped handler with authentication
 * 
 * @example
 * export default requireAuth(async (req, res) => {
 *   const userId = req.user.uid;
 *   // ... your handler logic
 * });
 */
export function requireAuth(handler, options = {}) {
  return async (req, res) => {
    try {
      // Configure CORS first
      const optionsHandled = configureCors(req, res);
      if (optionsHandled) {
        return;
      }

      // Check if Firebase Admin can be initialized
      const auth = initializeFirebaseAdmin();
      if (!auth) {
        console.error('❌ Firebase Admin not configured - returning 503');
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Authentication service is not configured. Please contact support.',
          code: 'AUTH_SERVICE_UNAVAILABLE'
        });
      }

      // Verify authentication token
      const user = await verifyAuthToken(req);
      
      // Check admin requirement
      if (options.requireAdmin && !user.isAdmin) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Admin privileges required for this operation'
        });
      }
      
      // Attach user to request object
      req.user = user;
      
      // Call the original handler
      return await handler(req, res);
      
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      console.error('   Stack:', error.stack);
      
      // Return appropriate HTTP status
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: error.message || 'Authentication required',
        code: 'AUTH_REQUIRED',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };
}

/**
 * Optional authentication - does not fail if token is missing
 * Useful for routes that work differently for authenticated users
 * 
 * @param {Request} req - HTTP request object
 * @returns {Promise<Object|null>} User object or null if not authenticated
 */
export async function optionalAuth(req) {
  try {
    return await verifyAuthToken(req);
  } catch (error) {
    return null;
  }
}

/**
 * Verify admin privileges
 * @param {Object} user - Decoded user token
 * @throws {Error} If user is not an admin
 */
export function requireAdmin(user) {
  if (!user.isAdmin) {
    throw new Error('Admin privileges required');
  }
}

/**
 * Verify user owns a resource
 * @param {Object} user - Decoded user token
 * @param {string} resourceUserId - User ID of resource owner
 * @throws {Error} If user doesn't own the resource
 */
export function verifyOwnership(user, resourceUserId) {
  if (user.uid !== resourceUserId && !user.isAdmin) {
    throw new Error('You do not have permission to access this resource');
  }
}

export default {
  verifyAuthToken,
  requireAuth,
  optionalAuth,
  requireAdmin,
  verifyOwnership,
};
