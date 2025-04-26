/**
 * OpenRouter API Type Definitions
 */

// Model information
export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  features: string[];
  developer: string;
  parameters: string;
}

// Request types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

// Response types
export interface ChatChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
  index: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  provider?: string;
  choices: ChatChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Error response
export interface ApiErrorResponse {
  error: {
    message: string;
    type?: string;
    code?: number;
  };
}

// Service response
export interface ModelResponse {
  success: boolean;
  content?: string;
  error?: string;
}

// Thinking steps generator
export type ThinkingStepGenerator = (message: string, pdfContent?: string | null) => string[]; 