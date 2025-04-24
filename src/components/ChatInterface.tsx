'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, ModelInfo, ChatResponse } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { LoadingSpinner } from './LoadingSpinner';
import { ApiKeySetupHelp } from './ApiKeySetupHelp';
import { ThinkingAnimation } from './ThinkingAnimation';

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your academic counselor powered by DeepSeek r1. I can help you plan extracurricular activities that align with your college goals. To get started, could you tell me what grade you're in and what your interests are?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showThinking, setShowThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[] | undefined>(undefined);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check API configuration on load
  useEffect(() => {
    const checkApiConfig = async () => {
      try {
        const response = await fetch('/api/check-env');
        if (response.ok) {
          const data = await response.json();
          setApiKeyConfigured(data.openrouterApiKey === 'set');
          
          if (data.openrouterApiKey !== 'set') {
            // Add a warning message if API key is not configured
            setMessages(prev => [
              ...prev,
              {
                id: 'api-warning',
                role: 'assistant',
                content: "⚠️ Warning: The OpenRouter API key is not configured. Please add your API key to the .env.local file to use this chatbot. You can sign up for an API key at https://openrouter.ai."
              }
            ]);
            setAuthError('API key is missing in the .env.local file');
          }
        }
      } catch (error) {
        console.error('Failed to check API configuration:', error);
      }
    };
    
    checkApiConfig();
  }, []);

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
  }, [messages, showThinking]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // If API key is not configured, show a message
    if (apiKeyConfigured === false) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'user',
          content: input
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I can't process your request because the OpenRouter API key is not configured. Please add your API key to the .env.local file and restart the application."
        }
      ]);
      setInput('');
      return;
    }

    // Clear any previous auth errors
    setAuthError(null);
    setModelInfo(null);

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
    setShowThinking(true); // Show thinking animation

    // Generate some initial thinking steps while waiting for API response
    setThinkingSteps([
      "Processing your question...",
      "Analyzing context...",
      "Retrieving relevant information..."
    ]);

    try {
      // Delay to allow thinking animation to show for at least 3 seconds
      const startTime = Date.now();
      
      // Send request to API
      console.log('Sending message to API:', input);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      console.log('API response status:', response.status);
      const data: ChatResponse = await response.json();
      console.log('API response data:', data);

      // Update thinking steps if they're provided in the response
      if (data.thinking && data.thinking.length > 0) {
        setThinkingSteps(data.thinking);
      }

      // Store model information
      if (data.model) {
        setModelInfo(data.model);
      }

      // Calculate elapsed time and add delay if needed
      const elapsedTime = Date.now() - startTime;
      const minimumThinkingTime = 3000; // 3 seconds minimum
      
      if (elapsedTime < minimumThinkingTime) {
        await new Promise(resolve => setTimeout(resolve, minimumThinkingTime - elapsedTime));
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Failed to get response';
        console.error('API error:', errorMessage);
        
        // Check for authentication errors
        if (errorMessage.includes('No auth credentials found') || 
            errorMessage.includes('Authentication failed') || 
            errorMessage.includes('401')) {
          setAuthError(errorMessage);
          setApiKeyConfigured(false);
        }
        
        throw new Error(errorMessage);
      }

      // Add assistant response to chat with model information but without model tag
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        modelInfo: data.model
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error details:', error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key and try again.`
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setShowThinking(false); // Hide thinking animation
      setThinkingSteps(undefined); // Clear thinking steps
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
        {showThinking && <ThinkingAnimation thinkingSteps={thinkingSteps} />}
        {loading && !showThinking && <LoadingSpinner />}
        {authError && <ApiKeySetupHelp error={authError} />}
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
            {loading && (
              <span>
                {showThinking ? `${modelInfo?.name || 'DeepSeek r1'} is thinking...` : "Loading..."}
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}; 