'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatInput } from '@/components/ChatInput';
import { ChatMessage } from '@/components/ChatMessage';
import { Message, ModelInfo } from '@/types/chat';
import Image from 'next/image';
import { ThinkingIndicator } from '@/components/ThinkingIndicator';
import { FileUpload } from '@/components/FileUpload';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pdfContent, setPdfContent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);
    setThinkingSteps([]);
    setError(null);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content,
          pdfContent: pdfContent // Pass the PDF content if available
        })
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to get response';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, use response status text or default error message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Create model info if available
      let modelInfo: ModelInfo | undefined = undefined;
      if (data.model) {
        modelInfo = {
          id: data.model.id || 'model-' + Date.now(),
          name: data.model.name,
          description: data.model.description,
          features: data.model.features,
          developer: data.model.developer,
          parameters: data.model.parameters
        };
      }
      
      // Add bot message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
        modelInfo
      };
      
      // If thinking steps are available, show them
      if (data.thinking && Array.isArray(data.thinking)) {
        setThinkingSteps(data.thinking);
      }
      
      // Short delay to show thinking steps
      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsThinking(false);
      }, data.thinking && data.thinking.length > 0 ? 800 : 0);
      
    } catch (err) {
      setIsThinking(false);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Error sending message:', err);
    }
  };

  const handlePdfProcess = (pdfText: string) => {
    setPdfContent(pdfText);
    
    // Add a system message to inform the user
    const systemMessage: Message = {
      id: Date.now().toString(),
      content: "✅ **Common App PDF uploaded successfully!**\n\nI've analyzed your document and can now provide personalized advice based on your profile. Feel free to ask questions about extracurricular activities that would complement your application.",
      role: 'assistant',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };

  const handlePdfError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <main className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Made sticky */}
      <header className="bg-black text-white py-4 px-6 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center">
          <Image 
            src="/projectclay.jpg"
            alt="Project Clay Logo"
            width={120}
            height={40}
            className="mr-2"
          />
        </div>
        <div className="flex items-center space-x-4">
          <a 
            href="https://www.projectclay.com/meet-your-mentors" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium hover:text-blue-400 transition-colors"
          >
            Browse mentors
          </a>
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSfyQUZWh8VcY1Zx7S8fnS45E_3I77kEGfh30Wc0v5fJzy3REw/viewform" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium hover:text-blue-400 transition-colors"
          >
            Ivy 10
          </a>
          <a 
            href="https://calendly.com/dyumnamadan01/intro-meeting?month=2025-04" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium hover:text-blue-400 transition-colors"
          >
            Book a Call
          </a>
          <a 
            href="https://chat.whatsapp.com/KfU9XRXYLIJIGkfuJsgZAj" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium hover:text-blue-400 transition-colors"
          >
            Join Community
          </a>
          <a 
            href="https://www.projectclay.com/meet-your-mentors#registrationform" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white text-black px-4 py-1.5 rounded-md text-sm font-medium flex items-center hover:bg-gray-100 transition-colors"
          >
            Register now
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 md:p-8">
        {/* Welcome section if no messages */}
        {messages.length === 0 && (
          <div className="text-center my-12 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-white">
              Any passion, any college.<br />
              We&apos;re here for you.
            </h1>
            <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
              Traditional college counselling is out of touch and expensive.<br />
              Learning new skills is hard. We pair you with an elder sibling who will guide you through it.
            </p>
            <div className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
              <p className="flex justify-center items-center gap-1">
                <span className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} className="inline-block h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></span>
                  ))}
                </span>
                Trusted by 5000+ students from 30+ countries
              </p>
            </div>
          </div>
        )}

        {/* PDF Upload component - only show if no conversation started */}
        {messages.length === 0 && (
          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Upload your Common App PDF for personalized guidance (optional)
            </p>
            <div className="flex justify-center">
              <FileUpload 
                onFileProcess={handlePdfProcess}
                onError={handlePdfError}
              />
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isThinking && (
            <div className="flex w-full my-4 justify-start">
              <div className="flex-shrink-0 mr-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 animate-pulse">
                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col max-w-[85%]">
                <div className="p-3 rounded-lg card-shadow bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none">
                  <ThinkingIndicator steps={thinkingSteps} />
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-3 my-4 bg-red-50 border border-red-200 rounded-lg text-red-600 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400">
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area - Made sticky */}
        <div className="sticky bottom-0 left-0 right-0 bg-gray-50 dark:bg-gray-900 pt-4 pb-4 border-t border-gray-200 dark:border-gray-700 shadow-md z-10">
          <div className="flex items-start mb-2">
            {/* PDF Upload button during conversation */}
            {messages.length > 0 && !pdfContent && (
              <div className="mr-2">
                <FileUpload 
                  onFileProcess={handlePdfProcess}
                  onError={handlePdfError}
                  isCompact={true}
                />
              </div>
            )}
            <div className="flex-1">
              <ChatInput onSendMessage={handleSendMessage} disabled={isThinking} />
            </div>
          </div>
          <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
            {pdfContent 
              ? "Ask personalized questions based on your Common App profile" 
              : "Ask me anything about choosing and planning extracurricular activities for college applications"}
          </p>
        </div>
      </div>
    </main>
  );
}
