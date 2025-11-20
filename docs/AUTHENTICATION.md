# Authentication Flow Documentation

This document explains how authentication works in the Taskify application, including signup, signin, signout, token refresh, and protected routes.

## Overview

The application uses **cookie-based authentication** where all authentication tokens (access_token and refresh_token) are stored in HTTP-only cookies by the backend. This provides enhanced security as tokens are not accessible via JavaScript, preventing XSS attacks.

## Architecture

### Components

1. **Auth Service** (`services/authService.ts`)

   - Handles all authentication API calls
   - Provides functions for signup, signin, signout, refresh, and getting current user

2. **API Client** (`services/apiClient.ts`)

   - Centralized API client with automatic token refresh
   - Intercepts 401 errors and automatically refreshes tokens
   - Queues failed requests and retries them after token refresh

3. **Auth Slice** (`features/auth/authSlice.ts`)

   - Redux slice managing authentication state
   - Handles async operations and state persistence
   - Stores user data in localStorage for quick access

4. **Protected Layout** (`app/(workspaces)/layout.tsx`)
   - Verifies authentication on mount
   - Redirects unauthenticated users to login

## Authentication Flows

### 1. Sign Up Flow

```
User fills signup form
    ↓
Form validation (client-side)
    ↓
POST /api/auth/signup
    ↓
Backend creates user account
    ↓
Backend sets access_token & refresh_token cookies
    ↓
Response with user data
    ↓
Redux stores user data in state & localStorage
    ↓
Redirect to /workspace
```

**Code Example:**

```typescript
import { signUpAsync } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/store";

const dispatch = useAppDispatch();

const handleSignup = async () => {
  const result = await dispatch(
    signUpAsync({
      name: "johndoe",
      email: "john@example.com",
      password: "SecurePass123",
    })
  );

  if (signUpAsync.fulfilled.match(result)) {
    // Success - user is authenticated
    router.push("/workspace");
  }
};
```

### 2. Sign In Flow

```
User fills signin form
    ↓
POST /api/auth/signin
    ↓
Backend validates credentials
    ↓
Backend sets access_token & refresh_token cookies
    ↓
Response with user data
    ↓
Redux stores user data in state & localStorage
    ↓
Redirect to /workspace
```

**Code Example:**

```typescript
import { signInAsync } from "@/features/auth/authSlice";

const handleSignin = async () => {
  const result = await dispatch(
    signInAsync({
      email: "john@example.com",
      password: "SecurePass123",
    })
  );

  if (signInAsync.fulfilled.match(result)) {
    // Success - user is authenticated
    router.push("/workspace");
  }
};
```

### 3. Protected Route Access Flow

```
User navigates to /workspace
    ↓
Protected Layout mounts
    ↓
Check localStorage for user data
    ↓
If user data exists:
    ↓
    Call GET /api/auth/me (verify cookies)
    ↓
    If successful:
        ↓
        Update Redux state with user data
        ↓
        Render protected content
    ↓
    If failed (401):
        ↓
        Clear localStorage
        ↓
        Redirect to /login
    ↓
If no user data:
    ↓
    Redirect to /login
```

**Key Points:**

- Authentication is verified on every protected route access
- Cookies are automatically included in all requests
- If cookies are invalid/expired, user is redirected to login

### 4. Automatic Token Refresh Flow

```
API request made
    ↓
Response: 401 Unauthorized
    ↓
API Client intercepts 401
    ↓
Check if refresh is already in progress
    ↓
If not refreshing:
    ↓
    POST /api/auth/refresh
    ↓
    Backend validates refresh_token cookie
    ↓
    Backend sets new access_token & refresh_token cookies
    ↓
    Retry original request
    ↓
    Return response
    ↓
If already refreshing:
    ↓
    Queue request
    ↓
    Wait for refresh to complete
    ↓
    Retry queued requests
```

**Key Points:**

- Token refresh happens automatically in the background
- Multiple simultaneous requests are queued and retried after refresh
- User doesn't notice the refresh happening
- If refresh fails, user is logged out

**Code Example:**

```typescript
import { apiClient } from "@/services/apiClient";

// This request will automatically refresh tokens if needed
const data = await apiClient("/api/tasks", {
  method: "GET",
});
```

### 5. Sign Out Flow

```
User clicks signout button
    ↓
POST /api/auth/signout
    ↓
Backend clears authentication cookies
    ↓
Redux clears user data from state
    ↓
Clear localStorage
    ↓
Redirect to /login
```

**Code Example:**

```typescript
import { signOutAsync } from "@/features/auth/authSlice";

const handleSignout = async () => {
  await dispatch(signOutAsync());
  router.push("/login");
};
```

### 6. Page Refresh Flow

