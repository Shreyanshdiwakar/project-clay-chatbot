export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  features: string[];
  developer: string;
  parameters: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  modelInfo?: ModelInfo;
  timestamp?: Date;
}

export interface ChatResponse {
  message: string;
  model?: ModelInfo;
  thinking?: string[];
  error?: string;
} 