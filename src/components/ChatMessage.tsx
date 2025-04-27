'use client';

import React from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Message, ModelInfo } from '@/types/chat';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const timestamp = message.timestamp 
    ? format(new Date(message.timestamp), 'HH:mm') 
    : '';

  return (
    <div className={`flex w-full my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 mr-4">
          <Avatar>
            <AvatarImage src="/projectclay.jpg" alt="Assistant" />
            <AvatarFallback className="bg-zinc-700 text-white">PC</AvatarFallback>
          </Avatar>
        </div>
      )}
      
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <Card className={`border-0 shadow-sm ${isUser ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-white'}`}>
          <CardContent className="p-4 pt-4">
            <div className="markdown-content text-white">
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          </CardContent>
          {(timestamp || message.modelInfo) && (
            <CardFooter className={`px-4 py-2 text-xs ${isUser ? 'text-zinc-300' : 'text-zinc-400'} flex justify-between`}>
              {timestamp && <div>{timestamp}</div>}
              {message.modelInfo && (
                <div className="ml-auto">
                  {message.modelInfo.name || 'AI Assistant'}
                </div>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 ml-4">
          <Avatar>
            <AvatarFallback className="bg-zinc-600 text-white">
              {isUser ? 'U' : 'PC'}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
} 