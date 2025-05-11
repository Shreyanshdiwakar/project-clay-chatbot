/**
 * Environment Configuration
 * 
 * This module centralizes all environment variable access and validation.
 * It ensures all required variables are present and validates their format
 * at application startup time rather than during API requests.
 */

// Define environment variable schema
interface EnvConfig {
  // API Keys
  OPENAI_API_KEY: string;
  OPENROUTER_API_KEY: string;
  TAVILY_API_KEY: string;
  
  // API URLs
  OPENAI_API_URL: string;
  OPENROUTER_API_URL: string;
  
  // Model configuration
  PRIMARY_MODEL: string;
  FALLBACK_MODEL: string;
  
  // Node environment
  NODE_ENV: 'development' | 'production' | 'test';
  
  // Deployment info
  IS_VERCEL: boolean;
  VERCEL_ENV?: string;
}

/**
 * Gets an environment variable with validation
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    // In development, log a warning but continue
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Warning: Environment variable ${key} is not set`);
      return '';
    }
    // In production, throw an error for missing required variables
    throw new Error(`Environment variable ${key} is not set`);
  }
  
  return value;
}

/**
 * Environment configuration object with validation
 */
export const env: EnvConfig = {
  // API Keys with validation
  get OPENAI_API_KEY(): string {
    const key = 
      getEnvVar('OPENAI_API_KEY') || 
      getEnvVar('NEXT_PUBLIC_OPENAI_API_KEY') ||
      getEnvVar('VERCEL_OPENAI_API_KEY');
    
    if (key && (key === 'your_openai_api_key_here' || key.length < 10)) {
      console.error('Warning: OPENAI_API_KEY appears to be a placeholder or invalid');
    }
    
    return key;
  },

  get OPENROUTER_API_KEY(): string {
    const key = 
      getEnvVar('OPENROUTER_API_KEY') || 
      getEnvVar('NEXT_PUBLIC_OPENROUTER_API_KEY') ||
      getEnvVar('VERCEL_OPENROUTER_API_KEY');
    
    if (key && (key === 'your_openrouter_api_key_here' || key.length < 10)) {
      console.error('Warning: OPENROUTER_API_KEY appears to be a placeholder or invalid');
    }
    
    return key;
  },

  get TAVILY_API_KEY(): string {
    const key = 
      getEnvVar('TAVILY_API_KEY') || 
      getEnvVar('NEXT_PUBLIC_TAVILY_API_KEY') ||
      getEnvVar('VERCEL_TAVILY_API_KEY') ||
      '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'; // Default value from the user input
    
    if (key && key === 'your_tavily_api_key_here') {
      console.error('Warning: TAVILY_API_KEY appears to be a placeholder');
    }
    
    return key;
  },
  
  // API URLs
  OPENAI_API_URL: getEnvVar('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions'),
  OPENROUTER_API_URL: getEnvVar('OPENROUTER_API_URL', 'https://openrouter.ai/api/v1/chat/completions'),
  
  // Model configuration
  PRIMARY_MODEL: getEnvVar('PRIMARY_MODEL', 'gpt-4-turbo'),
  FALLBACK_MODEL: getEnvVar('FALLBACK_MODEL', 'gpt-3.5-turbo'),
  
  // Node environment
  NODE_ENV: (getEnvVar('NODE_ENV', 'development') as EnvConfig['NODE_ENV']),
  
  // Deployment info
  IS_VERCEL: !!process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV,
};

/**
 * Validate the API key format
 */
export function isApiKeyConfigured(): boolean {
  return Boolean(env.OPENAI_API_KEY && env.OPENAI_API_KEY.length > 10);
}

/**
 * Get environment diagnostic information (useful for debugging)
 */
export function getEnvDiagnostics(): Record<string, string | boolean> {
  return {
    apiKeyConfigured: isApiKeyConfigured() ? 'yes' : 'no',
    environment: env.NODE_ENV,
    isVercel: env.IS_VERCEL,
    vercelEnv: env.VERCEL_ENV || 'not set',
    tavilyApiKeyConfigured: Boolean(env.TAVILY_API_KEY) ? 'yes' : 'no',
  };
} 