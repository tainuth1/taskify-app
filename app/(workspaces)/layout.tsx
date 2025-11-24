"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { getCurrentUserAsync } from "@/features/auth/authSlice";
import { Sidebar } from "@/components/layouts/sidebar";

/**
 * Protected Layout for Workspaces
 *
 * Verifies authentication status on mount and redirects unauthenticated users to login.
 * Uses the /api/auth/me endpoint to verify authentication via cookies.
 *
 * Flow:
 * 1. On mount, checks if user data exists in localStorage
 * 2. If exists, verifies authentication by calling /api/auth/me
 * 3. If verification fails or no user data, redirects to login
 * 4. Shows loading state during verification
 */
export default function WorkspacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isVerifying, isLoading } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    /**
     * Verify authentication status on mount
     * This ensures that even if localStorage has user data,
     * we verify the cookies are still valid
     */
    const verifyAuth = async () => {
      try {
        await dispatch(getCurrentUserAsync()).unwrap();
      } catch (error) {
        // Authentication failed, redirect to login
        router.push("/login");
      }
    };

    // Only verify if we haven't verified yet and we're not already loading
    if (isVerifying && !isLoading) {
      verifyAuth();
    }
  }, [dispatch, router, isVerifying, isLoading]);

  useEffect(() => {
    /**
     * Redirect to login if not authenticated and verification is complete
     */
    if (!isVerifying && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isVerifying, isLoading, router]);

  // Show loading state while verifying authentication
  if (isVerifying || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 pl-72">{children}</div>
    </div>
  );
}
