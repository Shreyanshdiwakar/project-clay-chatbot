import React, { useState, useEffect } from 'react';

interface ThinkingAnimationProps {
  thinkingSteps?: string[];
}

export const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({ thinkingSteps }) => {
  const [displayText, setDisplayText] = useState<string>('');
  const [counter, setCounter] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  
  const defaultThinkingLines = [
    "Analyzing your question...",
    "Searching my knowledge...",
    "Considering different perspectives...",
    "Formulating a response...",
    "Checking for accuracy...",
    "Organizing my thoughts...",
    "Processing information...",
    "Generating a helpful answer..."
  ];
  
  // Use provided thinking steps if available, otherwise use defaults
  const thinkingLines = thinkingSteps || defaultThinkingLines;
  
  useEffect(() => {
    // Start with an empty line
    setDisplayText('');
    
    // Add a character every 50ms to simulate typing
    // If we have thinking steps, use the current step index
    const lineIndex = thinkingSteps ? currentStepIndex : (counter % thinkingLines.length);
    let currentLine = thinkingLines[lineIndex];
    let charIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (charIndex < currentLine.length) {
        setDisplayText(prev => prev + currentLine[charIndex]);
        charIndex++;
      } else {
        // Finished typing the current line
        clearInterval(typingInterval);
        
        // Wait a moment before starting the next line
        setTimeout(() => {
          // Move to next step if we're using real thinking steps
          if (thinkingSteps) {
            if (currentStepIndex < thinkingSteps.length - 1) {
              setCurrentStepIndex(prev => prev + 1);
            } else {
              // If we've gone through all steps, reset to start
              setCurrentStepIndex(0);
            }
          } else {
            // Otherwise just increment the counter for default lines
            setCounter(prev => prev + 1);
          }
          
          setDisplayText('');
        }, 1000);
      }
    }, 50);
    
    return () => {
      clearInterval(typingInterval);
    };
  }, [counter, currentStepIndex, thinkingLines, thinkingSteps]);
  
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-lg my-3">
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>
        <h3 className="text-blue-800 dark:text-blue-300 font-semibold">
          DeepSeek r1 is thinking...
        </h3>
      </div>
      
      <div className="relative pl-11">
        <div className="bg-white dark:bg-blue-900/40 p-3 rounded-lg shadow-sm">
          <p className="text-blue-700 dark:text-blue-300 font-mono text-sm">
            {displayText}
            <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse"></span>
          </p>
        </div>
        
        {/* Progress indicator */}
        {thinkingSteps && (
          <div className="mt-2 mb-3">
            <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mb-1">
              <span>Thinking process: {currentStepIndex + 1}/{thinkingSteps.length}</span>
              <span>{Math.round(((currentStepIndex + 1) / thinkingSteps.length) * 100)}% complete</span>
            </div>
            <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / thinkingSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 