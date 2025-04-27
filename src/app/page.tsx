'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatInput } from '@/components/ChatInput';
import { ChatMessage } from '@/components/ChatMessage';
import { Message, ModelInfo } from '@/types/chat';
import { FileUpload } from '@/components/FileUpload';
import { Header } from '@/components/Header';
import { ThinkingIndicator } from '@/components/ThinkingIndicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <div className="flex flex-col min-h-screen bg-black">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl text-white">
        {/* Welcome section if no messages */}
        {messages.length === 0 && (
          <div className="space-y-8 my-12">
            <div className="text-center space-y-5">
              <h1 className="text-4xl md:text-5xl font-bold">
                Any passion, any college.<br />
                <span className="text-white">We're here for you.</span>
              </h1>
              <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
                Traditional college counselling is out of touch and expensive.
                Learning new skills is hard. We pair you with an elder sibling who will guide you through it.
              </p>
              <div className="flex justify-center items-center gap-1 text-sm text-zinc-500 mt-6">
                <span className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} className="inline-block h-6 w-6 rounded-full bg-zinc-800"></span>
                  ))}
                </span>
                <span>Trusted by 5000+ students from 30+ countries</span>
              </div>
            </div>
              
            <Tabs defaultValue="chat" className="w-full max-w-3xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-zinc-900">
                <TabsTrigger value="chat" className="text-sm py-2 px-4 data-[state=active]:bg-zinc-800">Chat with AI Counselor</TabsTrigger>
                <TabsTrigger value="upload" className="text-sm py-2 px-4 data-[state=active]:bg-zinc-800">Upload Common App</TabsTrigger>
              </TabsList>
              <TabsContent value="chat" className="mt-2">
                <Card className="bg-zinc-900 border-zinc-800 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-white">Start your conversation</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Ask any question about college applications, extracurricular activities, or academic planning.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChatInput onSendMessage={handleSendMessage} isThinking={isThinking} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="upload" className="mt-2">
                <Card className="bg-zinc-900 border-zinc-800 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-white">Upload your Common App PDF</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Get personalized guidance based on your application profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <FileUpload 
                      onFileProcess={handlePdfProcess}
                      onError={handlePdfError}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Chat conversation */}
        {messages.length > 0 && (
          <div className="space-y-4 pb-20">
            {/* Display messages */}
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {/* Thinking indicator */}
            {isThinking && (
              <div className="flex w-full my-4 justify-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                      <path d="M19.7 3.268a2 2 0 0 1 2.146 3.398c-1.73 1.421-5.891 4.382-12.7 4.382-6.587 0-10.666-2.89-12.32-4.316a2 2 0 0 1 2.15-3.396c1.526 1.297 5.01 3.712 10.17 3.712 5.016 0 8.44-2.38 10.55-3.78Z" />
                      <path d="M19.7 20.732a2 2 0 0 0 2.146-3.398c-1.73-1.421-5.891-4.382-12.7-4.382-6.587 0-10.666 2.89-12.32 4.316a2 2 0 0 0 2.15 3.396c1.526-1.297 5.01-3.712 10.17-3.712 5.016 0 8.44 2.38 10.55 3.78Z" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col max-w-[80%]">
                  <ThinkingIndicator steps={thinkingSteps} />
                </div>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="bg-red-900/30 text-red-400 p-4 rounded-lg my-4 border border-red-900">
                <p className="font-medium">Error: {error}</p>
              </div>
            )}
            
            {/* Invisible div for scrolling */}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {/* Input box - fixed at bottom when conversation started */}
        {messages.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800">
            <div className="container mx-auto max-w-5xl px-4">
              <ChatInput 
                onSendMessage={handleSendMessage}
                isThinking={isThinking}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
