/**
 * Types for the Recommendations Service
 */

export interface RecommendationResponse {
  suggestedProjects: string[];
  suggestedCompetitions: string[];
  suggestedSkills: string[];
  timeline: string[];
  profileAnalysis: string;
  recommendedActivities: {
    name: string;
    description: string;
    relevance: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    timeCommitment: string;
    skillsDeveloped: string[];
  }[];
}

export interface EnhancedRecommendationResponse extends RecommendationResponse {
  // The interface extends the base response, with the same field types
  // No need to redefine fields unless their types change
}

