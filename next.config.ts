import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Enable static exports for GitHub Pages only in production
   */
  ...(process.env.NODE_ENV === 'production' && {
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
