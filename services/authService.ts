/**
 * Authentication Service
 *
 * Handles all authentication-related API calls.
 * All authentication tokens (access_token and refresh_token) are stored in HTTP-only cookies
 * by the backend, providing enhanced security.
 *
 * Uses apiClient for all requests except refreshToken (to avoid circular dependency).
 *
 * @module services/authService
 */

import { apiClient } from "./apiClient";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Sign up request payload
 */
export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Sign in request payload
 */
export interface SignInRequest {
  email: string;
  password: string;
}

/**
 * User data structure returned by the API
 */
export interface User {
  email: string;
  username: string;
  id: string;
  full_name: string | null;
  profile: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * Standard API response structure
 */
export interface ApiResponse<T = User> {
  success: boolean;
  message: string;
  data: T;
  token_type?: string;
}

/**
 * Sign up response structure
 */
export interface SignUpResponse extends ApiResponse<User> {
  token_type: string;
}

/**
 * Sign in response structure
 */
export interface SignInResponse extends ApiResponse<User> {
  token_type: string;
}

/**
 * Refresh token response structure
 */
export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    token_type: string;
  };
}

/**
 * API error structure
 */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// Authentication Endpoints
// ============================================================================

/**
 * Sign up a new user
 *
 * Creates a new user account and sets authentication cookies.
 *
 * @param credentials - User signup credentials
 * @returns Promise with signup response containing user data
 * @throws ApiError if signup fails
 *
 * @example
 * ```typescript
 * const response = await signUp({
 *   name: "johndoe",
 *   email: "john@example.com",
 *   password: "SecurePass123"
 * });
 * ```
 */
export const signUp = async (
  credentials: SignUpRequest
): Promise<SignUpResponse> => {
  return await apiClient<SignUpResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      username: credentials.name,
      email: credentials.email,
      password: credentials.password,
    }),
  });
};

/**
 * Sign in an existing user
 *
 * Authenticates a user and sets authentication cookies (access_token and refresh_token).
 *
 * @param credentials - User signin credentials
 * @returns Promise with signin response containing user data
 * @throws ApiError if signin fails
 *
 * @example
 * ```typescript
 * const response = await signIn({
 *   email: "john@example.com",
 *   password: "SecurePass123"
 * });
 * ```
 */
export const signIn = async (
  credentials: SignInRequest
): Promise<SignInResponse> => {
  return await apiClient<SignInResponse>("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });
};

/**
 * Sign out the current user
 *
 * Clears authentication cookies on the backend.
 *
 * @returns Promise with signout response
 * @throws ApiError if signout fails
 *
 * @example
 * ```typescript
 * await signOut();
 * ```
 */
export const signOut = async (): Promise<ApiResponse> => {
  return await apiClient<ApiResponse>("/api/auth/signout", {
    method: "POST",
  });
};

/**
 * Refresh authentication tokens
 *
 * Refreshes the access_token and refresh_token stored in cookies.
 * This is typically called automatically when a 401 error is encountered.
 *
 * Note: Uses apiClient with retryOn401: false to avoid circular dependency
 * (since apiClient calls this function on 401 errors).
 *
 * @returns Promise with refresh token response
 * @throws ApiError if refresh fails
 *
 * @example
 * ```typescript
 * const response = await refreshToken();
 * ```
 */
export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  // Use apiClient but disable retry to avoid infinite loop
  // (apiClient calls refreshToken on 401, so we don't want refreshToken to retry)
  return await apiClient<RefreshTokenResponse>(
    "/api/auth/refresh",
    {
      method: "POST",
    },
    false // retryOn401: false - don't retry refresh token calls
  );
};

/**
 * Get current user profile
 *
 * Retrieves the authenticated user's profile information.
 * This endpoint verifies authentication via cookies.
 *
 * @returns Promise with user profile data
 * @throws ApiError if request fails or user is not authenticated
 *
 * @example
 * ```typescript
 * const user = await getCurrentUser();
 * console.log(user.data.email);
 * ```
 */
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  return await apiClient<ApiResponse<User>>("/api/auth/me", {
    method: "GET",
  });
};
