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
      content: "👋 Hello! I'm your Educational Consultant specializing in international university admissions. I'm here to help you navigate the process of applying to universities worldwide, including the US, UK, Canada, Australia, Europe, and Asia.\n\n**How can I assist you today?**\n\n- Need help with university selection?\n- Questions about standardized tests like SAT, ACT, TOEFL, or IELTS?\n- Want guidance on application timelines?\n- Looking for scholarship information?\n- Need advice on personal statements or essays?\n\nPlease share some details about your academic background, target countries, and intended major so I can provide personalized guidance!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showThinking, setShowThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [modelInfo, setModelInfo] = useState<ChatResponse['model'] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const minimumThinkingTime = 3000; // 3 seconds minimum thinking time

  useEffect(() => {
    const checkApiConfig = async () => {
      try {
        const response = await fetch('/api/check-env');
        if (response.ok) {
          const data = await response.json();
          setApiKeyConfigured(data.openaiApiKey === 'set');
          
          if (data.openaiApiKey !== 'set') {
            setMessages(prev => [
              ...prev,
              {
                id: 'api-warning',
                role: 'assistant',
                content: 'The OpenAI API key is not configured. Please add your API key to the .env.local file and restart the application.'
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


  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const toggleSearchMode = () => {
    setIsSearchMode(prev => !prev);
    inputRef.current?.focus();
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;


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
          content: "I can't process your request because the OpenAI API key is not configured. Please add your API key to the .env.local file and restart the application."
        }
      ]);
      setInput('');
      return;
    }


    setAuthError(null);
    setModelInfo(null);


    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };


    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);



    setThinkingSteps([
      "Processing your question...",
      "Analyzing context...",
      "Retrieving relevant information..."
    ]);

    try {

      const startTime = Date.now();
      
      // Set the appropriate API endpoint based on search mode
      const endpoint = isSearchMode ? '/api/websearch' : '/api/chat';
      console.log(`Sending message to ${isSearchMode ? 'Web Search' : 'Chat'} API:`, input);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      console.log('API response status:', response.status);
      const data: ChatResponse = await response.json();
      console.log('API response data:', data);


      if (data.thinking && data.thinking.length > 0) {
        setThinkingSteps(data.thinking);
      }


      if (data.model) {
        setModelInfo(data.model);
      }


      const elapsedTime = Date.now() - startTime;

      
      if (elapsedTime < minimumThinkingTime) {
        await new Promise(resolve => setTimeout(resolve, minimumThinkingTime - elapsedTime));
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Failed to get response';
        console.error('API error:', errorMessage);
        

        if (errorMessage.includes('No auth credentials found') || 
            errorMessage.includes('Authentication failed') || 
            errorMessage.includes('401')) {
          setAuthError(errorMessage);
          setApiKeyConfigured(false);
        }
        
        throw new Error(errorMessage);
      }


      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        modelInfo: data.model
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error details:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key and try again.`
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);



      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };


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
      
      <form onSubmit={handleSubmit} className="border-t dark:border-zinc-700 p-4 bg-white dark:bg-zinc-800">
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
              className={`w-full border-2 rounded-lg py-3 px-4 pr-36 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-zinc-700 dark:text-white transition-colors ${
                isSearchMode 
                  ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/10' 
                  : 'border-zinc-300 dark:border-zinc-600'
              }`}
            />
            <div className="absolute right-2 bottom-2 flex space-x-2">
              <button
                type="button"
                onClick={toggleSearchMode}
                disabled={loading}
                className={`flex items-center text-white py-2 px-3 rounded-lg shadow-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  isSearchMode 
                    ? 'bg-indigo-600 hover:bg-indigo-700 ring-2 ring-indigo-400 ring-opacity-50' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
                aria-label={`${isSearchMode ? 'Disable' : 'Enable'} web search`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
                  <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">
                  {isSearchMode ? 'Web' : 'Search'}
                </span>
              </button>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
              </button>
            </div>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex justify-between">
            <div className="flex items-center space-x-2">
              <span>Press <kbd className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded">Ctrl</kbd>+<kbd className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded">Enter</kbd> to send</span>
              {isSearchMode && (
                <div className="flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 animate-pulse mr-1.5"></span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Web Search Mode Active</span>
                </div>
              )}
            </div>
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
