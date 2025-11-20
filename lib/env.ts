/**
 * Environment variable validation and configuration
 * Validates required environment variables at build time
 */

const requiredEnvVars = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
} as const;

// Validate required environment variables
// Only validate in production builds to allow development flexibility
if (process.env.NODE_ENV === "production") {
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      throw new Error(
        `Missing required environment variable: ${key}. Please set it in your .env.local file.`
      );
    }
  });
}

// Export validated environment variables with fallback for development
export const env = {
  NEXT_PUBLIC_API_URL:
    requiredEnvVars.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
} as const;

// Type-safe environment variable access
export type Env = typeof env;
