/**
 * Recommendations Service Index
 * 
 * This file acts as the main entry point for the recommendations service,
 * exporting the hybrid recommendations generator as the default implementation.
 */

export * from './templates';
export * from './hybrid';

// Re-export generateHybridRecommendations as the default generateRecommendations function
import { generateHybridRecommendations } from './hybrid';
export const generateRecommendations = generateHybridRecommendations; 