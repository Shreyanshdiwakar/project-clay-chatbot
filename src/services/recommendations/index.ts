/**
 * Recommendations Service Index
 * 
 * This file acts as the main entry point for the recommendations service,
 * exporting the enhanced recommendations generator as the default implementation.
 */

export * from './templates';
export * from './hybrid';
export * from './improved';
export * from './analysis';
export * from './feedback';
export * from './metrics';
export * from './types';

// Re-export generateImprovedRecommendations as the default generateRecommendations function
import { generateImprovedRecommendations } from './improved';
export const generateRecommendations = generateImprovedRecommendations;