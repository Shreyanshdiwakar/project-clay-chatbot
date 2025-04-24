'use client';

import { useState, useEffect } from 'react';

interface ThinkingIndicatorProps {
  steps: string[];
}

export const ThinkingIndicator = ({ steps }: ThinkingIndicatorProps) => {
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [dots, setDots] = useState<string>('');
  
  // Animate the dots
  useEffect(() => {
    if (steps.length === 0) return;
    
    const dotInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    
    return () => clearInterval(dotInterval);
  }, [steps]);
  
  // Gradually reveal steps
  useEffect(() => {
    if (steps.length === 0) return;
    
    const stepsInterval = setInterval(() => {
      setVisibleSteps(prev => {
        if (prev < steps.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(stepsInterval);
  }, [steps]);
  
  if (steps.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-indigo-600 dark:text-indigo-400 font-medium">Thinking</span>
        <span className="w-12 text-indigo-600 dark:text-indigo-400">{dots}</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-indigo-600 dark:text-indigo-400 font-medium">Thinking</span>
        <span className="w-12 text-indigo-600 dark:text-indigo-400">{dots}</span>
      </div>
      <ul className="space-y-2 pl-1">
        {steps.slice(0, visibleSteps).map((step, index) => (
          <li key={index} className="flex items-start space-x-2 animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 dark:text-gray-300 text-sm">{step}</span>
          </li>
        ))}
        {visibleSteps < steps.length && (
          <li className="pl-7 text-gray-500 dark:text-gray-400 text-sm">{dots}</li>
        )}
      </ul>
    </div>
  );
}; 