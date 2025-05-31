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
import { StudentQuestionnaire, StudentProfile } from '@/components/StudentQuestionnaire';
import { generateRecommendations } from '@/services/recommendations';
import { RecommendationResponse, EnhancedRecommendationResponse } from '@/services/recommendations/types';
import { AlertCircle, BookOpen, Award, Calendar, Trophy, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [profileContext, setProfileContext] = useState<string | null>(null);
  const [pdfContent, setPdfContent] = useState<string | null>(null);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [knowledgeBaseDocuments, setKnowledgeBaseDocuments] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Student profile and recommendations states
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | EnhancedRecommendationResponse | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "👋 **Welcome to ProjectClay's Academic Counselor!**\n\nI'm here to help you plan your extracurricular activities and prepare for college applications. I'm powered by GPT-4.1 Mini to provide you with accurate and helpful guidance.\n\nHere's how I can assist you:\n\n- **Recommend extracurricular activities** based on your interests\n- **Suggest competitions and programs** to enhance your profile\n- **Help develop skills** relevant to your intended major\n- **Create a personalized timeline** for your college preparation\n\nTo get started, complete the student profile questionnaire or ask me a question!",
        timestamp: new Date(),
        modelInfo: {
          id: 'gpt-4.1-mini',
          name: 'GPT-4.1 Mini',
          description: 'OpenAI\'s efficient model with fast response times',
          features: ['Academic Advising', 'College Planning', 'Extracurricular Suggestions'],
          developer: 'OpenAI',
          parameters: '8 billion'
        }
      }]);
    }
  }, [messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show questionnaire for new users
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowQuestionnaire(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const toggleSearchMode = () => {
    setIsSearchMode(prev => !prev);
    toast.info(prev => 
      prev ? "Web search disabled" : "Web search enabled - Powered by GPT-4.1 Mini", 
      {
        icon: prev => prev ? '🔍' : '🌐'
      }
    );
  };

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
      // Always use the chat endpoint, which now handles web search
      const endpoint = '/api/chat';
      console.log(`Sending message to Chat API${isSearchMode ? ' with web search' : ''}:`, 
        messageToSend.substring(0, 30) + (messageToSend.length > 30 ? '...' : ''));
      
      // Include profile context if available
      const profileCtx = studentProfile ? `Student Profile: ${JSON.stringify(studentProfile)}` : '';
      
      // Log the request payload for debugging
      const requestPayload = { 
        message: messageToSend,
        pdfContent: extractedText || profileContext || '',
        profileContext: profileCtx,
        isWebSearch: isSearchMode
      };
      console.log('Request payload:', JSON.stringify(requestPayload).substring(0, 200) + '...');
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      
      console.log('API response status:', response.status, response.statusText);
      
      let data;
      
      // First check if the response was successful
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText.substring(0, 500));
        
        // Try to parse the error as JSON if possible
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || `API error: ${response.status} ${response.statusText}`);
        } catch (parseError) {
          // If parsing fails, it's not a JSON response
          throw new Error(`API error (${response.status}): ${response.statusText}`);
        }
      }
      
      try {
        // For successful responses, try to get response as JSON directly
        data = await response.json();
      } catch (e) {
        console.error('Error parsing JSON from successful response:', e);
        
        // Try to read as text and then parse
        try {
          const responseText = await response.text();
          console.error('Raw response text:', responseText.substring(0, 500));
          
          if (responseText && responseText.trim() !== '') {
            data = JSON.parse(responseText);
          } else {
            throw new Error('The API returned an empty response');
          }
        } catch (textError) {
          console.error('Failed to process response:', textError);
          throw new Error('Failed to parse API response');
        }
      }
      
      // Validate API response
      if (!data || typeof data !== 'object') {
        console.error('Invalid API response format:', data);
        throw new Error('The API response format was invalid or empty');
      }
      
      // Check for error field in the response
      if (data.error) {
        console.error('API returned error:', data.error);
        throw new Error(`API error: ${data.error}`);
      }
      
      // Ensure message property exists
      if (!data.message) {
        console.error('Missing message in API response:', data);
        throw new Error('The API response is missing required fields');
      }
      
      let modelInfo: ModelInfo | undefined = undefined;
      if (data.model) {
        modelInfo = {
          id: data.model.id || 'gpt-4.1-mini',
          name: data.model.name || 'GPT-4.1 Mini',
          description: data.model.description || 'OpenAI\'s newest model with improved efficiency and reasoning capabilities',
          features: data.model.features || ['Fast Response', 'Reasoning', 'Problem-solving', 'Cost-effective'],
          developer: data.model.developer || 'OpenAI',
          parameters: data.model.parameters || '8 billion'
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
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error sending message:', err);
      
      toast.error('Error sending message', {
        description: errorMessage
      });
      
      // Add an error message to the chat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `❌ Error: ${errorMessage}. Please try again later.`,
        role: 'assistant',
        timestamp: new Date()
      }]);
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
    toast.success('PDF uploaded successfully', {
      description: 'Document has been analyzed and is ready for reference'
    });
  };

  const handlePdfError = (errorMsg: string) => {
    setError(errorMsg);
    toast.error('PDF upload failed', {
      description: errorMsg
    });
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
    toast.info('Ready for new document', {
      description: 'You can now upload a different document'
    });
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
    toast.success('Document added to knowledge base', {
      description: `${result.metadata?.filename} processed with ${result.chunks} chunks`
    });
  };
  
  const handleDocumentError = (errorMsg: string) => {
    setError(errorMsg);
    toast.error('Document processing failed', {
      description: errorMsg
    });
  };
  
  const handleKnowledgeBaseQuery = (error: string) => {
    if (error) {
      setError(error);
      toast.error('Query failed', {
        description: error
      });
    }
  };

  const handleProfileComplete = async (profile: StudentProfile) => {
    setStudentProfile(profile);
    setShowQuestionnaire(false);
    
    // Generate welcome message based on the profile
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `👋 **Welcome, ${profile.name}!**\n\nThanks for sharing your information. I'm generating personalized recommendations based on your profile. I'll help you navigate the college admissions process and suggest activities that align with your interests in ${profile.intendedMajor}.`,
      role: 'assistant',
      timestamp: new Date(),
      modelInfo: {
        id: 'gpt-4.1-mini',
        name: 'GPT-4.1 Mini',
        description: 'OpenAI\'s newest model with improved efficiency and reasoning capabilities',
        features: ['Fast Response', 'Reasoning', 'Problem-solving', 'Cost-effective'],
        developer: 'OpenAI',
        parameters: '8 billion'
      }
    };
    setMessages(prev => [...prev, welcomeMessage]);
    toast.success('Profile created successfully', {
      description: 'Generating your personalized recommendations'
    });

    // Generate recommendations
    setIsLoadingRecommendations(true);
    try {
      const recs = await generateRecommendations(profile);
      setRecommendations(recs);
      
      // Add a message about the recommendations
      const recsMessage: Message = {
        id: Date.now().toString(),
        content: "✅ **Your personalized recommendations are ready!**\n\nI've created tailored suggestions for projects, competitions, and skills to develop. You can view them in the Recommendations tab. Feel free to ask me any questions about these recommendations or college admissions in general.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, recsMessage]);
      toast.success('Recommendations ready', {
        description: 'View them in the Recommendations tab'
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setError('Failed to generate recommendations. Please try again later.');
      toast.error('Recommendations failed', {
        description: 'Please try again later'
      });
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleSkipQuestionnaire = () => {
    setShowQuestionnaire(false);
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: "👋 **Welcome to the College Counseling Assistant!**\n\nYou can always complete the student profile questionnaire later to get personalized recommendations. Feel free to ask any questions about college admissions, applications, or academic planning.",
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, welcomeMessage]);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-zinc-950 text-white overflow-hidden">
        <Header />

        {/* Student Questionnaire Modal */}
        {showQuestionnaire && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="w-full max-w-2xl">
              <StudentQuestionnaire 
                onComplete={handleProfileComplete} 
                onSkip={handleSkipQuestionnaire} 
              />
            </div>
          </div>
        )}

        <main className="flex-1 w-full p-2 md:p-4 max-w-7xl mx-auto overflow-hidden">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4 bg-zinc-900 p-1 rounded-xl">
              <TabsTrigger value="chat" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Chat</TabsTrigger>
              <TabsTrigger value="recommendations" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Recommendations</TabsTrigger>
              <TabsTrigger value="knowledgeBase" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Knowledge Base</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="space-y-4 h-[calc(100vh-12rem)] flex flex-col">
              {/* Chat UI */}
              <div className="flex-1 overflow-y-auto space-y-4 px-2 pt-4 pb-0 hide-scrollbar">
                {messages.map(message => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                  />
                ))}
                {isThinking && (
                  <ThinkingIndicator steps={thinkingSteps} model="GPT-4.1 Mini" />
                )}
                {error && (
                  <Alert variant="destructive\" className="bg-red-950/30 border-red-800/30 text-red-300">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertTitle className="text-red-300">Error</AlertTitle>
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="pt-2">
                <ChatInput 
                  onSendMessage={handleSendMessage} 
                  disabled={isThinking} 
                  isSearchMode={isSearchMode}
                  onToggleSearchMode={toggleSearchMode}
                  placeholder="Ask about college planning, activities, or admissions..."
                />
              </div>
            </TabsContent>

            <TabsContent value="recommendations">
              {!studentProfile ? (
                <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-zinc-100">Complete Your Profile</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Fill out your student profile to get personalized recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert className="bg-blue-950/20 border-blue-800/30">
                        <AlertCircle className="h-5 w-5 text-blue-400" />
                        <AlertTitle className="text-blue-300">Profile Required</AlertTitle>
                        <AlertDescription className="text-blue-200">
                          Complete the student questionnaire to get personalized recommendations for your college journey.
                        </AlertDescription>
                      </Alert>
                      <Button 
                        onClick={() => setShowQuestionnaire(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Start Questionnaire
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : isLoadingRecommendations ? (
                <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-zinc-100">Generating Recommendations</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Please wait while we create personalized recommendations based on your profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center py-8">
                    <ThinkingIndicator steps={[]} model="GPT-4.1 Mini" />
                  </CardContent>
                </Card>
              ) : recommendations ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-zinc-100">
                        <BookOpen className="h-5 w-5 text-blue-400" />
                        Suggested Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {recommendations.suggestedProjects.map((project, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="text-blue-400 mt-1">•</span>
                            <span className="text-zinc-300">{project}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-zinc-100">
                        <Trophy className="h-5 w-5 text-amber-400" />
                        Suggested Competitions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {recommendations.suggestedCompetitions.map((comp, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="text-amber-400 mt-1">•</span>
                            <span className="text-zinc-300">{comp}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-zinc-100">
                        <Award className="h-5 w-5 text-purple-400" />
                        Skills to Develop
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {recommendations.suggestedSkills.map((skill, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="text-purple-400 mt-1">•</span>
                            <span className="text-zinc-300">{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-zinc-100">
                        <Calendar className="h-5 w-5 text-green-400" />
                        Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {recommendations.timeline.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="text-green-400 mt-1">•</span>
                            <span className="text-zinc-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2 bg-zinc-900 border-zinc-800 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-zinc-100">Profile Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-300">{recommendations.profileAnalysis}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-zinc-100">Recommendations Not Available</CardTitle>
                    <CardDescription className="text-zinc-400">
                      There was an issue generating your recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => handleProfileComplete(studentProfile)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="knowledgeBase">
              <KnowledgeBaseManager defaultCollection="college-data" />
            </TabsContent>
            
            <TabsContent value="settings">
              <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-zinc-100">Settings</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Configure app settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <h3 className="text-md font-medium mb-2 text-zinc-200">Model Configuration</h3>
                    <p className="text-sm text-zinc-400 mb-3">
                      This app is configured to use GPT-4.1 Mini for optimal performance and faster response times.
                    </p>
                    <div className="bg-zinc-800 p-3 rounded-lg border border-zinc-700">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-zinc-300 text-sm">GPT-4.1 Mini</span>
                        </div>
                        <Badge variant="outline" className="bg-zinc-700/50">Active</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <h3 className="text-md font-medium mb-2 text-zinc-200">Web Search</h3>
                    <p className="text-sm text-zinc-400 mb-3">
                      Enable web search to get information from the internet when you need it.
                    </p>
                    <Button
                      onClick={toggleSearchMode}
                      variant={isSearchMode ? "default" : "outline"}
                      className={isSearchMode ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      {isSearchMode ? "Web Search Enabled" : "Web Search Disabled"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </TooltipProvider>
  );
}