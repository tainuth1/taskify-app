import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Rewrite API requests to backend to avoid CORS issues
   * This ensures cookies are properly handled by proxying through same origin
   *
   * How it works:
   * - Frontend requests: /api/auth/signin (same origin)
   * - Next.js rewrites to: http://127.0.0.1:8000/api/auth/signin
   * - Cookies are set for localhost:3000 (same origin)
   * - Cookies persist correctly!
   */
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
