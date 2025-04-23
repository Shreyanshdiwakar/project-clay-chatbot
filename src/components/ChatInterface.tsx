'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { LoadingSpinner } from './LoadingSpinner';

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your academic counselor. I can help you plan extracurricular activities that align with your college goals. To get started, could you tell me what grade you're in and what your interests are?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Create new user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send request to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add assistant response to chat
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.'
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      // Focus back on input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Handle Ctrl+Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {loading && <LoadingSpinner />}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex flex-col space-y-3">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={loading}
              rows={1}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 bottom-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
            <span>Press <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Ctrl</kbd>+<kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Enter</kbd> to send</span>
            {loading && <span>Thinking...</span>}
          </div>
        </div>
      </form>
    </div>
  );
}; 