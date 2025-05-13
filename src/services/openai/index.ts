/**
 * OpenAI Service
 * 
 * This is the main entry point for the OpenAI service.
 * It exports all components needed for using the OpenAI API.
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
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI\'s most advanced model, with excellent reasoning capabilities',
    features: ['Reasoning', 'Advising', 'Problem-solving', 'Creativity'],
    developer: 'OpenAI',
    parameters: '200 billion'
  },
  'gpt-4-0125-preview': {
    id: 'gpt-4-0125-preview',
    name: 'GPT-4 Turbo (Preview)',
    description: 'A powerful large language model with strong reasoning and browsing capabilities',
    features: ['Reasoning', 'Planning', 'Web Browsing', 'Problem-solving'],
    developer: 'OpenAI',
    parameters: '100 billion'
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'A powerful large language model with strong reasoning capabilities',
    features: ['Reasoning', 'Planning', 'Advising', 'Problem-solving'],
    developer: 'OpenAI',
    parameters: '100 billion'
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'A versatile language model with good general knowledge',
    features: ['Conversation', 'Content generation', 'Information retrieval'],
    developer: 'OpenAI',
    parameters: '13 billion'
  }
};

export default {
  getModelResponse,
  generateThinkingSteps,
  MODEL_INFO
}; 