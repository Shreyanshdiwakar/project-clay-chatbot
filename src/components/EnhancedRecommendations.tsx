'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  EnhancedRecommendationResponse, 
  MonthlyTimelineResponse
} from '@/services/recommendations/types';
import { RecommendationFeedback } from '@/components/RecommendationFeedback';
import { submitFeedback } from '@/services/recommendations/feedback';
import { ProjectDetailsView } from '@/components/ProjectDetailsView';
import { CompetitionDetailsView } from '@/components/CompetitionDetailsView';
import { 
  BookOpen, Award, Calendar, Trophy, Star, Info, Filter,
  ExternalLink, BarChart3, CheckCircle, Clock, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedRecommendationsProps {
  recommendations: EnhancedRecommendationResponse;
  userId?: string;
}

export function EnhancedRecommendations({
  recommendations,
  userId
}: EnhancedRecommendationsProps) {
  // State for active feedback
  const [activeFeedback, setActiveFeedback] = useState<{
    id: string;
    type: 'project' | 'competition' | 'skill' | 'timeline';
    name: string;
  } | null>(null);
  
  // State for filters
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // State for detailed view
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [selectedCompetition, setSelectedCompetition] = useState<any | null>(null);
  
  // Determine if we have enhanced data
  const hasEnhancedData = recommendations.recommendedActivities && 
                         recommendations.recommendedActivities.length > 0;
  
  // Prepare competition data 
  // Note: In a real implementation, this would use the enhanced data from the API
  const competitions = recommendations.suggestedCompetitions.map((comp, idx) => {
    // Parse name and URL if in markdown link format [name](url)
    const linkMatch = comp.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const name = linkMatch ? linkMatch[1] : comp.split(' - ')[0];
    const url = linkMatch ? linkMatch[2] : '';
    
    // Generate a competition with realistic data
    return {
      name,
      url,
      description: comp.replace(/\[([^\]]+)\]\(([^)]+)\)/, '$1'),
      eligibility: ['High school students'],
      deadline: 'Check website for current deadlines',
      category: ['Academic', 'Competition'],
      difficulty: idx % 3 === 0 ? 'beginner' : idx % 3 === 1 ? 'intermediate' : 'advanced',
      matchScore: 75 + (idx * 5) % 25,
      competitiveness: idx % 3 === 0 ? 'low' : idx % 3 === 1 ? 'medium' : 'high',
      benefits: ['Experience', 'Recognition', 'College application enhancement']
    };
  });
  
  // Prepare project data
  const projects = hasEnhancedData 
    ? recommendations.recommendedActivities.map((proj, idx) => {
        // Convert from recommendedActivities format to project format
        return {
          name: proj.name,
          description: proj.description,
          complexity: proj.difficulty,
          timeframe: proj.timeCommitment,
          skillsRequired: [proj.skillsDeveloped[0] || 'General skills'],
          skillsDeveloped: proj.skillsDeveloped,
          steps: [
            'Research the topic and create a plan',
            'Gather necessary resources and materials',
            'Execute your project in stages',
            'Document your progress and results',
            'Present your work and get feedback'
          ],
          resources: [
            { name: 'Online Tutorial', url: 'https://www.example.com/tutorial' },
            { name: 'Reference Guide', url: 'https://www.example.com/guide' }
          ],
          category: ['Academic', 'Personal Development'],
          matchScore: 75 + (idx * 5) % 25
        };
      })
    : recommendations.suggestedProjects.map((proj, idx) => {
        // Generate a project with realistic data
        return {
          name: proj,
          description: `A project to develop your skills in ${recommendations.suggestedSkills[idx % recommendations.suggestedSkills.length]}`,
          complexity: idx % 3 === 0 ? 'beginner' : idx % 3 === 1 ? 'intermediate' : 'advanced',
          timeframe: idx % 3 === 0 ? '2-4 weeks' : idx % 3 === 1 ? '1-2 months' : '2-3 months',
          skillsRequired: [recommendations.suggestedSkills[idx % recommendations.suggestedSkills.length]],
          skillsDeveloped: [
            recommendations.suggestedSkills[idx % recommendations.suggestedSkills.length],
            recommendations.suggestedSkills[(idx + 1) % recommendations.suggestedSkills.length]
          ],
          steps: [
            'Research the topic and create a plan',
            'Gather necessary resources and materials',
            'Execute your project in stages',
            'Document your progress and results',
            'Present your work and get feedback'
          ],
          resources: [
            { name: 'Online Tutorial', url: 'https://www.example.com/tutorial' },
            { name: 'Reference Guide', url: 'https://www.example.com/guide' }
          ],
          category: ['Academic', 'Personal Development'],
          matchScore: 75 + (idx * 5) % 25
        };
      });
  
  // Handle feedback submission
  const handleFeedbackSubmit = (feedback: any) => {
    submitFeedback(feedback);
    toast.success('Thank you for your feedback!');
    setActiveFeedback(null);
  };
  
  // Filter projects by difficulty
  const filteredProjects = difficultyFilter 
    ? projects.filter(p => p.complexity === difficultyFilter)
    : projects;
  
  // Filter competitions by category or difficulty
  const filteredCompetitions = competitions.filter(c => {
    if (difficultyFilter && c.difficulty !== difficultyFilter) return false;
    if (categoryFilter && !c.category.includes(categoryFilter)) return false;
    return true;
  });
  
  // Extract all unique categories for filter options
  const allCategories = Array.from(new Set(
    competitions.flatMap(c => c.category)
  )).sort();
  
  // Parse timeline to get monthly breakdown
  const monthlyTimeline: Record<string, string[]> = {};
  recommendations.timeline.forEach(item => {
    const parts = item.split(':');
    if (parts.length >= 2) {
      const month = parts[0].trim();
      const activity = parts.slice(1).join(':').trim();
      if (!monthlyTimeline[month]) {
        monthlyTimeline[month] = [];
      }
      monthlyTimeline[month].push(activity);
    }
  });
  
  return (
    <div className="space-y-6">
      {/* Profile Analysis Section */}
      <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Profile Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-300">{recommendations.profileAnalysis}</p>
        </CardContent>
      </Card>
      
      {/* Main Recommendations Tabs */}
      <Tabs defaultValue="projects" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-zinc-900 p-1 rounded-xl">
            <TabsTrigger value="projects" className="rounded-lg data-[state=active]:bg-zinc-800">
              Projects
            </TabsTrigger>
            <TabsTrigger value="competitions" className="rounded-lg data-[state=active]:bg-zinc-800">
              Competitions
            </TabsTrigger>
            <TabsTrigger value="skills" className="rounded-lg data-[state=active]:bg-zinc-800">
              Skills
            </TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-lg data-[state=active]:bg-zinc-800">
              Timeline
            </TabsTrigger>
          </TabsList>
          
          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative inline-block">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-zinc-700 gap-2">
                    <Filter className="h-4 w-4" /> 
                    Filters
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Filter Recommendations</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <h3 className="font-medium mb-2">Difficulty Level</h3>
                      <div className="flex flex-wrap gap-2">
                        {['beginner', 'intermediate', 'advanced'].map((level) => (
                          <Button
                            key={level}
                            variant={difficultyFilter === level ? "default" : "outline"}
                            size="sm"
                            className={`capitalize ${
                              difficultyFilter === level
                                ? "bg-blue-600 hover:bg-blue-700" 
                                : "border-zinc-700"
                            }`}
                            onClick={() => setDifficultyFilter(
                              difficultyFilter === level ? null : level
                            )}
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {allCategories.map((category) => (
                          <Button
                            key={category}
                            variant={categoryFilter === category ? "default" : "outline"}
                            size="sm"
                            className={
                              categoryFilter === category
                                ? "bg-blue-600 hover:bg-blue-700" 
                                : "border-zinc-700"
                            }
                            onClick={() => setCategoryFilter(
                              categoryFilter === category ? null : category
                            )}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-6 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <p className="text-zinc-400">No projects match your current filters.</p>
              <Button 
                variant="link" 
                onClick={() => setDifficultyFilter(null)} 
                className="mt-2 text-blue-400"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((project, idx) => (
                <Card key={idx} className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80 transition-colors">
                  <CardHeader className="pb-2 flex flex-row justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-zinc-100 text-lg">
                        <BookOpen className="h-5 w-5 text-blue-400" />
                        {project.name}
                      </CardTitle>
                      
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="bg-blue-900/20 text-blue-300 border-blue-700/30">
                          {project.complexity}
                        </Badge>
                        <Badge variant="outline" className="bg-emerald-900/20 text-emerald-300 border-emerald-700/30">
                          {project.timeframe}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-900/20 text-purple-300 border-purple-700/30">
                          {project.matchScore}% match
                        </Badge>
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-full border-zinc-700"
                          onClick={() => setSelectedProject(project)}
                        >
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Details</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-400" />
                            Project Details
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="max-h-[70vh] overflow-y-auto pr-2">
                          <ProjectDetailsView project={project} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-zinc-300 text-sm mb-3">{project.description}</p>
                    
                    <div>
                      <h4 className="text-xs font-medium text-zinc-400 mb-1.5">Skills Developed:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {project.skillsDeveloped.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-zinc-800 text-zinc-300 border-zinc-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-zinc-700 text-zinc-300"
                      onClick={() => setActiveFeedback({
                        id: `project-${idx}`,
                        type: 'project',
                        name: project.name
                      })}
                    >
                      Rate This
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="default" 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-400" />
                            Project Details
                          </DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[70vh] overflow-y-auto pr-2">
                          <ProjectDetailsView project={project} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Competitions Tab */}
        <TabsContent value="competitions" className="space-y-4">
          {filteredCompetitions.length === 0 ? (
            <div className="text-center py-6 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <p className="text-zinc-400">No competitions match your current filters.</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setDifficultyFilter(null);
                  setCategoryFilter(null);
                }} 
                className="mt-2 text-blue-400"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCompetitions.map((competition, idx) => (
                <Card key={idx} className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80 transition-colors">
                  <CardHeader className="pb-2 flex flex-row justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-zinc-100 text-lg">
                        <Trophy className="h-5 w-5 text-amber-400" />
                        {competition.name}
                      </CardTitle>
                      
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="bg-amber-900/20 text-amber-300 border-amber-700/30">
                          {competition.difficulty}
                        </Badge>
                        <Badge variant="outline" className="bg-red-900/20 text-red-300 border-red-700/30">
                          {competition.competitiveness} competition
                        </Badge>
                        <Badge variant="outline" className="bg-purple-900/20 text-purple-300 border-purple-700/30">
                          {competition.matchScore}% match
                        </Badge>
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-full border-zinc-700"
                          onClick={() => setSelectedCompetition(competition)}
                        >
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Details</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-400" />
                            Competition Details
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="max-h-[70vh] overflow-y-auto pr-2">
                          <CompetitionDetailsView competition={competition} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-zinc-300 text-sm mb-2">{competition.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-zinc-400 mt-2">
                      <span>Deadline: {competition.deadline}</span>
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-400 fill-yellow-400" />
                        {competition.competitiveness} competition
                      </span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-zinc-700 text-zinc-300"
                      onClick={() => setActiveFeedback({
                        id: `competition-${idx}`,
                        type: 'competition',
                        name: competition.name
                      })}
                    >
                      Rate This
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="default" 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-400" />
                            Competition Details
                          </DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[70vh] overflow-y-auto pr-2">
                          <CompetitionDetailsView competition={competition} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Skills to Develop
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Focus on these key skills to strengthen your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.suggestedSkills.map((skill, idx) => (
                  <Card key={idx} className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700/80 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-zinc-200">{skill}</h3>
                          <p className="text-xs text-zinc-400 mt-1">
                            This skill will strengthen your applications for {recommendations.recommendedActivities?.[idx % recommendations.recommendedActivities.length]?.name || "related opportunities"}
                          </p>
                        </div>
                      </div>
                      
                      <Separator className="bg-zinc-700" />
                      
                      <div className="flex justify-between">
                        <Badge variant="outline" className="bg-zinc-700/50 text-zinc-300 border-zinc-600">
                          {idx % 3 === 0 ? 'Technical' : idx % 3 === 1 ? 'Soft Skill' : 'Leadership'}
                        </Badge>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 border-zinc-700 text-zinc-300 text-xs"
                          onClick={() => setActiveFeedback({
                            id: `skill-${idx}`,
                            type: 'skill',
                            name: skill
                          })}
                        >
                          Rate This
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-400" />
                Your College Preparation Timeline
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Follow this timeline to stay on track with your college preparation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Process timeline entries in order by month */}
                {Object.entries(monthlyTimeline).length > 0 ? (
                  Object.entries(monthlyTimeline)
                    .sort(([monthA], [monthB]) => {
                      const months = [
                        'September', 'October', 'November', 'December', 
                        'January', 'February', 'March', 'April', 
                        'May', 'June', 'July', 'August'
                      ];
                      return months.indexOf(monthA) - months.indexOf(monthB);
                    })
                    .map(([month, activities], idx) => (
                      <div key={idx} className="relative pl-8 pb-6">
                        {/* Timeline connector */}
                        {idx < Object.keys(monthlyTimeline).length - 1 && (
                          <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-zinc-700" />
                        )}
                        
                        {/* Timeline node */}
                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        
                        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                          <h3 className="text-zinc-200 font-medium mb-2">{month}</h3>
                          <ul className="space-y-2">
                            {activities.map((activity, actIdx) => (
                              <li key={actIdx} className="text-zinc-300 flex gap-2 items-start">
                                <span className="text-green-400 mt-1">•</span>
                                <span>{activity}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <div className="flex justify-end mt-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-zinc-700 text-zinc-300 text-xs h-7"
                              onClick={() => setActiveFeedback({
                                id: `timeline-${idx}`,
                                type: 'timeline',
                                name: `${month} Timeline`
                              })}
                            >
                              Rate This
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  // Process standard timeline entries if no month breakdown
                  recommendations.timeline.map((phase, idx) => (
                    <div key={idx} className="relative pl-8 pb-6">
                      {/* Timeline connector */}
                      {idx < recommendations.timeline.length - 1 && (
                        <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-zinc-700" />
                      )}
                      
                      {/* Timeline node */}
                      <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      
                      <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                        <h3 className="text-zinc-200 font-medium mb-2">
                          {idx === 0 ? 'Short-term (Next 1-3 months)' :
                          idx === 1 ? 'Medium-term (Next 3-6 months)' :
                          idx === 2 ? 'Long-term (Next 6-12 months)' :
                          'Future Planning'}
                        </h3>
                        <p className="text-zinc-300">{phase}</p>
                        
                        <div className="flex justify-end mt-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-zinc-700 text-zinc-300 text-xs h-7"
                            onClick={() => setActiveFeedback({
                              id: `timeline-${idx}`,
                              type: 'timeline',
                              name: `Timeline Phase ${idx + 1}`
                            })}
                          >
                            Rate This
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Feedback Dialog */}
      {activeFeedback && (
        <Dialog open={true} onOpenChange={(isOpen) => !isOpen && setActiveFeedback(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800 p-0 text-white">
            <DialogHeader>
              <DialogTitle className="sr-only">Recommendation Feedback</DialogTitle>
            </DialogHeader>
            <RecommendationFeedback
              recommendationId={activeFeedback.id}
              recommendationType={activeFeedback.type}
              recommendationName={activeFeedback.name}
              userId={userId}
              onSubmit={handleFeedbackSubmit}
              onCancel={() => setActiveFeedback(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}