'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ThinkingIndicatorProps {
  steps: string[];
  model?: string;
}

export function ThinkingIndicator({ steps, model = "GPT-4.1 Mini" }: ThinkingIndicatorProps) {
  const [visibleSteps, setVisibleSteps] = useState<string[]>([]);
  
  useEffect(() => {
    if (steps.length === 0) {
      setVisibleSteps(["Processing your question..."]);
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
    <Card className="border-0 bg-zinc-900/40 border-zinc-800/50 rounded-xl shadow-lg overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-900/30 w-8 h-8 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-sm font-medium text-indigo-300">Thinking in progress</span>
          </div>
          
          <Badge variant="outline" className="bg-zinc-800/80 text-xs border-zinc-700/50">
            {model}
          </Badge>
        </div>
        
        {visibleSteps.map((step, index) => (
          <div 
            key={index}
            className="flex items-start gap-3 animate-fadeIn"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="h-5 w-5 mt-0.5 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" 
                   style={{animationDuration: '1.5s'}} />
              <div className="relative h-3 w-3 bg-indigo-500 rounded-full" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-300">{step}</p>
              {index === visibleSteps.length - 1 && (
                <div className="mt-2 space-y-1.5">
                  <Skeleton className="h-2.5 w-[98%] bg-zinc-800/80" />
                  <Skeleton className="h-2.5 w-[80%] bg-zinc-800/80" />
                  <Skeleton className="h-2.5 w-[60%] bg-zinc-800/80" />
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}