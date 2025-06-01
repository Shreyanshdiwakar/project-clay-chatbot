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

export interface ProjectDetails {
  name: string;
  description: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  timeframe: string;
  skillsRequired: string[];
  skillsDeveloped: string[];
  steps: string[];
  resources: { name: string; url: string }[];
  category: string[];
  matchScore: number;
}

export interface CompetitionDetails {
  name: string;
  url?: string;
  description: string;
  eligibility: string[];
  deadline: string;
  category: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  matchScore: number;
  competitiveness: 'low' | 'medium' | 'high';
  benefits: string[];
  fee?: string;
}

export interface AIGeneratedProjectDetails {
  detailedPlan: string;
  resourceLinks: { name: string; url: string; description: string }[];
  tips: string[];
  timeline: { phase: string; tasks: string[] }[];
}

export interface AIGeneratedCompetitionDetails {
  applicationProcess: string;
  preparationSteps: string[];
  successStrategies: string[];
  pastWinnerProfiles: string[];
  scholarshipInfo: string;
  relatedOpportunities: { name: string; url: string; description: string }[];
}