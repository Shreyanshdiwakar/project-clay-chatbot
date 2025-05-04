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
import { LangChainFileUpload } from '@/components/LangChainFileUpload';
import { LangChainQuery } from '@/components/LangChainQuery';
import { KnowledgeBaseManager } from '@/components/KnowledgeBaseManager';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [profileContext, setProfileContext] = useState<string | null>(null);
  const [pdfContent, setPdfContent] = useState<string | null>(null);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [knowledgeBaseDocuments, setKnowledgeBaseDocuments] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string, files?: File[]) => {
    // If no message but files are present, use a default message
    const messageToSend = content.trim() || (files && files.length > 0 ? 'See attached files.' : '');
    if (!messageToSend) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      role: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);
    setThinkingSteps([]);
    setError(null);

    let extractedText = '';
    let fileConfirmationMsg = '';
    if (files && files.length > 0) {
      // Prepare FormData for file upload
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      try {
        const response = await fetch('/api/process-files', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to process files');
        extractedText = data.text || '';
        setProfileContext(extractedText);
        // Confirmation message
        const typeCounts: Record<string, number> = {};
        files.forEach(f => {
          const ext = f.type.includes('pdf') ? 'PDF' : f.type.includes('jpeg') ? 'JPG' : f.type.includes('png') ? 'PNG' : 'File';
          typeCounts[ext] = (typeCounts[ext] || 0) + 1;
        });
        const typeSummary = Object.entries(typeCounts).map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`).join(', ');
        fileConfirmationMsg = `✅ Uploaded: ${typeSummary}. These will be used for your next message.`;
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: fileConfirmationMsg,
          role: 'assistant',
          timestamp: new Date()
        }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred processing files');
        setIsThinking(false);
        return;
      }
    }

    try {
      console.log('Sending message to API:', messageToSend.substring(0, 30) + (messageToSend.length > 30 ? '...' : ''));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageToSend,
          pdfContent: extractedText || profileContext || ''
        })
      });
      
      console.log('API response status:', response.status, response.statusText);
      
      let data;
      
      try {
        // Try to get response text first
        const responseText = await response.text();
        
        // Try to parse as JSON if we have content
        if (responseText && responseText.trim() !== '') {
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            console.error('Error parsing JSON response:', e);
            throw new Error('Failed to parse API response');
          }
        } else if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        } else {
          throw new Error('The API returned an empty response');
        }
      } catch (err) {
        console.error('Error reading API response:', err);
        throw new Error(`Failed to read API response: ${err instanceof Error ? err.message : String(err)}`);
      }
      
      // Validate API response
      if (!data || typeof data !== 'object') {
        throw new Error('The API response format was invalid or empty');
      }
      
      // Ensure message property exists
      if (!data.message) {
        throw new Error('The API response is missing required fields');
      }
      
      let modelInfo: ModelInfo | undefined = undefined;
      if (data.model) {
        modelInfo = {
          id: data.model.id || 'model-' + Date.now(),
          name: data.model.name || 'Unknown model',
          description: data.model.description || '',
          features: data.model.features || [],
          developer: data.model.developer || '',
          parameters: data.model.parameters || ''
        };
      }
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
        modelInfo
      };
      if (data.thinking && Array.isArray(data.thinking)) {
        setThinkingSteps(data.thinking);
      }
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
    setPdfUploaded(true);
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

  const handleReplacePdf = () => {
    setPdfContent(null);
    setPdfUploaded(false);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: '🔄 **You can now upload a new Common App PDF.**',
      role: 'assistant',
      timestamp: new Date()
    }]);
  };
  
  const handleDocumentProcess = (result: any) => {
    setKnowledgeBaseDocuments(prev => [...prev, result]);
    setError(null);
    // Add a system message to inform the user
    const systemMessage: Message = {
      id: Date.now().toString(),
      content: `✅ **Document added to knowledge base successfully!**\n\nFile: ${result.metadata?.filename}\nChunks: ${result.chunks}\n\nYou can now ask questions about this document using the search below or in regular chat.`,
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMessage]);
  };
  
  const handleDocumentError = (errorMsg: string) => {
    setError(errorMsg);
  };
  
  const handleKnowledgeBaseQuery = (error: string) => {
    if (error) {
      setError(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white overflow-hidden">
      <Header />

      <main className="flex-1 w-full p-2 md:p-4 max-w-7xl mx-auto overflow-hidden">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="knowledgeBase">Knowledge Base</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="space-y-4 h-[calc(100vh-12rem)] flex flex-col">
            {/* Rest of the chat UI */}
            <div className="flex-1 overflow-y-auto space-y-4 px-2 pt-4 pb-0">
              {messages.map(message => (
                <ChatMessage
                  key={message.id}
                  message={message}
                />
              ))}
              {isThinking && (
                <ThinkingIndicator steps={thinkingSteps} />
              )}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="pt-2">
              <ChatInput onSendMessage={handleSendMessage} disabled={isThinking} />
            </div>
          </TabsContent>
          
          <TabsContent value="knowledgeBase">
            <KnowledgeBaseManager defaultCollection="college-data" />
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure app settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-400">
                  Settings options will be available soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
