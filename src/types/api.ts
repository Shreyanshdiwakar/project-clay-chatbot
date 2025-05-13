/**
 * API Types for Chat Routes
 */

import { ModelInfo } from '@/services/openai/types';

// Request types
export interface ChatRequest {
  message: string;
  pdfContent?: string | null;
  profileContext?: string | null;
  isProfileQuery?: boolean;
  isWebSearch?: boolean;
}

// Response types
export interface ChatResponse {
  message: string;
  model?: ModelInfo;
  thinking?: string[];
  error?: string;
  webSearchResults?: {
    url: string;
    title: string;
    snippet: string;
  }[];
}

// API error response
export interface ApiErrorResponse {
  error: string;
  details?: string;
  environment?: string;
  deployed?: boolean;
} 