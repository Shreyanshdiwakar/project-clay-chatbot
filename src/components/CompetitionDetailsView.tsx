import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, CheckCircle, Calendar, Star, 
  Loader2, ExternalLink, Award, Clock
} from 'lucide-react';
import { getModelResponse } from '@/services/openai/service';
import { toast } from 'sonner';

interface CompetitionDetailsProps {
  competition: {
    name: string;
    url?: string;
    description: string;
    eligibility: string[];
    deadline: string;
    category: string[];
    difficulty: string;
    matchScore: number;
    competitiveness: string;
    benefits: string[];
    fee?: string;
  };
}

export function CompetitionDetailsView({ competition }: CompetitionDetailsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [aiDetails, setAiDetails] = useState<{
    applicationProcess: string;
    preparationSteps: string[];
    successStrategies: string[];
    pastWinnerProfiles: string[];
    scholarshipInfo: string;
    relatedOpportunities: { name: string; url: string; description: string }[];
  } | null>(null);

  // Generate AI details when component mounts
  useEffect(() => {
    generateCompetitionDetails();
  }, [competition.name]);

  // Function to generate AI-powered competition details
  const generateCompetitionDetails = async () => {
    setIsLoading(true);
    try {
      // Create a prompt for the AI
      const prompt = `
        As an academic counselor, provide detailed guidance for a high school student interested in participating in this competition:
        
        COMPETITION: ${competition.name}
        DESCRIPTION: ${competition.description}
        DIFFICULTY: ${competition.difficulty}
        COMPETITIVENESS: ${competition.competitiveness}
        WEBSITE: ${competition.url || 'Unknown'}
        
        Please provide:
        
        1. APPLICATION PROCESS: Detailed description of how to apply for this competition, including requirements and tips.
        
        2. PREPARATION STEPS: 5-6 specific steps a student should take to prepare for this competition.
        
        3. SUCCESS STRATEGIES: 4-5 strategies that have helped students succeed in this competition.
        
        4. PAST WINNER PROFILES: Brief descriptions of 3-4 types of projects or submissions that have won in the past.
        
        5. SCHOLARSHIP INFO: Information about any scholarships, prizes, or awards associated with this competition.
        
        6. RELATED OPPORTUNITIES: 3-4 related competitions, programs, or opportunities that complement this one, with URLs.
        
        Format your response as a JSON object with these keys: applicationProcess (string), preparationSteps (array), successStrategies (array), pastWinnerProfiles (array), scholarshipInfo (string), and relatedOpportunities (array of objects with name, url, description).
        
        Make all content extremely specific, actionable, and tailored to this exact competition. Include current, working links to real resources.
      `;

      // Call the AI service
      const response = await getModelResponse(prompt, null, null, true);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to generate detailed guidance");
      }
      
      // Parse the AI response - it should be in JSON format
      try {
        // First, try to find JSON object in the response
        const jsonPattern = /```json\s*(\{[\s\S]*?\})\s*```|(\{[\s\S]*"applicationProcess"[\s\S]*?\})/;
        const jsonMatch = response.content.match(jsonPattern);
        
        let parsedData;
        if (jsonMatch) {
          // Extract the JSON string from the match
          const jsonString = jsonMatch[1] || jsonMatch[2];
          parsedData = JSON.parse(jsonString);
        } else {
          // If no JSON pattern found, try to parse the entire response
          try {
            parsedData = JSON.parse(response.content);
          } catch (parseError) {
            // If direct parsing fails, attempt to extract structured data
            parsedData = extractStructuredData(response.content);
          }
        }
        
        setAiDetails(parsedData);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        
        // Extract sections from the text response as a fallback
        const fallbackDetails = extractStructuredData(response.content);
        setAiDetails(fallbackDetails);
      }
    } catch (error) {
      console.error("Error generating competition details:", error);
      toast.error("Failed to load detailed guidance", { 
        description: "Please try again later" 
      });
      
      // Set default fallback data
      setAiDetails({
        applicationProcess: "Research the competition's official website for detailed application requirements and deadlines. Create an account on their application portal if required. Prepare all necessary documents, such as your personal statement, project description, or academic records. Review the submission guidelines carefully to ensure you meet all requirements. Have a teacher or mentor review your application before submitting. Submit well before the deadline to avoid technical issues.",
        preparationSteps: [
          "Research past winners and successful entries to understand what the judges value",
          "Create a detailed preparation timeline working backward from the deadline",
          "Gather necessary resources and materials for your project or submission",
          "Seek mentorship from teachers or professionals in your field",
          "Practice your presentation skills if the competition includes a presentation component",
          "Prepare to address common questions or challenges related to your submission"
        ],
        successStrategies: [
          "Focus on innovation and originality rather than just technical excellence",
          "Demonstrate clear real-world applications or impact of your work",
          "Document your process thoroughly, including challenges and how you overcame them",
          "Connect your project to broader issues or demonstrate interdisciplinary thinking",
          "Practice explaining your work to both experts and non-experts"
        ],
        pastWinnerProfiles: [
          "Projects that addressed significant real-world problems with innovative solutions",
          "Work that demonstrated exceptional creativity and original thinking",
          "Submissions showing strong research methodology and scientific rigor",
          "Projects that effectively communicated complex concepts in accessible ways"
        ],
        scholarshipInfo: "This competition typically offers recognition and awards to top performers. Prizes may include monetary scholarships, certificates, trophies, or special opportunities like internships or mentorships. Winners often receive recognition that can be valuable for college applications and résumés. Check the competition's official website for the most current information about specific award amounts and types.",
        relatedOpportunities: [
          {
            name: "Similar National Competition",
            url: "https://www.example.org/national-competition",
            description: "Another prestigious competition in this field with different timing"
          },
          {
            name: "Summer Research Program",
            url: "https://www.example.org/summer-research",
            description: "Research opportunity that builds skills relevant to this competition"
          },
          {
            name: "Online Learning Community",
            url: "https://www.example.org/learning-community",
            description: "Platform to connect with other students interested in this field"
          },
          {
            name: "Mentorship Program",
            url: "https://www.example.org/mentorship",
            description: "Get guidance from professionals in this field"
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to extract structured data from text response
  const extractStructuredData = (text) => {
    return {
      applicationProcess: extractSection(text, "APPLICATION PROCESS", "PREPARATION STEPS") || 
        "Research the competition's official website for detailed application requirements and deadlines. Create an account on their application portal if required. Prepare all necessary documents and follow submission guidelines carefully.",
      
      preparationSteps: extractListItems(text, "PREPARATION STEPS", "SUCCESS STRATEGIES") || [
        "Research past winners and successful entries",
        "Create a detailed preparation timeline",
        "Gather necessary resources and materials",
        "Seek mentorship from teachers or professionals",
        "Practice your presentation skills"
      ],
      
      successStrategies: extractListItems(text, "SUCCESS STRATEGIES", "PAST WINNER PROFILES") || [
        "Focus on innovation and originality",
        "Demonstrate clear real-world applications",
        "Document your process thoroughly",
        "Connect your project to broader issues"
      ],
      
      pastWinnerProfiles: extractListItems(text, "PAST WINNER PROFILES", "SCHOLARSHIP INFO") || [
        "Projects that addressed significant real-world problems",
        "Work that demonstrated exceptional creativity",
        "Submissions showing strong research methodology",
        "Projects that effectively communicated complex concepts"
      ],
      
      scholarshipInfo: extractSection(text, "SCHOLARSHIP INFO", "RELATED OPPORTUNITIES") || 
        "This competition typically offers recognition and awards to top performers. Check the competition's official website for the most current information about specific award amounts and types.",
      
      relatedOpportunities: extractOpportunities(text) || [
        {
          name: "Similar Competition",
          url: "https://www.example.org/similar-competition",
          description: "Another competition in this field"
        },
        {
          name: "Summer Program",
          url: "https://www.example.org/summer-program",
          description: "Build skills relevant to this competition"
        }
      ]
    };
  };
  
  // Helper function to extract a section from text
  const extractSection = (text, startMarker, endMarker) => {
    const startIdx = text.indexOf(startMarker);
    if (startIdx === -1) return "";
    
    const effectiveStartIdx = startIdx + startMarker.length;
    
    if (!endMarker) return text.substring(effectiveStartIdx).trim();
    
    const endIdx = text.indexOf(endMarker, effectiveStartIdx);
    if (endIdx === -1) return text.substring(effectiveStartIdx).trim();
    
    return text.substring(effectiveStartIdx, endIdx).trim();
  };
  
  // Helper function to extract bullet points
  const extractListItems = (text, startMarker, endMarker) => {
    const section = extractSection(text, startMarker, endMarker);
    if (!section) return [];
    
    return section
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().match(/^\d+\./))
      .map(line => line.replace(/^[•-]\d+\.\s*/, '').trim());
  };
  
  // Helper function to extract opportunities
  const extractOpportunities = (text) => {
    const section = extractSection(text, "RELATED OPPORTUNITIES");
    if (!section) return [];
    
    const opportunities = [];
    const lines = section.split('\n').filter(line => line.trim().length > 0);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Try to extract markdown links [name](url)
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        opportunities.push({
          name: linkMatch[1],
          url: linkMatch[2],
          description: lines[i+1]?.trim() || "Related opportunity"
        });
        i++; // Skip the next line as we've used it for description
        continue;
      }
      
      // Try to extract URLs
      const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        opportunities.push({
          name: line.replace(urlMatch[0], '').trim() || "Related Opportunity",
          url: urlMatch[0],
          description: lines[i+1]?.trim() || "Related opportunity"
        });
        i++; // Skip the next line as we've used it for description
        continue;
      }
      
      // If this looks like a heading (short line without punctuation)
      if (line.length < 50 && !line.includes('.') && !line.trim().startsWith('-')) {
        opportunities.push({
          name: line.trim(),
          url: "https://www.google.com/search?q=" + encodeURIComponent(line.trim()),
          description: lines[i+1]?.trim() || "Related opportunity"
        });
        i++; // Skip the next line
      }
    }
    
    return opportunities;
  };

  return (
    <div className="space-y-5">
      {/* Competition header */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          {competition.name}
        </h2>
        
        <div className="flex gap-2 flex-wrap mb-3">
          <Badge variant="outline" className="bg-amber-900/20 text-amber-300 border-amber-700/30">
            {competition.difficulty}
          </Badge>
          <Badge variant="outline" className="bg-red-900/20 text-red-300 border-red-700/30">
            {competition.competitiveness} competition
          </Badge>
          {Array.isArray(competition.category) && competition.category.map((cat, i) => (
            <Badge key={i} variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700/30">
              {cat}
            </Badge>
          ))}
        </div>
        
        <p className="text-zinc-300">{competition.description}</p>
        
        {competition.url && (
          <a 
            href={competition.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 hover:underline mt-3"
          >
            <ExternalLink className="h-4 w-4" />
            Visit Official Website
          </a>
        )}
      </div>
      
      <Separator className="bg-zinc-800" />
      
      {/* AI-generated detailed guidance */}
      {isLoading ? (
        <div className="py-10 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
          <p className="text-zinc-400 text-center">Generating personalized guidance for this competition...</p>
          <p className="text-zinc-500 text-sm text-center">This may take a moment as we research current information about this competition.</p>
        </div>
      ) : aiDetails ? (
        <div className="space-y-6">
          {/* Application Process */}
          <div>
            <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" /> Application Process
            </h3>
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
              <p className="text-zinc-300 whitespace-pre-line">{aiDetails.applicationProcess}</p>
            </div>
          </div>
          
          {/* Preparation Steps */}
          <div>
            <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" /> Preparation Steps
            </h3>
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
              <ul className="space-y-2">
                {Array.isArray(aiDetails.preparationSteps) && aiDetails.preparationSteps.map((step, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-zinc-300">{step}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Success Strategies */}
          <div>
            <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" /> Success Strategies
            </h3>
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
              <ul className="space-y-2">
                {Array.isArray(aiDetails.successStrategies) && aiDetails.successStrategies.map((strategy, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-zinc-300">{strategy}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Past Winner Profiles */}
          <div>
            <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-400" /> Past Winner Profiles
            </h3>
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
              <ul className="space-y-2">
                {Array.isArray(aiDetails.pastWinnerProfiles) && aiDetails.pastWinnerProfiles.map((profile, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-zinc-300">{profile}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Scholarship Info */}
          <div>
            <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-green-400" /> Scholarship & Awards Information
            </h3>
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
              <p className="text-zinc-300 whitespace-pre-line">{aiDetails.scholarshipInfo}</p>
            </div>
          </div>
          
          {/* Related Opportunities */}
          <div>
            <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-blue-400" /> Related Opportunities
            </h3>
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 space-y-3">
              {Array.isArray(aiDetails.relatedOpportunities) && aiDetails.relatedOpportunities.length > 0 ? (
                aiDetails.relatedOpportunities.map((opportunity, i) => (
                  <div key={i} className="flex flex-col">
                    <a 
                      href={opportunity.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-2 items-center text-blue-400 hover:text-blue-300 hover:underline font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{opportunity.name}</span>
                    </a>
                    <p className="text-xs text-zinc-400 mt-1 ml-6">{opportunity.description || ""}</p>
                  </div>
                ))
              ) : (
                <p className="text-zinc-400">No related opportunities available. Try searching for similar competitions in this field.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-zinc-400">Failed to load detailed guidance.</p>
          <Button 
            variant="link" 
            className="text-blue-400 mt-2"
            onClick={generateCompetitionDetails}
          >
            Try Again
          </Button>
        </div>
      )}
      
      {/* Basic competition info (shown regardless of AI content) */}
      <Separator className="bg-zinc-800" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" /> Eligibility
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {Array.isArray(competition.eligibility) && competition.eligibility.map((item, i) => (
              <li key={i} className="text-sm text-zinc-300">{item}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-red-400" /> Key Information
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Deadline:</span>
              <span className="text-zinc-300">{competition.deadline}</span>
            </div>
            {competition.fee && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Fee:</span>
                <span className="text-zinc-300">{competition.fee}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Competitiveness:</span>
              <span className="text-zinc-300">{competition.competitiveness}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-400" /> Benefits
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          {Array.isArray(competition.benefits) && competition.benefits.map((benefit, i) => (
            <li key={i} className="text-sm text-zinc-300">{benefit}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}