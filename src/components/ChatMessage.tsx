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
  const isUser = message.role === "user";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className={`py-6 px-6 rounded-lg flex gap-6 group hover:bg-zinc-900/50 transition-colors ${
      isUser ? "bg-zinc-900/30" : "bg-zinc-900/10"
    }`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
        isUser ? "bg-blue-600/20 text-blue-400" : "bg-emerald-600/20 text-emerald-400"
      }`}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-3">
          <span className={`font-medium ${isUser ? "text-blue-400" : "text-emerald-400"}`}>
            {isUser ? "You" : "Assistant"}
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
        
        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:mb-4 prose-headings:mt-6 prose-headings:mb-4 prose-h3:text-lg prose-h4:text-base prose-ul:my-4 prose-li:my-2 prose-pre:bg-zinc-800 prose-pre:border prose-pre:border-zinc-700 prose-pre:rounded-md prose-pre:p-4 prose-code:text-emerald-400 prose-strong:text-zinc-200">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        
        {message.modelInfo && message.modelInfo.description && (
          <div className="mt-4 border-t border-zinc-800 pt-3 text-xs text-zinc-400 flex items-start gap-2">
            <Info className="w-3 h-3 mt-0.5" />
            <span>{message.modelInfo.description}</span>
          </div>
        )}
      </div>
      
      <button 
        onClick={copyToClipboard}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-300 focus:opacity-100 self-start mt-1"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
