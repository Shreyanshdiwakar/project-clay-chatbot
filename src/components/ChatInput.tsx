'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isThinking?: boolean;
}

export function ChatInput({ onSendMessage, isThinking = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isThinking) return;
    
    onSendMessage(message);
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card className="border-t border-b-0 border-x-0 border-zinc-800 rounded-none shadow-none bg-zinc-900">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isThinking}
              className="resize-none min-h-24 pr-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus-visible:ring-zinc-700"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isThinking || !message.trim()}
              className="absolute right-2 bottom-2 bg-zinc-700 hover:bg-zinc-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-2 text-xs text-zinc-400 flex justify-between">
          <div>Press Enter to send, Shift+Enter for new line</div>
          {isThinking && <div>Assistant is thinking...</div>}
        </CardFooter>
      </form>
    </Card>
  );
} 