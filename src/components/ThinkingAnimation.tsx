'use client';

import { useState, useEffect, useRef } from 'react';

interface ThinkingAnimationProps {
  message?: string;
}

// ThinkingAnimation simulates terminal-like typing, showing an AI thought process
export const ThinkingAnimation = ({ message = "Deep thinking in progress..." }: ThinkingAnimationProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const fullTextRef = useRef(message);

  // Typing animation effect
  useEffect(() => {
    // If we're at the end of the text, don't do anything more
    if (displayedText === fullTextRef.current) return;
    
    // Type the next character
    const timeout = setTimeout(() => {
      setDisplayedText(prev => {
        // Random typing speed effect
        const nextCharIndex = prev.length;
        if (nextCharIndex < fullTextRef.current.length) {
          return fullTextRef.current.slice(0, nextCharIndex + 1);
        }
        return prev;
      });
    }, Math.random() * 50 + 30); // Random delay between 30-80ms for natural typing
    
    return () => clearTimeout(timeout);
  }, [displayedText]);

  // Simulate processing intermediate computational steps
  useEffect(() => {
    // Every so often, add a computation step
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && displayedText.length > 10) {
        const currentLine = `\n> ${getRandomComputationStep()}`;
        fullTextRef.current += currentLine;
      }
    }, 1200);
    
    return () => clearInterval(interval);
  }, [displayedText]);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530); // Cursor blink rate
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="font-mono text-xs md:text-sm bg-gray-800 text-green-400 p-3 rounded-md whitespace-pre-wrap max-h-[200px] overflow-y-auto">
      {displayedText}
      <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity`}>_</span>
    </div>
  );
};

// Helper function to generate random "deep thinking" messages
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