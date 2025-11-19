/**
 * API Client Utility
 *
 * Provides a centralized API client with automatic token refresh on 401 errors.
 * All requests automatically include cookies for authentication.
 *
 * @module services/apiClient
 */

import { refreshToken } from "./authService";
import { ApiError } from "./authService";

/**
 * API Base URL
 *
 * In development, we use Next.js rewrites to proxy requests through the same origin,
 * which ensures cookies are properly handled. In production, use the full backend URL.
 *
 * For development: Use relative URLs (empty string) to leverage Next.js rewrites
 * For production: Use full backend URL from environment variable
 */
const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
    : ""; // Use relative URLs in development to leverage Next.js rewrites

// Track if a token refresh is in progress to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

/**
 * Queue of failed requests that should be retried after token refresh
 */
const failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
  retry: () => Promise<any>;
}> = [];

/**
 * Process queued requests after successful token refresh
 */
const processQueue = (error: ApiError | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(promise.retry());
    }
  });
  failedQueue.length = 0;
};

/**
 * Attempts to refresh the authentication token
 *
 * @returns Promise that resolves when token refresh is complete
 */
const attemptTokenRefresh = async (): Promise<void> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      await refreshToken();
      processQueue(null);
    } catch (error) {
      processQueue(error as ApiError);
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Makes an authenticated API request with automatic token refresh on 401 errors
 *
 * If a 401 error is encountered, the function will:
 * 1. Attempt to refresh the token
 * 2. Retry the original request with the new token
 * 3. If refresh fails, reject with the original error
 *
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options (method, body, headers, etc.)
 * @param retryOn401 - Whether to retry on 401 errors (default: true)
 * @returns Promise with parsed JSON response
 * @throws ApiError if request fails after retry
 *
 * @example
 * ```typescript
 * // GET request
 * const data = await apiClient("/api/users", { method: "GET" });
 *
 * // POST request
 * const result = await apiClient("/api/tasks", {
 *   method: "POST",
 *   body: JSON.stringify({ title: "New Task" })
 * });
 * ```
 */
export const apiClient = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  retryOn401: boolean = true
): Promise<T> => {
  const url = `${API_URL}${endpoint}`;

  const makeRequest = async (): Promise<T> => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Always include cookies for authentication
    });

    const data = await response.json();

    // Handle 401 Unauthorized - token expired
    if (response.status === 401 && retryOn401) {
      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
            retry: makeRequest,
          });
        });
      }

      // Attempt to refresh token
      try {
        await attemptTokenRefresh();
        // Retry the original request after successful refresh
        return makeRequest();
      } catch (refreshError) {
        // Refresh failed, throw original error
        const error: ApiError = {
          message: data.message || "Authentication failed",
          errors: data.errors,
        };
        throw error;
      }
    }

    // Handle other errors
    if (!response.ok) {
      const error: ApiError = {
        message: data.message || "Request failed",
        errors: data.errors,
      };
      throw error;
    }

    return data;
  };

  return makeRequest();
};

/**
 * Re-export auth service functions for convenience
 */
export {
  signUp,
  signIn,
  signOut,
  refreshToken,
  getCurrentUser,
} from "./authService";
export type {
  SignUpRequest,
  SignInRequest,
  User,
  ApiResponse,
  SignUpResponse,
  SignInResponse,
  RefreshTokenResponse,
  ApiError,
} from "./authService";
