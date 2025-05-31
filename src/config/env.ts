/**
 * Environment Configuration
 * 
 * This module centralizes all environment variable access and validation.
 * It ensures all required variables are present and provides graceful fallbacks
 * in development mode. This is compatible with Next.js Edge Runtime.
 */

// Define environment variable schema
export interface EnvConfig {
  // API Keys
  OPENAI_API_KEY: string;
  
  // API URLs
  OPENAI_API_URL: string;
  
  // Model configuration
  PRIMARY_MODEL: string;
  FALLBACK_MODEL: string;
  WEB_SEARCH_ENABLED: boolean;
  WEB_BROWSING_MODEL: string;
  
  // Node environment
  NODE_ENV: 'development' | 'production' | 'test';
  
  // Deployment info
  IS_VERCEL: boolean;
  VERCEL_ENV?: string;
}

// Determine environment early to use in subsequent logic
const isDevelopment = (() => {
  try {
    return process.env.NODE_ENV === 'development';
  } catch {
    // Fallback for environments where process.env might not be available
    return false;
  }
})();

/**
 * Gets an environment variable with validation and graceful fallbacks
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  try {
    const value = process.env[key];
    
    if (!value || value.trim() === '') {
      if (isDevelopment) {
        console.warn(`[Dev Mode] Environment variable ${key} is not set, using default: "${defaultValue}"`);
        return defaultValue;
      } else {
        // In production, log error but continue with default
        console.error(`Error: Required environment variable ${key} is not set`);
        return defaultValue;
      }
    }
    
    return value;
  } catch (error) {
    // Handle Edge Runtime or other environments where process.env is not available
    console.warn(`Warning: Could not access environment variable ${key}: ${error}`);
    return defaultValue;
  }
}

/**
 * Directly build the environment configuration object
 * This approach simplifies initialization and prevents circular dependencies
 */
export const env: EnvConfig = {
  // API Keys with validation and fallbacks
  OPENAI_API_KEY: (() => {
    // Use directly from .env.local file if available - highest priority
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
      console.info('Using OPENAI_API_KEY from environment variables');
      return process.env.OPENAI_API_KEY;
    }
    
    // Try alternative variable names
    const key = 
      getEnvVar('OPENAI_API_KEY') || 
      getEnvVar('NEXT_PUBLIC_OPENAI_API_KEY') ||
      getEnvVar('VERCEL_OPENAI_API_KEY');
    
    if (key && key.startsWith('sk-')) {
      console.info('Found valid OpenAI API key with prefix:', key.substring(0, 5) + '...');
      return key;
    }
    
    if (key === 'your_openai_api_key_here' || (key.length > 0 && key.length < 10)) {
      console.error('Warning: OPENAI_API_KEY appears to be a placeholder or invalid');
    }
    
    // In development mode, return a fallback for testing
    if ((!key || !key.startsWith('sk-')) && isDevelopment) {
      console.info('[Dev Mode] Using mock responses - no valid API key found');
      // Return an obviously invalid key so we fall back to mock responses
      return 'invalid-key-use-mock-responses';
    }
    
    return key || '';
  })(),
  
  // API URLs
  OPENAI_API_URL: getEnvVar('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions'),
  
  // Model configuration with sensible defaults
  PRIMARY_MODEL: getEnvVar('PRIMARY_MODEL', 'gpt-4.1-mini'),
  FALLBACK_MODEL: getEnvVar('FALLBACK_MODEL', 'gpt-3.5-turbo'),
  WEB_SEARCH_ENABLED: (() => {
    const value = getEnvVar('WEB_SEARCH_ENABLED', 'true');
    return value.toLowerCase() === 'true';
  })(),
  WEB_BROWSING_MODEL: getEnvVar('WEB_BROWSING_MODEL', 'gpt-4.1-mini'), // Updated to use GPT-4.1 Mini for browsing
  
  // Node environment - always use a valid value with safe fallback
  NODE_ENV: (() => {
    try {
      if (process.env.NODE_ENV === 'production') return 'production';
      if (process.env.NODE_ENV === 'test') return 'test';
      return 'development';
    } catch {
      // Edge Runtime fallback
      return 'production' as EnvConfig['NODE_ENV'];
    }
  })(),
  
  // Deployment info with safe access
  IS_VERCEL: (() => {
    try {
      return !!process.env.VERCEL;
    } catch {
      return false;
    }
  })(),
  VERCEL_ENV: (() => {
    try {
      return process.env.VERCEL_ENV || '';
    } catch {
      return '';
    }
  })(),
};

/**
 * Validate the API key format
 * Returns true if the API key is properly configured
 */
export function isApiKeyConfigured(): boolean {
  // In development mode, we're more lenient with API key requirements
  if (isDevelopment) {
    return true;
  }
  
  // In production, verify the API key has a reasonable format
  return Boolean(env.OPENAI_API_KEY && env.OPENAI_API_KEY.length > 10 && env.OPENAI_API_KEY.startsWith('sk-'));
}

/**
 * Get environment diagnostic information
 * This is useful for debugging purposes
 */
export function getEnvDiagnostics(): Record<string, string | boolean> {
  return {
    apiKeyConfigured: isApiKeyConfigured() ? 'yes' : 'no',
    environment: env.NODE_ENV,
    isVercel: env.IS_VERCEL,
    vercelEnv: env.VERCEL_ENV || 'not set',
    webSearchEnabled: env.WEB_SEARCH_ENABLED ? 'yes' : 'no',
    webBrowsingModel: env.WEB_BROWSING_MODEL
  };
}