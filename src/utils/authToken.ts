/**
 * Authentication Token Utilities
 * Helper functions for managing Firebase ID tokens in API calls
 */

import { auth } from '@/lib/firebase';
import { logger } from './logger';

/**
 * Get the current user's Firebase ID token
 * @param forceRefresh - Whether to force token refresh (default: false)
 * @returns Promise<string> - The ID token
 * @throws Error if user is not authenticated
 */
export async function getAuthToken(forceRefresh: boolean = false): Promise<string> {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    logger.error('❌ Firebase currentUser is null - user not authenticated');
    logger.error('❌ Auth state:', { 
      currentUser: null, 
      authInitialized: !!auth,
      timestamp: new Date().toISOString()
    });
    throw new Error('User not authenticated. Please log in.');
  }

  try {
    logger.debug('🔑 Requesting Firebase ID token...', { 
      uid: currentUser.uid,
      email: currentUser.email,
      forceRefresh 
    });
    
    const token = await currentUser.getIdToken(forceRefresh);
    
    if (!token || token.trim() === '') {
      logger.error('❌ Firebase returned empty token');
      throw new Error('Received empty authentication token');
    }
    
    logger.debug('✅ Firebase ID token retrieved successfully', {
      tokenLength: token.length,
      uid: currentUser.uid
    });
    return token;
  } catch (error: any) {
    logger.error('❌ Failed to get Firebase ID token:', {
      error: error.message,
      code: error.code,
      uid: currentUser?.uid,
      email: currentUser?.email
    });
    
    // Provide more specific error messages
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.code === 'auth/user-token-expired') {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw new Error('Failed to retrieve authentication token. Please try again.');
  }
}

/**
 * Get authorization headers with Bearer token
 * @param additionalHeaders - Any additional headers to include
 * @returns Promise<HeadersInit> - Headers object with Authorization
 */
export async function getAuthHeaders(additionalHeaders: Record<string, string> = {}): Promise<HeadersInit> {
  try {
    const token = await getAuthToken();
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...additionalHeaders,
    };
  } catch (error) {
    logger.error('❌ Failed to create auth headers:', error);
    throw error;
  }
}

/**
 * Make an authenticated API call
 * Automatically includes Firebase ID token in Authorization header
 * 
 * @param url - API endpoint URL
 * @param options - Fetch options (method, body, etc.)
 * @returns Promise<Response> - Fetch response
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  try {
    logger.debug('🌐 Making authenticated request to:', url);
    
    const headers = await getAuthHeaders();
    
    logger.debug('📤 Request headers prepared:', {
      url,
      method: options.method || 'GET',
      hasAuth: !!headers['Authorization']
    });
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    logger.debug('📥 Response received:', {
      url,
      status: response.status,
      statusText: response.statusText
    });

    // Handle authentication errors
    if (response.status === 401) {
      logger.warn('⚠️ 401 Unauthorized - Authentication failed, trying with refreshed token...');
      
      // Try once more with a fresh token (force refresh)
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          logger.error('❌ User is no longer authenticated');
          throw new Error('User session expired. Please log in again.');
        }
        
        // Force token refresh
        await currentUser.getIdToken(true);
        logger.debug('🔄 Token refreshed, retrying request...');
        
        const freshHeaders = await getAuthHeaders();
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...freshHeaders,
            ...(options.headers || {}),
          },
        });

        logger.debug('📥 Retry response received:', {
          url,
          status: retryResponse.status,
          statusText: retryResponse.statusText
        });

        if (retryResponse.status === 401) {
          logger.error('❌ Authentication failed even after token refresh');
          throw new Error('Authentication failed. Please log in again.');
        }

        return retryResponse;
      } catch (refreshError: any) {
        logger.error('❌ Token refresh failed:', refreshError);
        throw new Error('Authentication failed. Please log in again.');
      }
    }

    return response;
  } catch (error: any) {
    logger.error('❌ Authenticated fetch failed:', {
      url,
      error: error.message,
      code: error.code
    });
    throw error;
  }
}

/**
 * Check if user is currently authenticated
 * @returns boolean
 */
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}

/**
 * Wait for authentication state to be ready
 * Useful for ensuring user is loaded before making API calls
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 * @returns Promise<boolean> - True if authenticated, false if not
 */
export function waitForAuth(timeout: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    // If already authenticated, resolve immediately
    if (auth.currentUser) {
      resolve(true);
      return;
    }

    // Set up timeout
    const timeoutId = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeout);

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      clearTimeout(timeoutId);
      unsubscribe();
      resolve(user !== null);
    });
  });
}

/**
 * Refresh the user's ID token
 * Call this if you get a 401 error
 * @returns Promise<string> - New token
 */
export async function refreshAuthToken(): Promise<string> {
  logger.debug('🔄 Refreshing authentication token...');
  return getAuthToken(true);
}

export default {
  getAuthToken,
  getAuthHeaders,
  authenticatedFetch,
  isAuthenticated,
  waitForAuth,
  refreshAuthToken,
};
