/**
 * Recommendation Feedback Service
 * 
 * This module provides functionality for collecting and analyzing user feedback
 * on recommendations to improve future suggestions.
 */

import { StudentProfile } from '@/components/StudentQuestionnaire';

/**
 * Feedback data structure for a single recommendation
 */
export interface RecommendationFeedback {
  recommendationId: string;
  recommendationType: 'project' | 'competition' | 'skill' | 'timeline';
  userId?: string;
  rating: number; // 1-5 rating
  implemented: boolean;
  difficulty: 'too_easy' | 'appropriate' | 'too_difficult';
  relevance: 'relevant' | 'somewhat_relevant' | 'not_relevant';
  comments?: string;
  timestamp: number;
}

/**
 * Aggregated feedback metrics
 */
export interface FeedbackMetrics {
  averageRating: number;
  implementationRate: number;
  difficultyDistribution: {
    tooEasy: number;
    appropriate: number;
    tooDifficult: number;
  };
  relevanceDistribution: {
    relevant: number;
    somewhatRelevant: number;
    notRelevant: number;
  };
  totalFeedbackCount: number;
}

// In-memory storage for feedback (in a real app, this would be a database)
const feedbackStore: RecommendationFeedback[] = [];

/**
 * Submit feedback for a recommendation
 */
export function submitFeedback(feedback: Omit<RecommendationFeedback, 'timestamp'>): RecommendationFeedback {
  const newFeedback: RecommendationFeedback = {
    ...feedback,
    timestamp: Date.now()
  };
  
  // Store the feedback
  feedbackStore.push(newFeedback);
  
  // Log the feedback submission
  console.log(`Feedback submitted for ${feedback.recommendationType}:`, feedback.recommendationId);
  
  return newFeedback;
}

/**
 * Get feedback for a specific user
 */
export function getUserFeedback(userId: string): RecommendationFeedback[] {
  return feedbackStore.filter(f => f.userId === userId);
}

/**
 * Get feedback metrics for all recommendations or filtered by type
 */
export function getFeedbackMetrics(
  type?: 'project' | 'competition' | 'skill' | 'timeline'
): FeedbackMetrics {
  // Filter feedback if type is specified
  const filteredFeedback = type 
    ? feedbackStore.filter(f => f.recommendationType === type)
    : feedbackStore;
  
  // Calculate metrics
  const totalCount = filteredFeedback.length;
  
  if (totalCount === 0) {
    return {
      averageRating: 0,
      implementationRate: 0,
      difficultyDistribution: {
        tooEasy: 0,
        appropriate: 0,
        tooDifficult: 0
      },
      relevanceDistribution: {
        relevant: 0,
        somewhatRelevant: 0,
        notRelevant: 0
      },
      totalFeedbackCount: 0
    };
  }
  
  // Calculate average rating
  const averageRating = filteredFeedback.reduce((sum, f) => sum + f.rating, 0) / totalCount;
  
  // Calculate implementation rate
  const implementationRate = filteredFeedback.filter(f => f.implemented).length / totalCount;
  
  // Calculate difficulty distribution
  const difficultyCount = {
    tooEasy: filteredFeedback.filter(f => f.difficulty === 'too_easy').length,
    appropriate: filteredFeedback.filter(f => f.difficulty === 'appropriate').length,
    tooDifficult: filteredFeedback.filter(f => f.difficulty === 'too_difficult').length
  };
  
  // Calculate relevance distribution
  const relevanceCount = {
    relevant: filteredFeedback.filter(f => f.relevance === 'relevant').length,
    somewhatRelevant: filteredFeedback.filter(f => f.relevance === 'somewhat_relevant').length,
    notRelevant: filteredFeedback.filter(f => f.relevance === 'not_relevant').length
  };
  
  return {
    averageRating,
    implementationRate,
    difficultyDistribution: {
      tooEasy: difficultyCount.tooEasy / totalCount,
      appropriate: difficultyCount.appropriate / totalCount,
      tooDifficult: difficultyCount.tooDifficult / totalCount
    },
    relevanceDistribution: {
      relevant: relevanceCount.relevant / totalCount,
      somewhatRelevant: relevanceCount.somewhatRelevant / totalCount,
      notRelevant: relevanceCount.notRelevant / totalCount
    },
    totalFeedbackCount: totalCount
  };
}