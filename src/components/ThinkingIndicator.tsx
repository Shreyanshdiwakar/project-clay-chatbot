'use client';

import { useState, useEffect } from 'react';

interface ThinkingIndicatorProps {
  steps: string[];
}

export const ThinkingIndicator = ({ steps }: ThinkingIndicatorProps) => {
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [dotCount, setDotCount] = useState<number>(0);
  
  useEffect(() => {
    const animation = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4);
    }, 400);
    
    return () => clearInterval(animation);
  }, []);
  
  useEffect(() => {
    if (steps.length === 0) return;
    
    const stepsInterval = setInterval(() => {
      setVisibleSteps(prev => {
        if (prev < steps.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);
    
    return () => clearInterval(stepsInterval);
  }, [steps]);
  
  const renderDots = () => {
    return '.'.repeat(dotCount);
  };

  if (steps.length === 0) {
    return (
      <div className="flex items-center">
        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
          thinking<span className="inline-block min-w-8">{renderDots()}</span>
        </span>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center mb-2">
        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
          thinking<span className="inline-block min-w-8">{renderDots()}</span>
        </span>
      </div>
      
      <ul className="space-y-1 pl-1">
        {steps.slice(Math.max(0, visibleSteps - 2), visibleSteps).map((step, index) => (
          <li key={index} className="flex items-start space-x-2 animate-fadeIn opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-zinc-700 dark:text-zinc-300 text-xs">{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}; 