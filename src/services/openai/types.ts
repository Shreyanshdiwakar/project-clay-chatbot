/**
 * OpenAI API Type Definitions
 */
import { WebSearchResult } from '../langchain/types';

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
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

// Tool definitions - exactly matching OpenAI's API structure
export interface FunctionParameters {
  type: string;
  properties: Record<string, any>;
  required: string[];
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: FunctionParameters;
}

export interface FunctionTool {
  type: 'function';
  function: FunctionDefinition;
}

// Function tools are used for web search functionality

export interface Tool {
  type: string;
  [key: string]: any;
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
  // Tools for function calling (e.g., web search)
  tools?: Tool[];
}

// Response types
// Tool call response types
export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface ChatChoice {
  message: {
    role: string;
    content: string;
    tool_calls?: ToolCall[];
  };
  finish_reason: string;
  index: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
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
    code?: string;
  };
}

// Service response
export interface ModelResponse {
  success: boolean;
  content?: string;
  error?: string;
  webSearchAttempted?: boolean;
  webSearchResults?: WebSearchResult[];
  model?: string;
  responseTime?: number;
}
// Thinking steps generator
export type ThinkingStepGenerator = (message: string, pdfContent?: string | null) => string[]; 