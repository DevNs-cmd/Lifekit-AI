import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for catching subtle bugs
  reactStrictMode: true,

  // Image optimisation — allow external providers
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.lifekit.ai" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Headers — security defaults
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",            value: "DENY" },
          { key: "X-XSS-Protection",           value: "1; mode=block" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  // Experimental — only stable features
  experimental: {},

  // External packages resolved on the server (moved from experimental)
  serverExternalPackages: [],
};

export default nextConfig;
