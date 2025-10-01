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
  console.log('🔥 [FIREBASE-ADMIN] initializeFirebaseAdmin called');
  
  if (adminAuth) {
    console.log('✅ [FIREBASE-ADMIN] Already initialized, returning cached instance');
    return adminAuth;
  }

  try {
    // Check if app is already initialized
    const existingApps = getApps();
    console.log('🔥 [FIREBASE-ADMIN] Existing Firebase apps:', existingApps.length);
    
    if (existingApps.length === 0) {
      console.log('🔥 [FIREBASE-ADMIN] No existing apps, initializing new app...');
      
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      console.log('🔑 [FIREBASE-ADMIN] FIREBASE_SERVICE_ACCOUNT_KEY exists:', !!serviceAccountKey);
      console.log('🔑 [FIREBASE-ADMIN] Key length:', serviceAccountKey?.length);
      
      if (!serviceAccountKey) {
        console.error('❌ [FIREBASE-ADMIN] FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
        console.error('❌ [FIREBASE-ADMIN] Available env vars:', Object.keys(process.env).filter(k => k.includes('FIREBASE')));
        return null;
      }

      try {
        console.log('🔥 [FIREBASE-ADMIN] Parsing service account JSON...');
        const serviceAccount = JSON.parse(serviceAccountKey);
        
        console.log('✅ [FIREBASE-ADMIN] Service account parsed:', {
          project_id: serviceAccount.project_id,
          client_email: serviceAccount.client_email,
          hasPrivateKey: !!serviceAccount.private_key
        });
        
        console.log('🔥 [FIREBASE-ADMIN] Initializing Firebase app...');
        initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
        
        console.log('✅ [FIREBASE-ADMIN] Firebase Admin initialized successfully');
      } catch (parseError) {
        console.error('❌ [FIREBASE-ADMIN] Failed to parse service account:', parseError.message);
        console.error('❌ [FIREBASE-ADMIN] First 100 chars of key:', serviceAccountKey?.substring(0, 100));
        return null;
      }
    } else {
      console.log('✅ [FIREBASE-ADMIN] Using existing Firebase app');
    }
    
    console.log('🔥 [FIREBASE-ADMIN] Getting Auth instance...');
    adminAuth = getAuth();
    console.log('✅ [FIREBASE-ADMIN] Auth instance obtained');
    return adminAuth;
  } catch (error) {
    console.error('❌ [FIREBASE-ADMIN] Firebase Admin initialization failed:', error.message);
    console.error('❌ [FIREBASE-ADMIN] Error stack:', error.stack);
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
  console.log('🔍 [VERIFY-TOKEN] Starting token verification...');
  
  const authHeader = req.headers.authorization;
  
  console.log('🔍 [VERIFY-TOKEN] Authorization header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'MISSING');
  
  // Check if Authorization header exists
  if (!authHeader) {
    console.log('❌ [VERIFY-TOKEN] Missing authorization header');
    throw new Error('Missing authorization header');
  }
  
  // Check if it's a Bearer token
  if (!authHeader.startsWith('Bearer ')) {
    console.log('❌ [VERIFY-TOKEN] Invalid authorization format');
    throw new Error('Invalid authorization format. Expected: Bearer <token>');
  }
  
  // Extract the token
  const token = authHeader.split('Bearer ')[1];
  
  console.log('🔍 [VERIFY-TOKEN] Token extracted, length:', token?.length);
  
  if (!token || token.trim() === '') {
    console.log('❌ [VERIFY-TOKEN] Empty authorization token');
    throw new Error('Empty authorization token');
  }
  
  // Initialize Firebase Admin if not already done
  console.log('🔥 [VERIFY-TOKEN] Initializing Firebase Admin...');
  const auth = initializeFirebaseAdmin();
  
  if (!auth) {
    console.log('❌ [VERIFY-TOKEN] Firebase Admin initialization failed');
    throw new Error('Firebase Admin is not configured. Check server logs.');
  }
  
  console.log('✅ [VERIFY-TOKEN] Firebase Admin ready');
  
  try {
    console.log('🔍 [VERIFY-TOKEN] Verifying ID token with Firebase...');
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(token);
    
    console.log(`✅ [VERIFY-TOKEN] Token verified successfully: ${decodedToken.uid} (${decodedToken.email})`);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      isAdmin: decodedToken.admin === true, // Custom claim
      authTime: decodedToken.auth_time,
      iat: decodedToken.iat,
      exp: decodedToken.exp,
    };
  } catch (error) {
    console.error('❌ [VERIFY-TOKEN] Token verification failed:', error.message);
    console.error('❌ [VERIFY-TOKEN] Error code:', error.code);
    console.error('❌ [VERIFY-TOKEN] Error stack:', error.stack);
    
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
    console.log('🔐 [AUTH] requireAuth middleware invoked');
    console.log('🔐 [AUTH] Request method:', req.method);
    console.log('🔐 [AUTH] Request URL:', req.url);
    console.log('🔐 [AUTH] Authorization header exists:', !!req.headers.authorization);
    
    try {
      // 🔐 Configure CORS first
      console.log('🌐 [AUTH] Configuring CORS...');
      const optionsHandled = configureCors(req, res);
      if (optionsHandled) {
        console.log('✅ [AUTH] OPTIONS request handled by CORS');
        return; // OPTIONS request handled
      }

      console.log('🔍 [AUTH] Verifying authentication token...');
      // Verify authentication token
      const user = await verifyAuthToken(req);
      
      console.log('✅ [AUTH] User authenticated successfully:', {
        uid: user.uid,
        email: user.email,
        isAdmin: user.isAdmin
      });
      
      // Check admin requirement
      if (options.requireAdmin && !user.isAdmin) {
        console.log('❌ [AUTH] Admin required but user is not admin');
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Admin privileges required for this operation'
        });
      }
      
      // Attach user to request object
      req.user = user;
      
      console.log('✅ [AUTH] Calling handler...');
      // Call the original handler
      return await handler(req, res);
      
    } catch (error) {
      console.error('❌ [AUTH] Authentication error:', error.message);
      console.error('❌ [AUTH] Error stack:', error.stack);
      console.error('❌ [AUTH] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      // Return appropriate HTTP status
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: error.message,
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
