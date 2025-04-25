// Custom build script for Vercel deployment
const { execSync } = require('child_process');

console.log('Starting custom build process...');

try {
  // Set environment variables to skip type checking and linting
  process.env.NEXT_SKIP_TYPESCRIPT_CHECK = 'true';
  process.env.NEXT_SKIP_ESLINT_CHECK = 'true';
  
  console.log('Running Next.js build with TypeScript and ESLint checks disabled...');
  
  // Execute the build command with the environment variables
  execSync('next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_DISABLE_SOURCEMAPS: 'true' // Also disable source maps for smaller bundle
    }
  });
  
  console.log('Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
} 