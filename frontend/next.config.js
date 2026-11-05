/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "http://localhost:8000";
const cleanBackend = backendUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async rewrites() {
    // In production without a designated backend, avoid rewriting to localhost
    if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_API_URL && !process.env.BACKEND_URL) {
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${cleanBackend}/api/:path*`,
      },
      {
        source: "/ws/:path*",
        destination: `${cleanBackend}/ws/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
