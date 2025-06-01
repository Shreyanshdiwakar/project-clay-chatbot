/**
 * Recommendation Feedback Component
 * 
 * This component allows users to provide feedback on the quality, relevance,
 * and difficulty of recommendations they receive.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RecommendationFeedback as FeedbackData } from '@/services/recommendations/feedback';

interface RecommendationFeedbackProps {
  recommendationId: string;
  recommendationType: 'project' | 'competition' | 'skill' | 'timeline';
  recommendationName: string;
  userId?: string;
  onSubmit: (feedback: Omit<FeedbackData, 'timestamp'>) => void;
  onCancel?: () => void;
}

export function RecommendationFeedback({
  recommendationId,
  recommendationType,
  recommendationName,
  userId,
  onSubmit,
  onCancel
}: RecommendationFeedbackProps) {
  const [rating, setRating] = useState<number>(0);
  const [implemented, setImplemented] = useState<boolean | null>(null);
  const [difficulty, setDifficulty] = useState<'too_easy' | 'appropriate' | 'too_difficult' | null>(null);
  const [relevance, setRelevance] = useState<'relevant' | 'somewhat_relevant' | 'not_relevant' | null>(null);
  const [comments, setComments] = useState<string>('');
  
  const handleSubmit = () => {
    if (rating === 0 || implemented === null || difficulty === null || relevance === null) {
      // Could show validation error here
      return;
    }
    
    const feedbackData: Omit<FeedbackData, 'timestamp'> = {
      recommendationId,
      recommendationType,
      userId,
      rating,
      implemented,
      difficulty,
      relevance,
      comments: comments.trim() || undefined
    };
    
    onSubmit(feedbackData);
  };
  
  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg text-zinc-100">
          Rate This Recommendation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Recommendation Name */}
        <div className="mb-4 bg-zinc-800 p-3 rounded-lg">
          <p className="text-zinc-300 font-medium">{recommendationName}</p>
        </div>
        
        {/* Rating */}
        <div className="space-y-2">
          <label className="block text-sm text-zinc-400 mb-1">
            How helpful was this recommendation?
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <Button
                key={value}
                type="button"
                variant={rating === value ? "default" : "outline"}
                className={`h-10 w-10 p-0 ${
                  rating === value
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-zinc-700 hover:bg-zinc-800 text-zinc-400"
                }`}
                onClick={() => setRating(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Implementation */}
        <div className="space-y-2">
          <label className="block text-sm text-zinc-400 mb-1">
            Have you implemented this recommendation?
          </label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={implemented === true ? "default" : "outline"}
              className={`${
                implemented === true
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "border-zinc-700 hover:bg-zinc-800 text-zinc-400"
              }`}
              onClick={() => setImplemented(true)}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={implemented === false ? "default" : "outline"}
              className={`${
                implemented === false
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-zinc-700 hover:bg-zinc-800 text-zinc-400"
              }`}
              onClick={() => setImplemented(false)}
            >
              Not yet
            </Button>
          </div>
        </div>
        
        {/* Difficulty */}
        <div className="space-y-2">
          <label className="block text-sm text-zinc-400 mb-1">
            How was the difficulty level?
          </label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={difficulty === 'too_easy' ? "default" : "outline"}
              className={`${
                difficulty === 'too_easy'
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-zinc-700 hover:bg-zinc-800 text-zinc-400"
              }`}
              onClick={() => setDifficulty('too_easy')}
            >
              Too Easy
            </Button>
            <Button
              type="button"
              variant={difficulty === 'appropriate' ? "default" : "outline"}
              className={`${
                difficulty === 'appropriate'
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-zinc-700 hover:bg-zinc-800 text-zinc-400"
              }`}
              onClick={() => setDifficulty('appropriate')}
            >
              Just Right
            </Button>
            <Button
              type="button"
              variant={difficulty === 'too_difficult' ? "default" : "outline"}
              className={`${
                difficulty === 'too_difficult'
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-zinc-700 hover:bg-zinc-800 text-zinc-400"
              }`}
              onClick={() => setDifficulty('too_difficult')}
            >
              Too Difficult
            </Button>
          </div>
        </div>
        
        {/* Relevance */}
        <div className="space-y-2">
          <label className="block text-sm text-zinc-400 mb-1">
            How relevant was this to your interests and goals?
          </label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={relevance === 'relevant' ? "default" : "outline"}
              className={`${
                relevance === 'relevant'
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-zinc-700 hover:bg-zinc-800 text-zinc-400"
              }`}
              onClick={() => setRelevance('relevant')}
            >
              Very Relevant
            </Button>
            <Button
              type="button"
              variant={relevance === 'somewhat_relevant' ? "default" : "outline"}
              className={`${
                relevance === 'somewhat_relevant'
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-zinc-700 hover:bg-zinc-800 text-zinc-400"
              }`}
              onClick={() => setRelevance('somewhat_relevant')}
            >
              Somewhat
            </Button>
            <Button
              type="button"
              variant={relevance === 'not_relevant' ? "default" : "outline"}
              className={`${
                relevance === 'not_relevant'
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-zinc-700 hover:bg-zinc-800 text-zinc-400"
              }`}
              onClick={() => setRelevance('not_relevant')}
            >
              Not Relevant
            </Button>
          </div>
        </div>
        
        {/* Comments */}
        <div className="space-y-2">
          <label className="block text-sm text-zinc-400 mb-1">
            Additional Comments (Optional)
          </label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Any other feedback about this recommendation?"
            className="bg-zinc-800 border-zinc-700 resize-none h-24"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!rating || implemented === null || !difficulty || !relevance}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Submit Feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}