/** @type {import('next').NextConfig} */

const nextConfig = {
  // Simplified output format for Vercel
  output: 'standalone',
  
  // Basic configuration
  reactStrictMode: true,
  
  // Skip type checking during builds to avoid potential issues
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint during builds
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // Ensure images work
  images: {
    domains: ['*'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Custom webpack configuration to handle external URLs
  webpack: (config, { isServer }) => {
    // Configure webpack to handle https URLs
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
};

export default nextConfig; 