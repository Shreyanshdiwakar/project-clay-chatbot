'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Check, PauseCircle, Save, BookOpen, Calendar, Award, Briefcase } from 'lucide-react';
import React from 'react';

export interface StudentProfile {
  name: string;
  gradeLevel: string;
  intendedMajor: string;
  currentActivities: string;
  interestedActivities: string;
  satScore: string;
  additionalInfo: string;
  progress?: number; // Current question index for resuming
  lastUpdated?: string; // Timestamp for tracking updates
  userId?: string; // For multi-user support
}

interface StudentQuestionnaireProps {
  onComplete: (profile: StudentProfile) => void;
  onSkip?: () => void;
  onPause?: (profile: StudentProfile) => void; // Callback for pausing the questionnaire
  initialProfile?: StudentProfile; // For resuming from a saved state
}

const INITIAL_PROFILE: StudentProfile = {
  name: '',
  gradeLevel: '',
  intendedMajor: '',
  currentActivities: '',
  interestedActivities: '',
  satScore: '',
  additionalInfo: '',
  progress: 0,
  lastUpdated: new Date().toISOString()
};

interface Question {
  id: keyof StudentProfile;
  label: string;
  placeholder: string;
  isTextarea?: boolean;
  icon: React.ElementType;
  helpText: string;
}

