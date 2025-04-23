import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure we're not using static exports for Vercel
  output: "standalone",
  
  // Basic configuration
  reactStrictMode: true,
  
  // For proper routing
  trailingSlash: false,
  
  // Ensure images work
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
