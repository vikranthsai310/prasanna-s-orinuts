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
    throw new Error('User not authenticated. Please log in.');
  }

  try {
    const token = await currentUser.getIdToken(forceRefresh);
    logger.debug('✅ Firebase ID token retrieved successfully');
    return token;
  } catch (error) {
    logger.error('❌ Failed to get Firebase ID token:', error);
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
    const headers = await getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    // Handle authentication errors
    if (response.status === 401) {
      logger.warn('⚠️ Authentication failed, trying with refreshed token...');
      
      // Try once more with a fresh token
      const freshHeaders = await getAuthHeaders();
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          ...freshHeaders,
          ...(options.headers || {}),
        },
      });

      if (retryResponse.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }

      return retryResponse;
    }

    return response;
  } catch (error) {
    logger.error('❌ Authenticated fetch failed:', error);
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