export function StudentQuestionnaire({ 
  onComplete, 
  onSkip, 
  onPause,
  initialProfile 
}: StudentQuestionnaireProps) {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile || INITIAL_PROFILE);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(initialProfile?.progress || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // List of questions in conversational order
  const questions: Question[] = [
    {
      id: 'name',
      label: 'What is your name?',
      placeholder: 'John Doe',
      icon: BookOpen,
      helpText: 'This helps me address you personally throughout our conversation.',
    },
    {
      id: 'gradeLevel',
      label: 'What grade or year are you currently in?',
      placeholder: '11th Grade / Junior',
      icon: BookOpen,
      helpText: 'Different grade levels have different priorities and timelines for college preparation.',
    },
    {
      id: 'intendedMajor',
      label: 'What major(s) are you considering for college?',
      placeholder: 'Computer Science, Engineering, etc.',
      icon: Briefcase,
      helpText: 'This helps me suggest activities that align with your academic interests.',
    },
    {
      id: 'currentActivities',
      label: 'What extracurricular activities are you currently involved in?',
      placeholder: 'Debate team, Science club, Soccer...',
      isTextarea: true,
      icon: Calendar,
      helpText: 'I\'ll analyze your current commitments to suggest complementary activities.',
    },
    {
      id: 'interestedActivities',
      label: 'What types of activities would you like to explore?',
      placeholder: 'Internships, Research, Volunteering...',
      isTextarea: true,
      icon: Calendar,
      helpText: 'This helps me understand your interests beyond what you\'re already doing.',
    },
    {
      id: 'satScore',
      label: 'What is your current SAT score (or expected score)?',
      placeholder: '1200, 1350, or "Planning to take"',
      icon: Award,
      helpText: 'This helps me suggest academic preparation strategies appropriate for your level.',
    },
    {
      id: 'additionalInfo',
      label: 'Is there anything else you\'d like to share about your goals?',
      placeholder: 'Career goals, special circumstances, etc.',
      isTextarea: true,
      icon: Award,
      helpText: 'Any additional context helps me provide more personalized guidance.',
    },
  ];

  // Calculate progress percentage
  const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;
  
  // Current question
  const currentQuestion = questions[currentQuestionIndex];

  // Update profile field
  const updateProfile = (field: keyof StudentProfile, value: string) => {
    setProfile(prev => ({ 
      ...prev, 
      [field]: value,
      lastUpdated: new Date().toISOString()
    }));
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Save progress in profile
      const updatedProfile = {
        ...profile,
        progress: currentQuestionIndex + 1
      };
      setProfile(updatedProfile);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  // Move to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Update progress in profile
      setProfile(prev => ({
        ...prev,
        progress: currentQuestionIndex - 1
      }));
    }
  };

  // Pause the questionnaire and save current state
  const handlePause = () => {
    setIsPaused(true);
    if (onPause) {
      // Save current progress including the current question index
      const pausedProfile = {
        ...profile,
        progress: currentQuestionIndex
      };
      onPause(pausedProfile);
    }
  };

  // Resume from paused state
  const handleResume = () => {
    setIsPaused(false);
  };

  // Submit the completed profile
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Mark as completed by setting progress to questions.length
      const completedProfile = {
        ...profile,
        progress: questions.length,
        lastUpdated: new Date().toISOString()
      };
      onComplete(completedProfile);
    } catch (error) {
      console.error('Error submitting profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current field has a value
  const canProceed = () => {
    // If it's the last question (additional info), we can proceed even if empty
    if (currentQuestionIndex === questions.length - 1) return true;
    
    // For all other questions, require at least some input
    const currentValue = profile[currentQuestion.id] as string;
    return currentValue && currentValue.trim().length > 0;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-zinc-950 border-zinc-800 text-white">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          {React.createElement(currentQuestion.icon, { className: "h-6 w-6 text-blue-400" })}
          <span>Student Profile</span>
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {isPaused ? 
            "Your progress has been saved. You can resume later or continue now." : 
            "Let's have a conversation to understand your academic goals better."
          }
        </CardDescription>
      </CardHeader>

      {isPaused ? (
        <CardContent className="space-y-6">
          <div className="p-6 text-center bg-zinc-900 rounded-lg">
            <Save className="h-12 w-12 mx-auto mb-4 text-blue-400" />
            <h3 className="text-lg font-medium mb-2">Progress Saved</h3>
            <p className="text-zinc-400 mb-6">
              You've completed {currentQuestionIndex} of {questions.length} questions.
              Your answers have been saved.
            </p>
            <Button 
              onClick={handleResume}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Continue Questionnaire
            </Button>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-right text-xs text-zinc-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>

            {/* Current question */}
            <div className="space-y-2 py-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
                  {currentQuestionIndex + 1}
                </span>
                <Label htmlFor={currentQuestion.id} className="text-lg font-medium">
                  {currentQuestion.label}
                </Label>
              </div>
              
              <p className="text-sm text-zinc-400 mb-4">{currentQuestion.helpText}</p>
              
              {currentQuestion.isTextarea ? (
                <Textarea
                  id={currentQuestion.id}
                  placeholder={currentQuestion.placeholder}
                  value={profile[currentQuestion.id] as string}
                  onChange={(e) => updateProfile(currentQuestion.id, e.target.value)}
                  className="h-24 bg-zinc-900 border-zinc-700 focus:border-blue-500"
                />
              ) : (
                <Input
                  id={currentQuestion.id}
                  type="text"
                  placeholder={currentQuestion.placeholder}
                  value={profile[currentQuestion.id] as string}
                  onChange={(e) => updateProfile(currentQuestion.id, e.target.value)}
                  className="bg-zinc-900 border-zinc-700 focus:border-blue-500"
                />
              )}
            </div>
          </div>
        </CardContent>
      )}

      <CardFooter className="flex justify-between border-t border-zinc-800 pt-4">
        <div className="flex gap-2">
          {!isPaused && (
            <>
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0 || isSubmitting}
                className="border-zinc-700 text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              {onPause && (
                <Button
                  variant="outline"
                  onClick={handlePause}
                  className="border-zinc-700 text-white"
                >
                  <PauseCircle className="mr-2 h-4 w-4" /> Save & Pause
                </Button>
              )}
            </>
          )}
          
          {onSkip && !isPaused && (
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-zinc-400 hover:text-white"
            >
              Skip for now
            </Button>
          )}
        </div>

        {!isPaused && (
          <Button
            onClick={nextQuestion}
            disabled={isSubmitting || !canProceed()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {currentQuestionIndex === questions.length - 1 ? (
              isSubmitting ? 'Creating Profile...' : 'Complete Profile'
            ) : (
              <>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 