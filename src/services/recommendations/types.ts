/**
 * Types for the Recommendations Service
 */

export interface RecommendationResponse {
  suggestedProjects: string[];
  suggestedCompetitions: string[];
  suggestedSkills: string[];
  timeline: string[];
  profileAnalysis: string;
}

export interface EnhancedRecommendationResponse extends RecommendationResponse {
  recommendedActivities: {
    name: string;
    description: string;
    relevance: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    timeCommitment: string;
    skillsDeveloped: string[];
  }[];
}

export interface MonthlyTimelineResponse {
  [month: string]: string[];
}