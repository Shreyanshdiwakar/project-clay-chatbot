'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
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
    if ((!message.trim() && files.length === 0) || disabled) return;
    onSendMessage(message, files.length > 0 ? files : undefined);
    setMessage('');
    setFiles([]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024;
    const validFiles = selectedFiles.filter(f => allowedTypes.includes(f.type) && f.size <= maxSize);
    setFiles(prev => [...prev, ...validFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
              disabled={disabled}
              className="resize-none min-h-24 pr-24 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus-visible:ring-zinc-700"
              rows={1}
            />
            {/* Button group: upload and send */}
            <div className="absolute right-2 bottom-2 flex gap-2">
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                multiple
                className="hidden"
                id="chat-file-upload"
                onChange={handleFileChange}
                disabled={disabled}
              />
              <label htmlFor="chat-file-upload">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
                  disabled={disabled}
                  asChild
                >
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 8l-3-3m3 3l3-3m-9 4a9 9 0 1118 0 9 9 0 01-18 0z" />
                    </svg>
                    <span className="sr-only">Upload files</span>
                  </span>
                </Button>
              </label>
              <Button
                type="submit"
                size="icon"
                disabled={disabled || (!message.trim() && files.length === 0)}
                className="bg-zinc-700 hover:bg-zinc-600"
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
          </div>
          {/* File list */}
          {files.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center bg-zinc-800 px-2 py-1 rounded text-xs text-zinc-300">
                  <span>{file.name}</span>
                  <button type="button" className="ml-2 text-red-400 hover:text-red-600" onClick={() => removeFile(idx)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="px-4 py-2 text-xs text-zinc-400 flex justify-between">
          <div>Press Enter to send, Shift+Enter for new line</div>
          {disabled && <div>Assistant is thinking...</div>}
        </CardFooter>
      </form>
    </Card>
  );
} 