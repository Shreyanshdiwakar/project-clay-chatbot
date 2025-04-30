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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageToSend,
          pdfContent: extractedText || profileContext || ''
        })
      });
      if (!response.ok) {
        let errorMessage = 'Failed to get response';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
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
              <TabsList className="grid w-full grid-cols-3 mb-4 bg-zinc-900">
                <TabsTrigger value="chat" className="text-sm py-2 px-4 data-[state=active]:bg-zinc-800">Chat with AI Counselor</TabsTrigger>
                <TabsTrigger value="upload" className="text-sm py-2 px-4 data-[state=active]:bg-zinc-800">Upload Common App</TabsTrigger>
                <TabsTrigger value="knowledge" className="text-sm py-2 px-4 data-[state=active]:bg-zinc-800">Knowledge Base</TabsTrigger>
              </TabsList>
              <TabsContent value="chat" className="mt-2">
                <Card className="bg-zinc-900 border-zinc-800 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-white">Start your conversation</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Ask any question about college applications, extracurricular activities, or academic planning.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-zinc-400 mb-4">Need help getting started? Try these sample questions:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleSendMessage("I'm a junior interested in Computer Science and Robotics. What extracurricular activities would strengthen my application to MIT?")}
                        className="bg-zinc-800 hover:bg-zinc-700 p-3 rounded text-sm text-left transition"
                      >
                        I'm a junior interested in Computer Science and Robotics. What extracurricular activities would strengthen my application to MIT?
                      </button>
                      <button 
                        onClick={() => handleSendMessage("How important are summer activities for college applications, and what options should I consider?")}
                        className="bg-zinc-800 hover:bg-zinc-700 p-3 rounded text-sm text-left transition"
                      >
                        How important are summer activities for college applications, and what options should I consider?
                      </button>
                      <button 
                        onClick={() => handleSendMessage("What's a good timeline for SAT/ACT prep, AP courses, and college applications during high school?")}
                        className="bg-zinc-800 hover:bg-zinc-700 p-3 rounded text-sm text-left transition"
                      >
                        What's a good timeline for SAT/ACT prep, AP courses, and college applications during high school?
                      </button>
                      <button 
                        onClick={() => handleSendMessage("I'm interested in both Biology and Engineering. How can I explore both fields before deciding on a major?")}
                        className="bg-zinc-800 hover:bg-zinc-700 p-3 rounded text-sm text-left transition"
                      >
                        I'm interested in both Biology and Engineering. How can I explore both fields before deciding on a major?
                      </button>
                    </div>
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
                  <CardContent className="flex flex-col items-center">
                    <FileUpload 
                      onFileProcess={handlePdfProcess}
                      onError={handlePdfError}
                      isCompact={false}
                      disabled={pdfUploaded}
                    />
                    {pdfUploaded && (
                      <button
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={handleReplacePdf}
                      >
                        Replace PDF
                      </button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="knowledge" className="mt-2">
                <Card className="bg-zinc-900 border-zinc-800 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-white">Knowledge Base</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Upload documents to create a searchable knowledge base for your counseling session
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                        <p className="text-zinc-400 text-sm mb-4">
                          Add PDFs, CSVs, or DOCXs containing college requirements, ECS lists, or reference materials
                        </p>
                        <LangChainFileUpload 
                          onFileProcess={handleDocumentProcess}
                          onError={handleDocumentError}
                          collection="college-data"
                          acceptedFileTypes=".pdf,.csv,.docx,.txt"
                        />
                      </div>
                      
                      <div className="border-t border-zinc-800 pt-6">
                        <h3 className="text-lg font-medium mb-2">Search Knowledge Base</h3>
                        <p className="text-zinc-400 text-sm mb-4">
                          Search your uploaded documents to find specific information
                        </p>
                        <LangChainQuery 
                          collection="college-data"
                          onError={handleKnowledgeBaseQuery}
                        />
                      </div>
                      
                      {knowledgeBaseDocuments.length > 0 && (
                        <div className="border-t border-zinc-800 pt-6">
                          <h3 className="text-lg font-medium mb-2">Uploaded Documents</h3>
                          <div className="grid gap-2">
                            {knowledgeBaseDocuments.map((doc, index) => (
                              <div key={index} className="bg-zinc-800 p-3 rounded text-sm">
                                <div className="flex justify-between">
                                  <span className="font-medium">{doc.metadata?.filename}</span>
                                  <span className="text-zinc-400">{doc.chunks} chunks</span>
                                </div>
                                <div className="text-xs text-zinc-400 mt-1">
                                  ID: {doc.documentId?.substring(0, 8)}...
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Chat conversation */}
        {messages.length > 0 && (
          <div className="flex flex-col h-full">
            <div className="flex-grow overflow-auto mb-4 space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isThinking && (
                <ThinkingIndicator steps={thinkingSteps} />
              )}
              {error && (
                <div className="p-4 rounded bg-red-900 text-white mb-4">
                  <div className="font-bold">Error</div>
                  <div>{error}</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <ChatInput onSendMessage={handleSendMessage} disabled={isThinking} />
          </div>
        )}
      </main>
    </div>
  );
}
