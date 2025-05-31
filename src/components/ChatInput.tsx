'use client';

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Send, Loader2, Search, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  isSearchMode?: boolean;
  onToggleSearchMode?: () => void;
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message...",
  isSearchMode = false,
  onToggleSearchMode = () => {}
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
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
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 180)}px`;
          }}
        />
        
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