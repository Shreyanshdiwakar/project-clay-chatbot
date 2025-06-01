import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, CheckCircle, List, ArrowUpRight, 
  Loader2, ExternalLink, Calendar, Clock
} from 'lucide-react';
import { getModelResponse } from '@/services/openai/service';
import { toast } from 'sonner';

interface ProjectDetailsProps {
  project: {
    name: string;
    description: string;
    complexity: string;
    timeframe: string;
    category: string[];
    skillsRequired?: string[];
    skillsDeveloped: string[];
    steps: string[];
    resources: {
      name: string;
      url: string;
    }[];
    matchScore: number;
  };
}

export function ProjectDetailsView({ project }: ProjectDetailsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [aiDetails, setAiDetails] = useState<{
    detailedPlan: string;
    resourceLinks: { name: string; url: string; description: string }[];
    tips: string[];
    timeline: { phase: string; tasks: string[] }[];
  } | null>(null);

  // Generate AI details when component mounts
  useEffect(() => {
    generateProjectDetails();
  }, [project.name]);

  // Function to generate AI-powered project details
  const generateProjectDetails = async () => {
    setIsLoading(true);
    try {
      // Create a prompt for the AI
      const prompt = `
        As an academic counselor, provide detailed guidance for a high school student interested in pursuing this project:
        
        PROJECT: ${project.name}
        DESCRIPTION: ${project.description}
        DIFFICULTY: ${project.complexity}
        TIMEFRAME: ${project.timeframe}
        SKILLS DEVELOPED: ${project.skillsDeveloped.join(', ')}
        
        Please provide:
        
        1. DETAILED IMPLEMENTATION PLAN: A step-by-step plan with specific actions and guidance for each phase. Include at least 6-8 detailed steps.
        
        2. RESOURCES: Suggest 4-5 specific resources (online courses, tutorials, books, software tools) that would help with this project. For each resource, include:
          - Name
          - URL (use real, current, working URLs)
          - Brief description of how it helps
        
        3. SUCCESS TIPS: 4-5 practical tips for successfully completing this project
        
        4. TIMELINE: Break down the project into phases with specific tasks for each phase
        
        Format your response as a JSON object with these keys: detailedPlan (string), resourceLinks (array of objects with name, url, description), tips (array of strings), and timeline (array of objects with phase and tasks array).
        
        Make all content extremely specific, actionable, and tailored to this exact project. Include current, working links to real resources.
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
                         response.content.match(/\{[\s\S]*"detailedPlan"[\s\S]*?\}/);
                         
        const jsonContent = jsonMatch ? jsonMatch[1] : response.content;
        const parsedResponse = JSON.parse(jsonContent);
        setAiDetails(parsedResponse);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        
        // Extract sections from the text response as a fallback
        const fallbackDetails = {
          detailedPlan: extractSection(response.content, "DETAILED IMPLEMENTATION PLAN", "RESOURCES"),
          resourceLinks: extractLinks(response.content),
          tips: extractBulletPoints(response.content, "SUCCESS TIPS", "TIMELINE"),
          timeline: [{
            phase: "Implementation",
            tasks: extractBulletPoints(response.content, "TIMELINE")
          }]
        };
        
        setAiDetails(fallbackDetails);
      }
    } catch (error) {
      console.error("Error generating project details:", error);
      toast.error("Failed to load detailed guidance", { 
        description: "Please try again later" 
      });
      setAiDetails({
        detailedPlan: "Start by researching successful examples of similar projects. Then, create a detailed project plan with clear objectives, timeline, and required resources. Break down the implementation into smaller tasks and assign deadlines to each. Execute the project methodically, ensuring regular reviews and adjustments. Document your progress, challenges, and solutions throughout. Finally, prepare a compelling presentation of your work and findings for relevant audiences.",
        resourceLinks: [
          {
            name: "Project Management Guide",
            url: "https://www.pmi.org/learning/library",
            description: "Comprehensive resources for project planning and execution"
          },
          {
            name: "Online Learning Platform",
            url: "https://www.coursera.org/",
            description: "Courses on skills relevant to your project"
          },
          {
            name: "Research Methods Guide",
            url: "https://www.scribbr.com/category/methodology/",
            description: "Learn proper research techniques for your project"
          },
          {
            name: "Presentation Skills",
            url: "https://www.toastmasters.org/resources",
            description: "Resources to improve your presentation abilities"
          }
        ],
        tips: [
          "Create a detailed timeline with specific milestones and deadlines",
          "Seek feedback regularly from mentors or teachers",
          "Document your process thoroughly for college applications",
          "Connect your project to your intended major or career goals",
          "Balance ambition with realistic scope to ensure completion"
        ],
        timeline: [
          {
            phase: "Research & Planning",
            tasks: [
              "Conduct background research on your topic",
              "Define specific project goals and outcomes",
              "Create a detailed implementation plan",
              "Identify necessary resources and mentors"
            ]
          },
          {
            phase: "Development",
            tasks: [
              "Begin implementing your project plan",
              "Meet regularly with mentors for guidance",
              "Adjust approach based on challenges encountered",
              "Document progress and methodology"
            ]
          },
          {
            phase: "Completion & Presentation",
            tasks: [
              "Finalize your project deliverables",
              "Prepare a compelling presentation",
              "Create documentation for your portfolio",
              "Reflect on learnings and outcomes"
            ]
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
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)|(?:https?:\/\/[^\s]+)/g;
    const matches = Array.from(text.matchAll(linkRegex));
    
    return matches.map(match => {
      const name = match[1] || "Resource";
      const url = match[2] || match[0];
      return {
        name,
        url,
        description: "Helpful resource for this project"
      };
    });
  };

  return (
    <div className="space-y-5">
      {/* Project header */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-blue-400" />
          {project.name}
        </h2>
        
        <div className="flex gap-2 flex-wrap mb-3">
          <Badge variant="outline" className="bg-blue-900/20 text-blue-300 border-blue-700/30">
            {project.complexity}
          </Badge>
          <Badge variant="outline" className="bg-emerald-900/20 text-emerald-300 border-emerald-700/30">
            {project.timeframe}
          </Badge>
          {project.category.map((cat, i) => (
            <Badge key={i} variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700/30">
              {cat}
            </Badge>
          ))}
        </div>
        
        <p className="text-zinc-300">{project.description}</p>
      </div>
      
      <Separator className="bg-zinc-800" />
      
      {/* AI-generated detailed guidance */}
      {isLoading ? (
        <div className="py-10 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
          <p className="text-zinc-400 text-center">Generating personalized guidance for this project...</p>
          <p className="text-zinc-500 text-sm text-center">This may take a moment as we create detailed plans specific to your needs.</p>
        </div>
      ) : aiDetails ? (
        <div className="space-y-6">
          {/* Detailed implementation plan */}
          <div>
            <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" /> Detailed Implementation Plan
            </h3>
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
              <p className="text-zinc-300 whitespace-pre-line">{aiDetails.detailedPlan}</p>
            </div>
          </div>
          
          {/* Timeline */}
          <div>
            <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" /> Project Timeline
            </h3>
            <div className="space-y-4">
              {aiDetails.timeline.map((phase, phaseIdx) => (
                <div key={phaseIdx} className="relative pl-8">
                  {/* Timeline connector */}
                  {phaseIdx < aiDetails.timeline.length - 1 && (
                    <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-zinc-700" />
                  )}
                  
                  {/* Timeline node */}
                  <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  
                  <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                    <h4 className="font-medium text-zinc-200 mb-2">{phase.phase}</h4>
                    <ul className="space-y-1.5 pl-1">
                      {phase.tasks.map((task, taskIdx) => (
                        <li key={taskIdx} className="flex gap-2 items-start text-zinc-300 text-sm">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Success tips */}
          <div>
            <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
              <List className="h-4 w-4 text-amber-400" /> Success Tips
            </h3>
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
              <ul className="space-y-2">
                {aiDetails.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-zinc-300">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-400" /> Recommended Resources
            </h3>
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 space-y-3">
              {aiDetails.resourceLinks.map((resource, i) => (
                <div key={i} className="flex flex-col">
                  <a 
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-2 items-center text-blue-400 hover:text-blue-300 hover:underline font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>{resource.name}</span>
                  </a>
                  <p className="text-xs text-zinc-400 mt-1 ml-6">{resource.description}</p>
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
            onClick={generateProjectDetails}
          >
            Try Again
          </Button>
        </div>
      )}
      
      {/* Basic project info (shown regardless of AI content) */}
      <Separator className="bg-zinc-800" />
      
      <div>
        <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-400" /> Skills You'll Develop
        </h3>
        <div className="flex flex-wrap gap-2">
          {project.skillsDeveloped.map((skill, i) => (
            <Badge key={i} variant="outline" className="bg-green-900/10 text-green-300 border-green-700/30">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
          <List className="h-4 w-4 text-blue-400" /> Basic Implementation Steps
        </h3>
        <div className="space-y-2 pl-2">
          {project.steps.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-zinc-300">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}