/**
 * API Types for Chat Routes
 */

import { ModelInfo } from '@/services/openrouter';

// Request types
export interface ChatRequest {
  message: string;
  pdfContent?: string | null;
}

// Response types
export interface ChatResponse {
  message: string;
  model?: ModelInfo;
  thinking?: string[];
  error?: string;
}

// API error response
export interface ApiErrorResponse {
  error: string;
  details?: string;
  environment?: string;
  deployed?: boolean;
} 