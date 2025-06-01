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
        const jsonMatch = response.content.match(/```json\s*(\{[\s\S]*?\})\s*```/) || 
                         response.content.match(/\{[\s\S]*"applicationProcess"[\s\S]*?\}/);
                         
        const jsonContent = jsonMatch ? jsonMatch[1] : response.content;
        const parsedResponse = JSON.parse(jsonContent);
        setAiDetails(parsedResponse);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        
        // Extract sections from the text response as a fallback
        const fallbackDetails = {
          applicationProcess: extractSection(response.content, "APPLICATION PROCESS", "PREPARATION STEPS"),
          preparationSteps: extractBulletPoints(response.content, "PREPARATION STEPS", "SUCCESS STRATEGIES"),
          successStrategies: extractBulletPoints(response.content, "SUCCESS STRATEGIES", "PAST WINNER PROFILES"),
          pastWinnerProfiles: extractBulletPoints(response.content, "PAST WINNER PROFILES", "SCHOLARSHIP INFO"),
          scholarshipInfo: extractSection(response.content, "SCHOLARSHIP INFO", "RELATED OPPORTUNITIES"),
          relatedOpportunities: extractLinks(response.content)
        };
        
        setAiDetails(fallbackDetails);
      }
    } catch (error) {
      console.error("Error generating competition details:", error);
      toast.error("Failed to load detailed guidance", { 
        description: "Please try again later" 
      });
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
  
  // Helper function to extract a section from text
  const extractSection = (text: string, startMarker: string, endMarker?: string): string => {
    const startIdx = text.indexOf(startMarker);
    if (startIdx === -1) return "";
    
    const effectiveStartIdx = startIdx + startMarker.length;
    
    if (!endMarker) return text.substring(effectiveStartIdx).trim();
    
    const endIdx = text.indexOf(endMarker, effectiveStartIdx);
    if (endIdx === -1) return text.substring(effectiveStartIdx).trim();
    
    return text.substring(effectiveStartIdx, endIdx).trim();
  };
  
  // Helper function to extract bullet points
  const extractBulletPoints = (text: string, startMarker: string, endMarker?: string): string[] => {
    const section = extractSection(text, startMarker, endMarker);
    return section
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.replace(/^[•-]\s*/, '').trim());
  };
  
  // Helper function to extract links
  const extractLinks = (text: string): { name: string; url: string; description: string }[] => {
    const section = extractSection(text, "RELATED OPPORTUNITIES");
    const links: { name: string; url: string; description: string }[] = [];
    
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)|(?:https?:\/\/[^\s]+)/g;
    const matches = Array.from(section.matchAll(linkRegex));
    
    return matches.map(match => {
      const name = match[1] || "Related Opportunity";
      const url = match[2] || match[0];
      return {
        name,
        url,
        description: "Related competition or program"
      };
    });
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
          {competition.category.map((cat, i) => (
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
                {aiDetails.preparationSteps.map((step, i) => (
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
                {aiDetails.successStrategies.map((strategy, i) => (
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
                {aiDetails.pastWinnerProfiles.map((profile, i) => (
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
              {aiDetails.relatedOpportunities.map((opportunity, i) => (
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
                  <p className="text-xs text-zinc-400 mt-1 ml-6">{opportunity.description}</p>
                </div>
              ))}
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
            {competition.eligibility.map((item, i) => (
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
          {competition.benefits.map((benefit, i) => (
            <li key={i} className="text-sm text-zinc-300">{benefit}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}