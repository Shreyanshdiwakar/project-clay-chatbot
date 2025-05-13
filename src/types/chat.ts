/**
 * Chat Types for Client Components
 */

import { ModelInfo } from '@/services/openai/types';
import type { ChatResponse } from './api';

/**
 * Chat message type for the UI
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelInfo?: ModelInfo;
  timestamp?: Date;
}

/**
 * Export relevant types from API
 */
export type { ChatResponse, ModelInfo }; 