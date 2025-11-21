/**
 * Authentication Slice
 *
 * Redux slice managing authentication state and async operations.
 * Handles signup, signin, signout, token refresh, and user profile fetching.
 *
 * @module features/auth/authSlice
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  signUp,
  signIn,
  signOut,
  refreshToken,
  getCurrentUser,
  SignUpRequest,
  SignInRequest,
  SignUpResponse,
  SignInResponse,
  User,
  ApiError,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "@/services/authService";
import { storage } from "@/lib/storage";

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Sign up a new user
 *
 * Creates a new user account and sets authentication cookies.
 * User data is persisted to localStorage for quick access.
 */
export const signUpAsync = createAsyncThunk<
  SignUpResponse,
  SignUpRequest,
  { rejectValue: ApiError }
>("authentication/signUp", async (credentials, { rejectWithValue }) => {
  try {
    const response = await signUp(credentials);
    return response;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

/**
 * Sign in an existing user
 *
 * Authenticates a user and sets authentication cookies.
 * User data is persisted to localStorage for quick access.
 */
export const signInAsync = createAsyncThunk<
  SignInResponse,
  SignInRequest,
  { rejectValue: ApiError }
>("authentication/signIn", async (credentials, { rejectWithValue }) => {
  try {
    const response = await signIn(credentials);
    return response;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

/**
 * Sign out the current user
 *
 * Clears authentication cookies on the backend and removes user data from localStorage.
 */
export const signOutAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: ApiError }
>("authentication/signOut", async (_, { rejectWithValue }) => {
  try {
    await signOut();
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

/**
 * Refresh authentication tokens
 *
 * Refreshes the access_token and refresh_token stored in cookies.
 * This is typically called automatically by the API client on 401 errors.
 */
export const refreshTokenAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: ApiError }
>("authentication/refreshToken", async (_, { rejectWithValue }) => {
  try {
    await refreshToken();
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

/**
 * Get current user profile
 *
 * Retrieves the authenticated user's profile information.
 * Used to verify authentication status and get updated user data.
 */
export const getCurrentUserAsync = createAsyncThunk<
  User,
  void,
  { rejectValue: ApiError }
>("authentication/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const response = await getCurrentUser();
    return response.data;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const forgetPasswordAsync = createAsyncThunk<
  string, // Return the success message
  string,
  { rejectValue: ApiError }
>("authentication/forgetPassword", async (email, { rejectWithValue }) => {
  try {
    const response = await forgotPassword(email);
    return response.message;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const verifyOtpAsync = createAsyncThunk<
  string, // Return reset_token
  { email: string; otp: string },
  { rejectValue: ApiError }
>("authentication/verifyOtp", async ({ email, otp }, { rejectWithValue }) => {
  try {
    const response = await verifyOtp(email, otp);
    return response.data.reset_token;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const resetPasswordAsync = createAsyncThunk<
  string, // Return success message
  { resetToken: string; newPassword: string },
  { rejectValue: ApiError }
>(
  "authentication/resetPassword",
  async ({ resetToken, newPassword }, { rejectWithValue }) => {
    try {
      const response = await resetPassword(resetToken, newPassword);
      return response.message;
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);
// ============================================================================
// State Interface
// ============================================================================

/**
 * Authentication state structure
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isVerifying: boolean; // True when verifying auth status on app load
  error: string | null;
  resetEmail: string | null; // Email used for password reset flow
  resetToken: string | null; // Reset token from OTP verification
}

// ============================================================================
// Initial State
// ============================================================================

/**
 * Initialize state from localStorage if available
 *
 * Restores user data from localStorage for quick access.
 * Authentication is verified via cookies on each API request.
 *
 * @returns Initial auth state
 */
const getInitialState = (): AuthState => {
  if (typeof window === "undefined") {
    // check if server side
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isVerifying: true, // Start as verifying on server
      error: null,
      resetEmail: null,
      resetToken: null,
    };
  }

  // Restore user data from localStorage
  const userStr = storage.getItem("user");

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return {
        user,
        isAuthenticated: true, // Assume authenticated if user data exists
        isLoading: false,
        isVerifying: true, // Will verify on mount
        error: null,
        resetEmail: null,
        resetToken: null,
      };
    } catch {
      // If parsing fails, clear invalid data
      storage.removeItem("user");
    }
  }

  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isVerifying: true, // Will verify on mount
    error: null,
    resetEmail: null,
    resetToken: null,
  };
};

const initialState: AuthState = getInitialState();

// ============================================================================
// Slice Definition
// ============================================================================

const authSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    /**
     * Clear authentication error
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Set authentication state manually
     * Useful for restoring auth state after page refresh
     */
    setAuth: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isVerifying = false;
      if (typeof window !== "undefined") {
        storage.setItem("user", JSON.stringify(action.payload.user));
      }
    },

    /**
     * Clear authentication state
     * Used when authentication verification fails
     */
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isVerifying = false;
      if (typeof window !== "undefined") {
        storage.removeItem("user");
      }
    },

    /**
     * Set reset email for password reset flow
     */
    setResetEmail: (state, action: PayloadAction<string>) => {
      state.resetEmail = action.payload;
    },

    /**
     * Clear reset email and token
     */
    clearResetData: (state) => {
      state.resetEmail = null;
      state.resetToken = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign Up
      .addCase(signUpAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUpAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.isVerifying = false;
        state.error = null;

        // Persist user data to localStorage
        if (typeof window !== "undefined") {
          storage.setItem("user", JSON.stringify(action.payload.data));
        }
      })
      .addCase(signUpAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Signup failed";
        state.isAuthenticated = false;
        state.isVerifying = false;
      })

      // Sign In
      .addCase(signInAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.isVerifying = false;
        state.error = null;

        // Persist user data to localStorage
        if (typeof window !== "undefined") {
          storage.setItem("user", JSON.stringify(action.payload.data));
        }
      })
      .addCase(signInAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Signin failed";
        state.isAuthenticated = false;
        state.isVerifying = false;
      })

      // Sign Out
      .addCase(signOutAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOutAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isVerifying = false;
        state.error = null;

        // Clear user data from localStorage
        // Cookies are cleared by the backend
        if (typeof window !== "undefined") {
          storage.removeItem("user");
        }
      })
      .addCase(signOutAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Signout failed";
        // Still clear local state even if backend call fails
        state.user = null;
        state.isAuthenticated = false;
        if (typeof window !== "undefined") {
          storage.removeItem("user");
        }
      })

      // Refresh Token
      .addCase(refreshTokenAsync.pending, (state) => {
        // Don't set loading state for background token refresh
      })
      .addCase(refreshTokenAsync.fulfilled, (state) => {
        // Token refresh successful, no state change needed
        // Cookies are updated automatically
      })
      .addCase(refreshTokenAsync.rejected, (state) => {
        // Token refresh failed, clear auth state
        state.user = null;
        state.isAuthenticated = false;
        if (typeof window !== "undefined") {
          storage.removeItem("user");
        }
      })

      // Get Current User (Verify Auth)
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.isVerifying = true;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.isVerifying = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;

        // Update user data in localStorage
        if (typeof window !== "undefined") {
          storage.setItem("user", JSON.stringify(action.payload));
        }
      })
      .addCase(getCurrentUserAsync.rejected, (state, action) => {
        state.isVerifying = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || "Authentication failed";

        // Clear invalid user data
        if (typeof window !== "undefined") {
          storage.removeItem("user");
        }
      })

      // Forgot Password
      .addCase(forgetPasswordAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgetPasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        // Success message is returned in action.payload, but we don't store it
      })
      .addCase(forgetPasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to send OTP";
      })

      // Verify OTP
      .addCase(verifyOtpAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtpAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resetToken = action.payload; // Store reset_token
        state.error = null;
      })
      .addCase(verifyOtpAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "OTP verification failed";
      })

      // Reset Password
      .addCase(resetPasswordAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        // Clear reset data after successful password reset
        state.resetEmail = null;
        state.resetToken = null;
      })
      .addCase(resetPasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Password reset failed";
      });
  },
});

export const { clearError, setAuth, clearAuth, setResetEmail, clearResetData } =
  authSlice.actions;
export default authSlice.reducer;