```
User refreshes page
    ↓
App initializes
    ↓
Redux restores user data from localStorage
    ↓
Protected Layout mounts
    ↓
Call GET /api/auth/me (verify cookies)
    ↓
If successful:
    ↓
    Update Redux state with fresh user data
    ↓
    Render protected content
    ↓
If failed:
    ↓
    Clear localStorage
    ↓
    Redirect to /login
```

**Key Points:**

- User data persists across page refreshes via localStorage
- Authentication is always verified via cookies on app load
- If cookies are expired/invalid, user is logged out

## API Endpoints

### Sign Up

- **Endpoint:** `POST /api/auth/signup`
- **Request Body:**
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Registered successfully",
    "data": {
      /* User object */
    },
    "token_type": "bearer"
  }
  ```
- **Cookies Set:** `access_token`, `refresh_token`

### Sign In

- **Endpoint:** `POST /api/auth/signin`
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Signin successfully.",
    "data": {
      /* User object */
    },
    "token_type": "bearer"
  }
  ```
- **Cookies Set:** `access_token`, `refresh_token`

### Sign Out

- **Endpoint:** `POST /api/auth/signout`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Signed out"
  }
  ```
- **Cookies Cleared:** `access_token`, `refresh_token`

### Refresh Token

- **Endpoint:** `POST /api/auth/refresh`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Refresh token successfully",
    "data": {
      "token_type": "bearer"
    }
  }
  ```
- **Cookies Updated:** `access_token`, `refresh_token`

### Get Current User

- **Endpoint:** `GET /api/auth/me`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Get profile is successfully",
    "data": {
      /* User object */
    }
  }
  ```
- **Authentication:** Required (via cookies)

## State Management

### Redux State Structure

```typescript
interface AuthState {
  user: User | null; // Current user data
  isAuthenticated: boolean; // Authentication status
  isLoading: boolean; // Loading state for auth operations
  isVerifying: boolean; // Verifying auth on app load
  error: string | null; // Error message
}
```

### Actions

- `signUpAsync(credentials)` - Sign up new user
- `signInAsync(credentials)` - Sign in existing user
- `signOutAsync()` - Sign out current user
- `refreshTokenAsync()` - Refresh authentication tokens
- `getCurrentUserAsync()` - Get current user profile
- `clearError()` - Clear error message
- `setAuth({ user })` - Manually set auth state
- `clearAuth()` - Clear auth state

## Security Considerations

1. **HTTP-Only Cookies**

   - Tokens are stored in HTTP-only cookies, preventing JavaScript access
   - Reduces risk of XSS attacks

2. **Automatic Token Refresh**

   - Tokens are refreshed automatically before expiration
   - User experience is seamless

3. **Authentication Verification**

   - Authentication is verified on every protected route access
   - Prevents stale authentication state

4. **Secure Cookie Settings**
   - Cookies should be set with `Secure` and `SameSite` attributes
   - Backend should configure these settings appropriately

## Usage Examples

### Using Auth Actions in Components

```typescript
"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { signInAsync, signOutAsync } from "@/features/auth/authSlice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const handleSignin = async (email: string, password: string) => {
    const result = await dispatch(signInAsync({ email, password }));

    if (signInAsync.fulfilled.match(result)) {
      // Success
      router.push("/workspace");
    } else {
      // Error is in state.error
      console.error(error);
    }
  };

  return (
    // Your form component
  );
}
```

### Making Authenticated API Requests

```typescript
import { apiClient } from "@/services/apiClient";

// GET request
const tasks = await apiClient("/api/tasks", {
  method: "GET",
});

// POST request
const newTask = await apiClient("/api/tasks", {
  method: "POST",
  body: JSON.stringify({ title: "New Task" }),
});

// PUT request
const updatedTask = await apiClient(`/api/tasks/${id}`, {
  method: "PUT",
  body: JSON.stringify({ title: "Updated Task" }),
});

// DELETE request
await apiClient(`/api/tasks/${id}`, {
  method: "DELETE",
});
```

## Error Handling

All authentication operations can fail. Always check the result:

```typescript
const result = await dispatch(signInAsync(credentials));

if (signInAsync.fulfilled.match(result)) {
  // Success
} else {
  // Error - check state.error or result.payload
  const error = result.payload?.message || "Signin failed";
}
```

## Best Practices

1. **Always verify authentication** on protected routes
2. **Use the API client** for all authenticated requests
3. **Handle errors gracefully** and show user-friendly messages
4. **Clear state on logout** to prevent stale data
5. **Verify auth on app load** to ensure cookies are still valid

## Troubleshooting

### User gets logged out unexpectedly

- Check if cookies are being cleared by browser settings
- Verify backend cookie settings (Secure, SameSite, HttpOnly)
- Check if refresh token endpoint is working

### Token refresh fails

- Verify refresh_token cookie is present
- Check backend refresh token validation logic
- Ensure cookies are being sent with requests (`credentials: "include"`)

### Authentication not persisting

- Check localStorage for user data
- Verify cookies are being set by backend
- Check browser console for errors
