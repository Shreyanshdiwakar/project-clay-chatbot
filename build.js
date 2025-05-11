// Custom build script for Vercel deployment
const { execSync } = require('child_process');

console.log('Starting simplified build process for Vercel deployment...');

// Set environment variables
process.env.NEXT_SKIP_TYPESCRIPT_CHECK = 'true';
process.env.NEXT_SKIP_ESLINT_CHECK = 'true';
process.env.NEXT_DISABLE_SOURCEMAPS = 'true';
process.env.NODE_OPTIONS = '--max_old_space_size=4096';

try {
  console.log('Running Next.js build with optimized settings...');
  
  // Execute the build command with environment variables
  execSync('next build', { 
    stdio: 'inherit',
    env: {
      ...process.env
    }
  });
  
  console.log('Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
} 