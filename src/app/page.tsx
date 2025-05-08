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
import { RecommendationResponse } from '@/services/recommendations/legacy';
import { AlertCircle, BookOpen, Award, Calendar, Trophy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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

  // Student profile and recommendations states
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check for existing profile in local storage on component mount
  useEffect(() => {
    // Show questionnaire for new users
    setTimeout(() => {
      setShowQuestionnaire(true);
    }, 1000);
  }, []);

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
      
      // Include profile context if available
      const profileCtx = studentProfile ? `Student Profile: ${JSON.stringify(studentProfile)}` : '';
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageToSend,
          pdfContent: extractedText || profileContext || '',
          profileContext: profileCtx
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

  const handleProfileComplete = async (profile: StudentProfile) => {
    setStudentProfile(profile);
    setShowQuestionnaire(false);
    
    // Generate welcome message based on the profile
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `👋 **Welcome, ${profile.name}!**\n\nThanks for sharing your information. I'm generating personalized recommendations based on your profile. I'll help you navigate the college admissions process and suggest activities that align with your interests in ${profile.intendedMajor}.`,
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, welcomeMessage]);

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
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setError('Failed to generate recommendations. Please try again later.');
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
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white overflow-hidden">
      <Header />

      {/* Student Questionnaire Modal */}
      {showQuestionnaire && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
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
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="knowledgeBase">Knowledge Base</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="space-y-4 h-[calc(100vh-12rem)] flex flex-col">
            {/* Chat UI */}
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

          <TabsContent value="recommendations">
            {!studentProfile ? (
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Profile</CardTitle>
                  <CardDescription>
                    Fill out your student profile to get personalized recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert className="bg-blue-500/10 border-blue-500/30">
                      <AlertCircle className="h-5 w-5 text-blue-400" />
                      <AlertTitle>Profile Required</AlertTitle>
                      <AlertDescription>
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
              <Card>
                <CardHeader>
                  <CardTitle>Generating Recommendations</CardTitle>
                  <CardDescription>
                    Please wait while we create personalized recommendations based on your profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                  <ThinkingIndicator steps={[]} />
                </CardContent>
              </Card>
            ) : recommendations ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-400" />
                      Suggested Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {recommendations.suggestedProjects.map((project, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{project}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-400" />
                      Suggested Competitions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {recommendations.suggestedCompetitions.map((comp, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-amber-400 mt-1">•</span>
                          <span>{comp}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-400" />
                      Skills to Develop
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {recommendations.suggestedSkills.map((skill, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-400" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {recommendations.timeline.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-2">
                    <CardTitle>Profile Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300">{recommendations.profileAnalysis}</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations Not Available</CardTitle>
                  <CardDescription>
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
