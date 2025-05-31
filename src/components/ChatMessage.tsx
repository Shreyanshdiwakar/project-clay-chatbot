'use client';

import { useState } from 'react';
import { Message } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import { useTheme } from 'next-themes';
import { User, Bot, Clock, Info, Copy, Check, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    <div 
      className={`py-6 px-4 md:px-6 rounded-lg flex gap-4 md:gap-6 group transition-colors ${
        isUser 
          ? "bg-zinc-900/30 hover:bg-zinc-900/40" 
          : "bg-zinc-900/10 hover:bg-zinc-900/20"
      }`}
    >
      <div 
        className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${
          isUser 
            ? "bg-blue-600/20 text-blue-400 ring-1 ring-blue-600/30" 
            : "bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-600/30"
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs py-0 h-5 text-zinc-400 border-zinc-700">
                  {message.modelInfo.name}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">{message.modelInfo.description}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:mb-4 prose-headings:mt-6 prose-headings:mb-4 prose-h3:text-lg prose-h4:text-base prose-ul:my-4 prose-li:my-1 prose-pre:bg-zinc-800 prose-pre:border prose-pre:border-zinc-700 prose-pre:rounded-md prose-pre:p-4 prose-code:text-emerald-400 prose-strong:text-zinc-200">
          <ReactMarkdown 
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {props.children}
                  <ExternalLink className="w-3 h-3 inline-block" />
                </a>
              )
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        
        {message.modelInfo && message.modelInfo.features && message.modelInfo.features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.modelInfo.features.map((feature, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-zinc-800/50 text-xs border-zinc-700/50 text-zinc-300"
              >
                {feature}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <button 
        onClick={copyToClipboard}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-300 focus:opacity-100 self-start mt-1 p-1 rounded-md hover:bg-zinc-800/50"
        aria-label={copied ? "Copied" : "Copy message"}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}