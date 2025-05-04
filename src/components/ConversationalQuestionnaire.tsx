'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StudentProfile } from '@/components/StudentQuestionnaire';
import { ArrowRight, PauseCircle, PlayCircle, Save } from 'lucide-react';

interface ConversationalQuestionnaireProps {
  onComplete: (profile: StudentProfile) => void;
  onPause: (partialProfile: Partial<StudentProfile>, currentStep: number) => void;
  onSkip?: () => void;
  initialProfile?: Partial<StudentProfile>;
  initialStep?: number;
}

interface Question {
  id: keyof StudentProfile;
  question: string;
  placeholder: string;
  isTextarea?: boolean;
  followUpText?: string;
}

export function ConversationalQuestionnaire({ 
  onComplete, 
  onPause,
  onSkip,
  initialProfile,
  initialStep = 0
}: ConversationalQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isTyping, setIsTyping] = useState(false);
  const [profile, setProfile] = useState<Partial<StudentProfile>>(initialProfile || {});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const questions: Question[] = [
    {
      id: 'name',
      question: "Hi there! I'm your college counseling assistant. What's your name?",
      placeholder: 'John Doe',
      followUpText: 'Nice to meet you!'
    },
    {
      id: 'gradeLevel',
      question: "Which grade/year are you currently in?",
      placeholder: '11th Grade / Junior',
      followUpText: "Great! This helps me understand your timeline."
    },
    {
      id: 'intendedMajor',
      question: "What major or area of study are you interested in pursuing in college?",
      placeholder: 'Computer Science, Engineering, etc.',
      followUpText: "That's an excellent field! I can help suggest relevant activities."
    },
    {
      id: 'currentActivities',
      question: "What extracurricular activities are you currently involved in?",
      placeholder: 'Debate team, Science club, Soccer...',
      isTextarea: true,
      followUpText: "Those sound like great experiences!"
    },
    {
      id: 'interestedActivities',
      question: "What kinds of activities or opportunities are you interested in exploring?",
      placeholder: 'Internships, Research, Volunteering...',
      isTextarea: true,
      followUpText: "I'll help you find opportunities in these areas."
    },
    {
      id: 'satScore',
      question: "What's your current SAT score or expected score range?",
      placeholder: '1200, 1350, or "Planning to take"',
      followUpText: "Thanks for sharing that information."
    },
    {
      id: 'additionalInfo',
      question: "Is there anything else you'd like to share about your college goals or circumstances?",
      placeholder: 'Career goals, special circumstances, etc.',
      isTextarea: true,
      followUpText: "Thank you for sharing this context."
    }
  ];

  // Simulated typing effect for questions
  useEffect(() => {
    if (currentStep < questions.length) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Reset current answer when step changes
  useEffect(() => {
    const currentField = questions[currentStep]?.id;
    if (currentField && profile[currentField]) {
      setCurrentAnswer(profile[currentField] as string);
    } else {
      setCurrentAnswer('');
    }
  }, [currentStep, profile]);

  const handleNext = () => {
    if (currentStep < questions.length) {
      // Save the current answer to the profile
      const currentQuestion = questions[currentStep];
      const updatedProfile = {
        ...profile,
        [currentQuestion.id]: currentAnswer
      };
      setProfile(updatedProfile);

      if (currentStep === questions.length - 1) {
        // Complete the questionnaire
        onComplete(updatedProfile as StudentProfile);
      } else {
        // Move to next question
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePause = () => {
    const currentQuestion = questions[currentStep];
    const updatedProfile = {
      ...profile,
      [currentQuestion.id]: currentAnswer
    };
    setProfile(updatedProfile);
    onPause(updatedProfile, currentStep);
    setShowSavePrompt(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && currentAnswer.trim() && !isTyping) {
      e.preventDefault();
      handleNext();
    }
  };

  // If we're past all questions, show completion
  if (currentStep >= questions.length) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-zinc-950 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">
            Thanks for completing the questionnaire!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-400">
            I'm generating personalized recommendations based on your profile. This will help me provide better guidance for your college journey.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <Card className="w-full max-w-2xl mx-auto bg-zinc-950 border-zinc-800 text-white">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <span>College Counseling Assistant</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question and progress indicator */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-zinc-400">
            Question {currentStep + 1} of {questions.length}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePause} 
            className="text-zinc-400 hover:text-white"
          >
            <PauseCircle className="mr-2 h-4 w-4" />
            Save Progress
          </Button>
        </div>

        {showSavePrompt && (
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-300">
              Your progress has been saved! You can come back and continue from where you left off.
            </p>
          </div>
        )}

        {/* Question */}
        <div className="bg-zinc-900 p-4 rounded-lg">
          <p className={`text-lg ${isTyping ? 'opacity-70' : 'opacity-100'}`}>
            {isTyping ? "..." : currentQuestion.question}
          </p>
        </div>

        {/* Previous answer summary if we're past first question */}
        {currentStep > 0 && profile[questions[currentStep-1].id] && (
          <div className="bg-zinc-900/50 p-3 rounded-lg">
            <p className="text-sm text-zinc-400">
              {questions[currentStep-1].followUpText}
            </p>
          </div>
        )}

        {/* Input */}
        <div className="pt-2">
          {currentQuestion.isTextarea ? (
            <Textarea
              placeholder={currentQuestion.placeholder}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={handleKeyPress}
              className="h-24 bg-zinc-900 border-zinc-700"
              disabled={isTyping}
            />
          ) : (
            <Input
              type="text"
              placeholder={currentQuestion.placeholder}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={handleKeyPress}
              className="bg-zinc-900 border-zinc-700"
              disabled={isTyping}
            />
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-zinc-800 pt-4">
        <div>
          {onSkip && currentStep === 0 && (
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-zinc-400 hover:text-white"
            >
              Skip for now
            </Button>
          )}
        </div>
        <Button
          onClick={handleNext}
          disabled={!currentAnswer.trim() || isTyping}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {currentStep === questions.length - 1 ? (
            'Complete Profile'
          ) : (
            <>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 