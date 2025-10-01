/**
 * API Service
 * Centralized HTTP client for all API requests with authentication, error handling, and retry logic
 */

import { authenticatedFetch } from '@/utils/authToken';
import { 
  API_CONFIG, 
  ERROR_MESSAGES, 
  HTTP_STATUS 
} from '@/constants/api';
import type { ApiResponse, ApiError } from '@/types/api';

// ============================================================================
// Types
// ============================================================================

interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  requireAuth?: boolean;
}

// ============================================================================
// API Service Class
// ============================================================================

class ApiService {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetries: number;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.defaultTimeout = API_CONFIG.TIMEOUT;
    this.defaultRetries = API_CONFIG.RETRY_ATTEMPTS;
  }

  /**
   * Make an authenticated or unauthenticated HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      requireAuth = true,
      ...fetchOptions
    } = options;

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...fetchOptions.headers,
    };

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        let response: Response;

        if (requireAuth) {
          // Use authenticated fetch for protected endpoints
          response = await authenticatedFetch(url, {
            ...fetchOptions,
            headers,
            signal: controller.signal,
          });
        } else {
          // Use regular fetch for public endpoints
          response = await fetch(url, {
            ...fetchOptions,
            headers,
            signal: controller.signal,
          });
        }

        clearTimeout(timeoutId);

        // Handle response
        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (
          error instanceof Error &&
          (error.name === 'AbortError' || 
           error.message.includes('401') ||
           error.message.includes('403'))
        ) {
          break;
        }

        // Wait before retrying
        if (attempt < retries) {
          await this.delay(API_CONFIG.RETRY_DELAY * (attempt + 1));
        }
      }
    }

    // All retries failed
    throw this.createError(
      lastError?.message || ERROR_MESSAGES.NETWORK.REQUEST_FAILED,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let data: any;

    try {
      data = await response.json();
    } catch {
      // Response is not JSON
      data = null;
    }

    if (!response.ok) {
      // Handle error responses
      const errorMessage = data?.error || data?.message || this.getDefaultErrorMessage(response.status);
      throw this.createError(errorMessage, response.status);
    }

    // Handle success responses
    return {
      success: true,
      data: data?.data || data,
      message: data?.message,
    };
  }

  /**
   * Create standardized error object
   */
  private createError(message: string, statusCode: number): ApiError {
    return {
      success: false,
      error: message,
      statusCode,
    };
  }

  /**
   * Get default error message based on status code
   */
  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.AUTH.NOT_AUTHENTICATED;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_MESSAGES.AUTH.UNAUTHORIZED;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return 'Too many requests. Please try again later';
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_MESSAGES.NETWORK.SERVER_ERROR;
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return ERROR_MESSAGES.NETWORK.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.GENERIC.SOMETHING_WENT_WRONG;
    }
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // Public HTTP Methods
  // ============================================================================

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const apiService = new ApiService();

// Export class for testing
export default ApiService;
