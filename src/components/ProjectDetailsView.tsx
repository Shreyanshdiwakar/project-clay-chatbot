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
        SKILLS DEVELOPED: ${Array.isArray(project.skillsDeveloped) ? project.skillsDeveloped.join(', ') : ''}
        
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
        // Try to find JSON object in the response
        const jsonPattern = /```json\s*(\{[\s\S]*?\})\s*```|(\{[\s\S]*"detailedPlan"[\s\S]*?\})/;
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
      console.error("Error generating project details:", error);
      toast.error("Failed to load detailed guidance", { 
        description: "Please try again later" 
      });
      
      // Set default fallback data
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
  
  // Helper function to extract structured data from text
  const extractStructuredData = (text) => {
    const detailedPlan = extractSection(text, "DETAILED IMPLEMENTATION PLAN", "RESOURCES") || 
      extractSection(text, "DETAILED PLAN", "RESOURCES") || 
      "Start by researching your topic thoroughly and developing a clear plan with specific goals and milestones.";
    
    const resourceLinksText = extractSection(text, "RESOURCES", "SUCCESS TIPS") || 
                             extractSection(text, "RESOURCES", "TIPS");
    const resourceLinks = extractResourceLinks(resourceLinksText) || [
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
      }
    ];
    
    const tipsText = extractSection(text, "SUCCESS TIPS", "TIMELINE") || 
                    extractSection(text, "TIPS", "TIMELINE");
    const tips = extractListItems(tipsText) || [
      "Plan your project carefully with realistic milestones",
      "Seek feedback from mentors regularly",
      "Document your process thoroughly",
      "Connect your project to your intended major or career goals",
      "Balance ambition with realistic scope to ensure completion"
    ];
    
    const timelineText = extractSection(text, "TIMELINE") || extractSection(text, "PROJECT TIMELINE");
    let timeline = [];
    
    // First try to parse structured timeline sections
    const timelinePhases = timelineText.split(/Phase \d+:|Step \d+:|Stage \d+:|PHASE \d+:/g)
      .filter(phase => phase.trim().length > 0);
    
    if (timelinePhases.length > 0) {
      timeline = timelinePhases.map(phaseText => {
        const phaseLines = phaseText.split('\n').filter(line => line.trim().length > 0);
        const phase = phaseLines[0]?.trim() || "Implementation Phase";
        const tasks = phaseLines.slice(1)
          .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().match(/^\d+\./))
          .map(line => line.replace(/^[•-\d\.]+\s*/, '').trim());
        
        return { 
          phase, 
          tasks: tasks.length > 0 ? tasks : ["Plan and execute this phase of your project"]
        };
      });
    }
    
    // If no structured timeline found, look for paragraph breaks
    if (timeline.length === 0 && timelineText) {
      const paragraphs = timelineText.split(/\n\n+/)
        .filter(p => p.trim().length > 0);
      
      if (paragraphs.length > 0) {
        timeline = paragraphs.map((paragraph, i) => {
          const lines = paragraph.split('\n');
          const phase = lines[0]?.trim() || `Phase ${i+1}`;
          const tasks = extractListItems(paragraph) || 
                       [paragraph.replace(phase, '').trim() || "Complete tasks for this phase"];
          
          return { phase, tasks };
        });
      }
    }
    
    // Provide default timeline if we couldn't extract one
    if (timeline.length === 0) {
      timeline = [
        {
          phase: "Planning & Research",
          tasks: ["Research your topic thoroughly", "Create a detailed project plan", "Gather necessary resources"]
        },
        {
          phase: "Implementation",
          tasks: ["Execute your project according to plan", "Document your progress", "Adapt to challenges"]
        },
        {
          phase: "Completion & Presentation",
          tasks: ["Finalize your project", "Prepare presentation materials", "Share your results"]
        }
      ];
    }
    
    return { detailedPlan, resourceLinks, tips, timeline };
  };
  
  // Helper function to extract a section from text
  const extractSection = (text, startMarker, endMarker) => {
    if (!text || typeof text !== 'string') return "";
    
    const startIdx = text.indexOf(startMarker);
    if (startIdx === -1) return "";
    
    const effectiveStartIdx = startIdx + startMarker.length;
    
    if (!endMarker) return text.substring(effectiveStartIdx).trim();
    
    const endIdx = text.indexOf(endMarker, effectiveStartIdx);
    if (endIdx === -1) return text.substring(effectiveStartIdx).trim();
    
    return text.substring(effectiveStartIdx, endIdx).trim();
  };
  
  // Helper function to extract list items
  const extractListItems = (text) => {
    if (!text || typeof text !== 'string') return [];
    
    return text
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().match(/^\d+\./))
      .map(line => line.replace(/^[•-\d\.]+\s*/, '').trim());
  };
  
  // Helper function to extract resource links
  const extractResourceLinks = (text) => {
    if (!text || typeof text !== 'string') return [];
    
    const resources = [];
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Try to extract markdown links [name](url)
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        resources.push({
          name: linkMatch[1],
          url: linkMatch[2],
          description: lines[i+1]?.trim() || "Helpful resource for this project"
        });
        i++; // Skip the next line as we've used it for description
        continue;
      }
      
      // Try to extract name and URL separately
      const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        resources.push({
          name: line.replace(urlMatch[0], '').trim() || "Project Resource",
          url: urlMatch[0],
          description: lines[i+1]?.trim() || "Helpful resource for this project"
        });
        i++; // Skip the next line as we've used it for description
        continue;
      }
      
      // If this line looks like a resource name
      if (line.trim().length < 50 && !line.trim().startsWith('-') && !line.trim().startsWith('•')) {
        const nextLine = lines[i+1];
        const nextLineUrlMatch = nextLine?.match(/(https?:\/\/[^\s]+)/);
        
        if (nextLineUrlMatch) {
          resources.push({
            name: line.trim(),
            url: nextLineUrlMatch[0],
            description: lines[i+2]?.trim() || "Helpful resource for this project"
          });
          i += 2; // Skip the next two lines
          continue;
        }
      }
    }
    
    return resources;
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
          {Array.isArray(project.category) && project.category.map((cat, i) => (
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
              {Array.isArray(aiDetails.timeline) && aiDetails.timeline.map((phase, phaseIdx) => (
                <div key={phaseIdx} className="relative pl-8">
                  {/* Timeline connector */}
                  {phaseIdx < (aiDetails.timeline?.length || 0) - 1 && (
                    <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-zinc-700" />
                  )}
                  
                  {/* Timeline node */}
                  <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  
                  <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                    <h4 className="font-medium text-zinc-200 mb-2">{phase.phase}</h4>
                    <ul className="space-y-1.5 pl-1">
                      {Array.isArray(phase.tasks) && phase.tasks.map((task, taskIdx) => (
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
                {Array.isArray(aiDetails.tips) && aiDetails.tips.map((tip, i) => (
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
              {Array.isArray(aiDetails.resourceLinks) && aiDetails.resourceLinks.length > 0 ? (
                aiDetails.resourceLinks.map((resource, i) => (
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
                    <p className="text-xs text-zinc-400 mt-1 ml-6">{resource.description || ""}</p>
                  </div>
                ))
              ) : (
                <p className="text-zinc-400">No specific resources available. Try searching for "{project.name} tutorial" or "{project.name} guide" online.</p>
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
          {Array.isArray(project.skillsDeveloped) && project.skillsDeveloped.map((skill, i) => (
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
          {Array.isArray(project.steps) && project.steps.map((step, i) => (
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