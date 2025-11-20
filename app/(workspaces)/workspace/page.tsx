"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { signOutAsync } from "@/features/auth/authSlice";
import { LogOut, Loader2 } from "lucide-react";

/**
 * Workspace Page
 *
 * Main workspace page for authenticated users.
 * Includes a signout button for testing logout functionality.
 */
export default function Workspace() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const handleSignOut = async () => {
    try {
      await dispatch(signOutAsync()).unwrap();
      router.push("/login");
    } catch (error) {
      console.error("Signout failed:", error);
      // Still redirect even if backend call fails
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workspace</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.username || user?.email || "User"}!
            </p>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut size={18} />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>

        {/* User Info Card */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              User Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="text-gray-900 font-medium">{user.username}</p>
              </div>
              {user.full_name && (
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-gray-900 font-medium">{user.full_name}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="text-gray-900 font-medium text-sm font-mono">
                  {user.id}
                </p>
              </div>
              {user.profile && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-2">Profile Picture</p>
                  <img
                    src={user.profile}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Workspace
          </h2>
          <p className="text-gray-600">
            This is your protected workspace. You can only access this page when
            authenticated.
          </p>
        </div>
      </div>
    </div>
  );
}
