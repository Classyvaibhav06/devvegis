import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "**.neon.tech",
      },
      {
        protocol: "https",
        hostname: "**.neon.build",
      },
      {
        protocol: "https",
        hostname: "**.aws.neon.tech",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
