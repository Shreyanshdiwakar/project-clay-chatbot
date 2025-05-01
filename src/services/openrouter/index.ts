/**
 * OpenRouter Service
 * 
 * This is the main entry point for the OpenRouter service.
 * It exports all components needed for using the OpenRouter API.
 */

export * from './types';
export * from './service';
export * from './thinking';

// Re-export the most commonly used functions
import { getModelResponse } from './service';
import { generateThinkingSteps } from './thinking';
import { ModelInfo } from './types';

// Standard model information used for UI display
export const MODEL_INFO: Record<string, ModelInfo> = {
  'microsoft/mai-ds-r1:free': {
    id: 'microsoft/mai-ds-r1:free',
    name: 'Microsoft MAI DS-R1 (Free)',
    description: 'Microsoft\'s free multimodal model with excellent reasoning capabilities',
    features: ['Reasoning', 'Advising', 'Problem-solving', 'Free tier'],
    developer: 'Microsoft',
    parameters: '7 billion'
  },
  'tng/deepseek-r1t-chimera': {
    id: 'tng/deepseek-r1t-chimera',
    name: 'DeepSeek R1T Chimera',
    description: 'A powerful large language model with excellent reasoning and creative capabilities',
    features: ['Reasoning', 'Planning', 'Advising', 'Problem-solving', 'Creativity'],
    developer: 'TNG',
    parameters: '7 billion'
  },
  'deepseek/deepseek-chat': {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat',
    description: 'A powerful large language model with strong reasoning capabilities',
    features: ['Reasoning', 'Planning', 'Advising', 'Problem-solving'],
    developer: 'DeepSeek',
    parameters: '7 billion'
  },
  'openai/gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    description: 'A versatile language model with good general knowledge',
    features: ['Conversation', 'Content generation', 'Information retrieval'],
    developer: 'OpenAI',
    parameters: '13 billion',
    id: 'openai/gpt-3.5-turbo'
  }
};

export default {
  getModelResponse,
  generateThinkingSteps,
  MODEL_INFO
}; 