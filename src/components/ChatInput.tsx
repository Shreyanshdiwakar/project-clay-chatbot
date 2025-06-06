'use client';

import { useState, useRef, FormEvent, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Send, Loader2, Search, Sparkles, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  isSearchMode?: boolean;
  onToggleSearchMode?: () => void;
  timeoutOccurred?: boolean;
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message...",
  isSearchMode = false,
  onToggleSearchMode = () => {},
  timeoutOccurred = false
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [messageLength, setMessageLength] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Warn about overly long messages
  const MAX_RECOMMENDED_LENGTH = 4000;

  useEffect(() => {
    setMessageLength(message.length);
  }, [message]);

  useEffect(() => {
    if (timeoutOccurred && isSearchMode) {
      toast.error('Your last web search timed out', {
        description: 'Try a shorter query or disable web search',
        action: {
          label: 'Disable Web Search',
          onClick: onToggleSearchMode
        }
      });
    }
  }, [timeoutOccurred, isSearchMode, onToggleSearchMode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Warn about very long messages but still allow them
    if (message.length > MAX_RECOMMENDED_LENGTH) {
      toast.warning('Your message is quite long', {
        description: 'Long messages may be truncated or take longer to process'
      });
    }
    
    if (message.trim() || files.length > 0) {
      onSendMessage(message, files.length > 0 ? files : undefined);
      setMessage('');
      setFiles([]);
      setFileNames([]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      setFileNames(selectedFiles.map(file => file.name));
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setFileNames(fileNames.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      {fileNames.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {fileNames.map((name, index) => (
            <div 
              key={index} 
              className="flex items-center bg-zinc-800 text-zinc-200 text-xs rounded-full px-3 py-1 border border-zinc-700"
            >
              <span className="truncate max-w-[150px]">{name}</span>
              <button 
                type="button" 
                onClick={() => removeFile(index)}
                className="ml-2 text-zinc-400 hover:text-zinc-200"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className={`flex flex-col border ${isSearchMode ? 'border-indigo-600/70' : 'border-zinc-700'} rounded-xl bg-zinc-900 overflow-hidden focus-within:ring-2 focus-within:ring-zinc-600 shadow-lg transition-all`}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isSearchMode ? "Search the web with GPT-4.1 Mini..." : placeholder}
          disabled={disabled}
          className={`w-full bg-transparent p-3 px-4 text-white border-none outline-none placeholder:text-zinc-500 resize-none min-h-[60px] max-h-[180px] ${isSearchMode ? 'bg-indigo-900/5' : ''}`}
          rows={1}
          style={{
            height: 'auto',
            overflow: 'hidden'
          }}
        />
        
        {messageLength > MAX_RECOMMENDED_LENGTH && (
          <div className="px-4 py-1 bg-yellow-900/20 border-t border-yellow-700/30">
            <div className="flex items-center text-yellow-400 text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              <span>Long messages may take longer to process or be truncated ({messageLength.toLocaleString()} characters)</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center px-2 py-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={triggerFileUpload}
            disabled={disabled}
            className="p-2 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 flex-shrink-0 transition-colors"
            aria-label="Attach files"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          
          <div className="flex-1"></div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                type="button"
                onClick={onToggleSearchMode}
                disabled={disabled}
                className={`mx-1 rounded-md ${
                  isSearchMode 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                } transition-colors p-2`}
                size="icon"
              >
                <Search className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isSearchMode ? 'Disable web search' : 'Enable web search'}
            </TooltipContent>
          </Tooltip>
          
          <Button 
            type="submit"
            disabled={disabled || (message.trim() === '' && files.length === 0)}
            className="mx-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors p-2"
            size="icon"
          >
            {disabled ? 
              <Loader2 className="h-5 w-5 animate-spin" /> : 
              <Send className="h-5 w-5" />
            }
          </Button>
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden"
      />
      
      {isSearchMode && (
        <div className="mt-2 flex items-center text-xs text-indigo-400 px-2">
          <Sparkles className="w-3 h-3 mr-1.5 animate-pulse" />
          <span>Web search powered by GPT-4.1 Mini</span>
        </div>
      )}
    </form>
  );
}