import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static exports configuration for Vercel deployment
  // Only use static exports for GitHub Pages
  ...((process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES === 'true') && {
    output: "export",
    
    /**
     * Set base path for GitHub Pages
     * This will be the name of your repository
     */
    basePath: "/projectclay-chatbot",
    
    /**
     * Disable server-based image optimization
     */
    images: {
      unoptimized: true,
    },
  }),
  
  reactStrictMode: true,
};

export default nextConfig;
