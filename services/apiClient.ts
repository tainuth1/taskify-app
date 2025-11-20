/**
 * API Client Utility
 *
 * Provides a centralized API client with automatic token refresh on 401 errors.
 * All requests automatically include cookies for authentication.
 *
 * @module services/apiClient
 */

import { refreshToken, ApiError } from "./authService";

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
    : "";

// Track token refresh to prevent multiple simultaneous refresh attempts
let refreshPromise: Promise<void> | null = null;

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
      credentials: "include",
    });

    const data = await response.json();

    // Handle 401 Unauthorized - token expired
    if (response.status === 401 && retryOn401) {
      // If refresh is in progress, wait for it and retry
      if (refreshPromise) {
        await refreshPromise;
        return makeRequest();
      }

      // Start token refresh (shared promise for concurrent requests)
      refreshPromise = refreshToken()
        .then(() => {})
        .finally(() => {
          refreshPromise = null;
        });

      try {
        await refreshPromise;
        return makeRequest();
      } catch {
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
