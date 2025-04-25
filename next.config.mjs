/** @type {import('next').NextConfig} */

const nextConfig = {
  // Use serverless output format which is more compatible with Vercel
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Basic configuration
  reactStrictMode: true,
  
  // For proper routing
  trailingSlash: false,
  
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  
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
  
  // Explicitly set the webpack config
  webpack: (config, { isServer }) => {
    // You could add custom webpack configurations here if needed
    return config;
  },
};

export default nextConfig; 