'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ThinkingIndicatorProps {
  steps: string[];
}

export function ThinkingIndicator({ steps }: ThinkingIndicatorProps) {
  const [visibleSteps, setVisibleSteps] = useState<string[]>([]);
  
  useEffect(() => {
    if (steps.length === 0) {
      setVisibleSteps(["Thinking..."]);
      return;
    }
    
    // Show steps one by one with delays
    const timers: NodeJS.Timeout[] = [];
    
    steps.forEach((step, index) => {
      const timer = setTimeout(() => {
        setVisibleSteps(prev => [...prev, step]);
      }, index * 600);
      
      timers.push(timer);
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [steps]);

  return (
    <Card className="border-0 bg-zinc-800/50 border-zinc-700 shadow-none">
      <CardContent className="p-4 space-y-4">
        {visibleSteps.map((step, index) => (
          <div 
            key={index}
            className="flex items-start gap-3 animate-fadeIn"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="h-5 w-5 mt-0.5 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-zinc-500/30 rounded-full animate-ping" />
              <div className="relative h-3 w-3 bg-zinc-500 rounded-full" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-300">{step}</p>
              {index === visibleSteps.length - 1 && (
                <div className="mt-2 space-y-2">
                  <Skeleton className="h-3 w-[90%] bg-zinc-700" />
                  <Skeleton className="h-3 w-[75%] bg-zinc-700" />
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 