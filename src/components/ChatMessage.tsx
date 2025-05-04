'use client';

import { useState } from 'react';
import { Message } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import { useTheme } from 'next-themes';
import { User, Bot, Clock, Info, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className={`py-4 px-4 rounded-lg flex gap-4 group hover:bg-zinc-900/50 transition-colors ${
      isUser ? 'bg-zinc-900/30' : 'bg-zinc-900/10'
    }`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
        isUser ? 'bg-blue-600/20 text-blue-400' : 'bg-emerald-600/20 text-emerald-400'
      }`}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-medium ${isUser ? 'text-blue-400' : 'text-emerald-400'}`}>
            {isUser ? 'You' : 'Assistant'}
          </span>
          
          {message.timestamp && (
            <div className="flex items-center text-xs text-zinc-500">
              <Clock className="w-3 h-3 mr-1" />
              <span>{formatTimestamp(message.timestamp)}</span>
            </div>
          )}
          
          {message.modelInfo?.name && (
            <Badge variant="outline" className="text-xs py-0 h-5 text-zinc-400 border-zinc-700">
              {message.modelInfo.name}
            </Badge>
          )}
        </div>
        
        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-800 prose-pre:border prose-pre:border-zinc-700 prose-pre:rounded-md">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        
        {/* Model info */}
        {message.modelInfo && message.modelInfo.description && (
          <div className="mt-3 border-t border-zinc-800 pt-2 text-xs text-zinc-400 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5" />
            <span>{message.modelInfo.description}</span>
          </div>
        )}
      </div>
      
      {/* Copy button */}
      <button 
        onClick={copyToClipboard}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-300 focus:opacity-100 self-start mt-1"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
} 