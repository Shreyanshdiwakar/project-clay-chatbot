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

  // Custom webpack configuration to handle external URLs and Node.js modules
  webpack: (config, { isServer }) => {
    // Comprehensive list of Node.js modules to polyfill or ignore in browser
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      path: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      querystring: false,
      util: false,
      url: false,
      os: false,
      constants: false,
      assert: false,
      buffer: require.resolve('buffer/'),
      process: require.resolve('process/browser'),
    };

    // Add specific handling for chromadb-default-embed
    config.module.rules.push({
      test: /chromadb-default-embed/,
      use: 'null-loader',
    });

    // Add plugins to provide global variables expected by some packages
    if (!isServer) {
      config.plugins.push(
        new config.constructor.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }

    // Ignore specific problematic modules in node_modules
    config.externals = [...(config.externals || []), { 'chromadb-default-embed': 'commonjs chromadb-default-embed' }];

    return config;
  },
};

export default nextConfig; 