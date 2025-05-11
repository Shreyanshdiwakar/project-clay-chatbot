'use client';

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message..."
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

  return (
    <form onSubmit={handleSubmit} className="relative">
      {fileNames.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {fileNames.map((name, index) => (
            <div 
              key={index} 
              className="flex items-center bg-zinc-800 text-zinc-200 text-xs rounded-full px-3 py-1"
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
      
      <div className="flex items-center border border-zinc-700 rounded-lg bg-zinc-900 overflow-hidden focus-within:ring-2 focus-within:ring-zinc-600 transition-all">
        <button
          type="button"
          onClick={triggerFileUpload}
          disabled={disabled}
          className="p-3 text-zinc-400 hover:text-white flex-shrink-0 transition-colors"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent p-3 text-white border-none outline-none placeholder:text-zinc-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        
        <Button 
          type="submit"
          disabled={disabled || (message.trim() === '' && files.length === 0)}
          className="m-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-white transition-colors p-2"
          size="icon"
        >
          {disabled ? 
            <Loader2 className="h-5 w-5 animate-spin" /> : 
            <Send className="h-5 w-5" />
          }
        </Button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden"
      />
    </form>
  );
} 