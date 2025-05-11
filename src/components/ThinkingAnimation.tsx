'use client';

import { useState, useEffect, useRef } from 'react';

interface ThinkingAnimationProps {
  message?: string;
  thinkingSteps?: string[];
}

export const ThinkingAnimation = ({ 
  message = "Deep thinking in progress...",
  thinkingSteps = []
}: ThinkingAnimationProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const fullTextRef = useRef(message);
  const displayedStepsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (displayedText === fullTextRef.current) return;
    
    const timeout = setTimeout(() => {
      setDisplayedText(prev => {
        const nextCharIndex = prev.length;
        if (nextCharIndex < fullTextRef.current.length) {
          return fullTextRef.current.slice(0, nextCharIndex + 1);
        }
        return prev;
      });
    }, 50);
    
    return () => clearTimeout(timeout);
  }, [displayedText]);

  useEffect(() => {
    if (thinkingSteps.length === 0) {
      const interval = setInterval(() => {
        if (Math.random() > 0.7 && displayedText.length > 10) {
          const currentLine = `\n> ${getRandomComputationStep()}`;
          fullTextRef.current += currentLine;
        }
      }, 1200);
      
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        const unshownSteps = thinkingSteps.filter(step => !displayedStepsRef.current.has(step));
        if (unshownSteps.length > 0) {
          const step = unshownSteps[0];
          displayedStepsRef.current.add(step);
          fullTextRef.current += `\n> ${step}`;
        }
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [displayedText, thinkingSteps]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="font-mono text-xs md:text-sm bg-zinc-800 text-green-400 p-3 rounded-md whitespace-pre-wrap max-h-[200px] overflow-y-auto">
      {displayedText}
      <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity`}>_</span>
    </div>
  );
};

function getRandomComputationStep(): string {
  const steps = [
    "Analyzing response options...",
    "Evaluating relevant experiences...",
    "Considering activity impact factors...",
    "Retrieving admissions criteria...",
    "Weighing time commitment factors...",
    "Calculating optimal combinations...",
    "Prioritizing recommendation factors...",
    "Evaluating leadership potential..."
  ];
  
  return steps[Math.floor(Math.random() * steps.length)];
} 
