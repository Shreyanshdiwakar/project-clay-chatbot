/**
 * Improved Recommendation Service
 * 
 * This implementation combines the enhanced analysis techniques with the existing
 * template-based system to create a more effective recommendation engine.
 */

import { StudentProfile } from '@/components/StudentQuestionnaire';
import { RecommendationResponse, EnhancedRecommendationResponse } from './types';
import { selectTemplates } from './templates';
import { getModelResponse } from '@/services/openai/service';
import { 
  assessUserSkillLevel,
  createTieredProjectRecommendations,
  enhanceCompetitionRecommendations
} from './analysis';

// Track previous recommendations to prevent repetition
const userRecommendationHistory: Record<string, {
  viewedCompetitions: string[];
  viewedProjects: string[];
  timestamp: number;
}> = {};

/**
 * Generate improved recommendations with diversity, relevance, and appropriate difficulty
 */
export async function generateImprovedRecommendations(
  profile: StudentProfile
): Promise<EnhancedRecommendationResponse> {
  try {
    // 1. Assess student skill level
    const skillAssessment = assessUserSkillLevel(profile);
    
    // 2. Check user history to prevent repetition
    const userId = profile.userId || profile.name.toLowerCase().replace(/\s+/g, '-');
    let userHistory = userRecommendationHistory[userId];
    
    // Initialize history if it doesn't exist
    if (!userHistory) {
      userHistory = {
        viewedCompetitions: [],
        viewedProjects: [],
        timestamp: Date.now()
      };
      userRecommendationHistory[userId] = userHistory;
    }
    
    // If history is older than 30 days, reset it
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - userHistory.timestamp > thirtyDaysInMs) {
      userHistory = {
        viewedCompetitions: [],
        viewedProjects: [],
        timestamp: Date.now()
      };
      userRecommendationHistory[userId] = userHistory;
    }
    
    // 3. Select the appropriate templates based on the student profile
    const templates = selectTemplates(profile);
    
    // 4. Generate comprehensive profile analysis with narrative
    const profileAnalysis = await generateEnhancedProfileAnalysis(profile, skillAssessment);
    
    // 5. Generate project recommendations with appropriate difficulty
    const projectRecommendations = await createTieredProjectRecommendations(profile, skillAssessment);
    
    // 6. Get competition recommendations using web search
    const competitions = await getCompetitionRecommendations(profile, userHistory.viewedCompetitions);
    
    // 7. Enhance competition data with metadata
    const enhancedCompetitions = enhanceCompetitionRecommendations(competitions, profile);
    
    // 8. Generate skill recommendations
    const skillRecommendations = generateSkillRecommendations(profile, skillAssessment);
    
    // 9. Generate timeline
    let timeline: string[] = [];
    if (templates.timeline) {
      timeline = await generateEnhancedTimeline(templates.timeline, profile);
    }
    
    // 10. Update user history
    userHistory.viewedCompetitions = [
      ...userHistory.viewedCompetitions,
      ...enhancedCompetitions.map(c => c.name)
    ];
    userHistory.viewedProjects = [
      ...userHistory.viewedProjects,
      ...projectRecommendations.map(p => p.name)
    ];
    userHistory.timestamp = Date.now();
    userRecommendationHistory[userId] = userHistory;
    
    // 11. Construct the enhanced recommendation response
    return {
      suggestedProjects: projectRecommendations.map(p => p.name),
      suggestedCompetitions: enhancedCompetitions.map(c => 
        c.url ? `[${c.name}](${c.url})` : c.name
      ),
      suggestedSkills: skillRecommendations,
      timeline: timeline,
      profileAnalysis: profileAnalysis,
      recommendedActivities: projectRecommendations.map(p => ({
        name: p.name,
        description: p.description,
        relevance: `Aligned with ${profile.intendedMajor} and develops key skills`,
        difficulty: p.complexity,
        timeCommitment: p.timeframe,
        skillsDeveloped: p.skillsDeveloped
      }))
    };
  } catch (error) {
    console.error('Error generating improved recommendations:', error);
    
    // Fallback to basic recommendations
    return {
      suggestedProjects: [
        'Develop a personal project showcasing your interests and skills',
        'Create a digital portfolio of your academic and extracurricular work'
      ],
      suggestedCompetitions: [
        'Research competitions specific to your field of interest',
        'Look for local scholarship opportunities aligned with your goals'
      ],
      suggestedSkills: [
        'Critical thinking and problem-solving',
        'Effective written and verbal communication',
        'Time management and organization'
      ],
      timeline: [
        'Set specific academic and extracurricular goals for this semester',
        'Research colleges and scholarship opportunities',
        'Prepare for standardized tests if applicable',
        'Develop meaningful relationships with potential recommenders'
      ],
      profileAnalysis: `Focus on developing experiences that showcase your interest in ${profile.intendedMajor || "your intended field"}. Seek opportunities that allow you to demonstrate both depth of commitment and breadth of skills.`,
      recommendedActivities: []
    };
  }
}

/**
 * Generate enhanced profile analysis that provides deeper insights
 */
async function generateEnhancedProfileAnalysis(
  profile: StudentProfile,
  skillAssessment: ReturnType<typeof assessUserSkillLevel>
): Promise<string> {
  try {
    // Create a prompt that combines profile information with skill assessment
    const prompt = `
      Create a detailed, personalized analysis for a high school student with the following profile:
      
      Name: ${profile.name}
      Grade: ${profile.gradeLevel}
      Intended Major: ${profile.intendedMajor || "Undecided"}
      Current Activities: ${profile.currentActivities || "None specified"}
      Interested Activities: ${profile.interestedActivities || "None specified"}
      SAT Score: ${profile.satScore || "Not provided"}
      Additional Information: ${profile.additionalInfo || "None provided"}
      
      Skill Assessment Results:
      ${Object.entries(skillAssessment.skillLevels)
        .map(([skill, level]) => `- ${skill}: ${level}`)
        .join('\n')}
      
      Overall Recommended Difficulty Level: ${skillAssessment.recommendedDifficulty}
      
      Please provide:
      1. A comprehensive analysis of the student's current profile strengths
      2. Key areas for development based on their intended major
      3. How their current activities align with college application needs
      4. Specific focus areas that would strengthen their profile
      5. Grade-appropriate next steps for their college preparation journey
      
      Make the analysis personalized, constructive, and actionable. Limit to 3-4 paragraphs.
    `;

    // In a real implementation, this would call the API
    // For now, generate a structured analysis based on the profile
    
    const major = profile.intendedMajor || "undecided field";
    const grade = profile.gradeLevel || "current grade";
    const gradeCategory = getGradeCategory(grade);
    
    // Assemble a comprehensive analysis using templates based on profile attributes
    let analysis = `Your profile shows a clear interest in ${major}, which provides good direction for your college preparation journey. `;
    
    // Add grade-specific insights
    switch (gradeCategory) {
      case 'freshman':
        analysis += `As a freshman, you have an excellent opportunity to explore different facets of ${major} while building a strong academic foundation. Your involvement in ${summarizeActivities(profile.currentActivities)} demonstrates initiative, and you can build on this by gradually taking on more responsibility in these activities. `;
        break;
      case 'sophomore':
        analysis += `At the sophomore level, you're entering a critical phase where developing depth in your activities related to ${major} becomes increasingly important. Your current involvement in ${summarizeActivities(profile.currentActivities)} provides a good foundation, but now is the time to pursue leadership roles and more specialized experiences. `;
        break;
      case 'junior':
        analysis += `Junior year is pivotal for college applications, and your profile shows good alignment with ${major} through ${summarizeActivities(profile.currentActivities)}. At this stage, you should focus on demonstrating leadership and significant achievement in your key activities while maintaining strong academic performance in courses relevant to your intended major. `;
        break;
      case 'senior':
        analysis += `As a senior applying to college, your profile highlighting involvement in ${summarizeActivities(profile.currentActivities)} demonstrates commitment to activities related to ${major}. Your focus now should be on showcasing the culmination of your high school journey and articulating how these experiences have prepared you for college-level work in your field. `;
        break;
      default:
        analysis += `At your current stage, you have a good foundation with ${summarizeActivities(profile.currentActivities)}, which you can build upon by seeking deeper involvement and leadership opportunities. `;
    }
    
    // Add skill-specific insights
    if (skillAssessment.recommendedDifficulty === 'beginner') {
      analysis += `Your skill assessment indicates you're at a beginner level in key areas related to ${major}. This is perfectly appropriate for your stage, and the recommended activities are designed to help you build foundational competencies while exploring different aspects of your field. Focus on developing ${formatSkillName(Object.entries(skillAssessment.skillLevels)[0][0])} skills through entry-level projects and structured learning opportunities. `;
    } else if (skillAssessment.recommendedDifficulty === 'intermediate') {
      analysis += `With intermediate-level skills in ${formatSkillName(Object.entries(skillAssessment.skillLevels).find(([_, level]) => level === 'intermediate')?.[0] || 'relevant areas')}, you're well-positioned to take on more challenging projects and leadership roles. The recommended activities build on your existing knowledge while introducing new challenges that will demonstrate growth and commitment. `;
    } else {
      analysis += `Your advanced skills in ${formatSkillName(Object.entries(skillAssessment.skillLevels).find(([_, level]) => level === 'advanced')?.[0] || 'key areas')} position you for sophisticated projects and competitive opportunities. The recommendations focus on showcasing your expertise through high-impact activities that will distinguish your college applications. `;
    }
    
    // Conclude with next steps
    analysis += `Moving forward, concentrate on ${skillAssessment.learningPath[0]} while building a cohesive narrative across your academics, activities, and personal projects that authentically represents your strengths and aspirations in ${major}.`;
    
    return analysis;
  } catch (error) {
    console.error('Error generating enhanced profile analysis:', error);
    return `Based on your interest in ${profile.intendedMajor || "your intended field"}, you should focus on building experiences that demonstrate both depth of commitment and breadth of skills. Look for opportunities that allow you to take on increasing responsibility over time and showcase your specific talents related to your intended major.`;
  }
}

/**
 * Generate competition recommendations with enhanced diversity
 */
async function getCompetitionRecommendations(
  profile: StudentProfile,
  previousRecommendations: string[] = []
): Promise<string[]> {
  try {
    // Create a prompt specifically for finding diverse competitions that match the student's profile
    const prompt = `
      I need recommendations for a diverse set of academic competitions, olympiads, or challenges for a student with the following profile:
      
      Grade: ${profile.gradeLevel}
      Intended Major: ${profile.intendedMajor}
      Current Activities: ${profile.currentActivities}
      Interests: ${profile.interestedActivities}
      
      Please provide a list of 5 specific, currently active competitions that:
      1. Include a mix of difficulty levels (beginner, intermediate, advanced)
      2. Represent different categories (STEM, humanities, leadership, etc.)
      3. Have varying levels of competitiveness
      4. Are well-aligned with this student's interests and grade level
      
      For EACH competition, include:
      1. The complete, accurate name of the competition
      2. A brief explanation of what it involves
      3. A direct website link in markdown format like this: [Competition Name](https://website-url.com)
      
      IMPORTANT: Avoid these competitions that the student has already seen:
      ${previousRecommendations.join(', ')}
      
      Format each recommendation as a separate bullet point with the link included.
    `;

    console.log('Fetching diverse competition recommendations with web search');
    
    // Make the API call with web search enabled
    const response = await getModelResponse(prompt, null, null, true);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to generate competition recommendations');
    }

    // Parse the response to extract competitions with links
    const content = response.content || '';
    
    // Extract each bullet point containing a competition
    const bulletPoints = content
      .split(/\n+/)
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.replace(/^[\s-*]+/, '').trim());
    
    if (bulletPoints.length === 0) {
      // Fallback to looking for numbered lists
      const numberedPoints = content
        .split(/\n+/)
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
      
      if (numberedPoints.length > 0) {
        return numberedPoints;
      }
      
      // If still no results, fallback to simple paragraph splitting
      return content
        .split(/\n\n+/)
        .filter(para => para.includes('http') || para.includes('www') || para.includes('.org') || para.includes('.com'))
        .map(para => para.trim());
    }

    return bulletPoints;
  } catch (error) {
    console.error('Error parsing competition recommendations:', error);
    // Fallback competitions
    return [
      "FIRST Robotics Competition - [https://www.firstinspires.org/robotics/frc](https://www.firstinspires.org/robotics/frc) - Teams design, build, and program industrial-size robots for a challenging field game.",
      "National History Day - [https://www.nhd.org/](https://www.nhd.org/) - Conduct historical research and present findings in various formats like exhibits, papers, or documentaries.",
      "Conrad Challenge - [https://www.conradchallenge.org/](https://www.conradchallenge.org/) - Develop innovative solutions to global challenges in categories like energy, health, and sustainability.",
      "Scholastic Art & Writing Awards - [https://www.artandwriting.org/](https://www.artandwriting.org/) - Submit creative work in various categories for recognition and scholarships.",
      "Diamond Challenge - [https://diamondchallenge.org/](https://diamondchallenge.org/) - Create business concepts or social innovation projects for prizes and recognition."
    ];
  }
}

/**
 * Generate skill recommendations with progression paths
 */
function generateSkillRecommendations(
  profile: StudentProfile, 
  skillAssessment: ReturnType<typeof assessUserSkillLevel>
): string[] {
  // Extract key information
  const major = profile.intendedMajor.toLowerCase();
  const skillLevels = skillAssessment.skillLevels;
  
  // Core skills every student should develop
  const coreSkills = [
    "Critical thinking and analytical reasoning",
    "Written and verbal communication",
    "Collaboration and teamwork"
  ];
  
  // Major-specific skills
  const majorSpecificSkills: string[] = [];
  
  if (major.includes('comput') || major.includes('tech') || major.includes('engineer')) {
    if (skillLevels.technical === 'beginner') {
      majorSpecificSkills.push("Fundamentals of programming with Python or JavaScript");
      majorSpecificSkills.push("Basic web development (HTML/CSS)");
    } else if (skillLevels.technical === 'intermediate') {
      majorSpecificSkills.push("Full-stack development with databases and APIs");
      majorSpecificSkills.push("Version control and collaborative coding practices");
    } else {
      majorSpecificSkills.push("Advanced algorithms and data structures");
      majorSpecificSkills.push("DevOps and deployment architecture");
    }
  } else if (major.includes('business') || major.includes('econ')) {
    if (skillLevels.leadership === 'beginner') {
      majorSpecificSkills.push("Fundamentals of financial literacy and business models");
      majorSpecificSkills.push("Basic market research and analysis techniques");
    } else if (skillLevels.leadership === 'intermediate') {
      majorSpecificSkills.push("Project management and organizational leadership");
      majorSpecificSkills.push("Financial analysis and business planning");
    } else {
      majorSpecificSkills.push("Strategic planning and organizational development");
      majorSpecificSkills.push("Advanced financial modeling and investment analysis");
    }
  } else if (major.includes('science') || major.includes('bio') || major.includes('chem')) {
    if (skillLevels.research === 'beginner') {
      majorSpecificSkills.push("Scientific method and basic research design");
      majorSpecificSkills.push("Laboratory safety and basic techniques");
    } else if (skillLevels.research === 'intermediate') {
      majorSpecificSkills.push("Experimental design and hypothesis testing");
      majorSpecificSkills.push("Scientific data collection and statistical analysis");
    } else {
      majorSpecificSkills.push("Advanced research methodologies in your field");
      majorSpecificSkills.push("Scientific paper writing and publication processes");
    }
  }
  
  // Combine skills, prioritizing major-specific ones
  const recommendedSkills = [...majorSpecificSkills, ...coreSkills];
  
  // Add grade-specific skills
  const grade = profile.gradeLevel.toLowerCase();
  if (grade.includes('11') || grade.includes('jun')) {
    recommendedSkills.push("Standardized test preparation strategies");
  } else if (grade.includes('12') || grade.includes('sen')) {
    recommendedSkills.push("College application essay writing");
    recommendedSkills.push("Interview preparation and professional communication");
  }
  
  // Return a subset to avoid overwhelming the student
  return recommendedSkills.slice(0, 5);
}

/**
 * Generate enhanced timeline with more specific guidance
 */
async function generateEnhancedTimeline(
  timelineTemplate: any,
  profile: StudentProfile
): Promise<string[]> {
  // Extract key information
  const grade = profile.gradeLevel.toLowerCase();
  let timelinePoints: string[] = [];
  
  // Grade-specific timeline points
  if (grade.includes('9') || grade.includes('fresh')) {
    timelinePoints = [
      "Fall: Explore 3-4 clubs or activities related to your interests to find your best fits",
      "Winter: Establish strong study habits and aim for excellent grades in core courses",
      "Spring: Begin research on summer programs that align with your interests",
      "Summer: Participate in a structured program or independent project to develop key skills"
    ];
  } else if (grade.includes('10') || grade.includes('soph')) {
    timelinePoints = [
      "Fall: Take the PSAT and begin standardized test preparation",
      "Winter: Research and plan to take rigorous courses for junior year",
      "Spring: Seek leadership positions in 1-2 key extracurricular activities",
      "Summer: Pursue an internship, research opportunity, or advanced program in your field"
    ];
  } else if (grade.includes('11') || grade.includes('jun')) {
    timelinePoints = [
      "Fall: Focus on achieving strong grades in challenging courses while preparing for standardized tests",
      "Winter: Research colleges and develop a preliminary list of schools to apply to",
      "Spring: Visit colleges, take SAT/ACT, and begin thinking about potential recommenders",
      "Summer: Work on a significant project related to your major and draft college essays"
    ];
  } else if (grade.includes('12') || grade.includes('sen')) {
    timelinePoints = [
      "Fall: Submit college applications, focusing on early deadlines for priority consideration",
      "Winter: Complete remaining applications and apply for scholarships",
      "Spring: Compare admission offers and financial aid packages to make your final decision",
      "Summer: Prepare for college transition while maintaining connections with mentors"
    ];
  } else {
    // Default timeline if grade level is unclear
    timelinePoints = [
      "Research colleges that offer strong programs in your field of interest",
      "Develop a challenging academic schedule that demonstrates your capabilities",
      "Pursue leadership roles in extracurricular activities aligned with your goals",
      "Create a standardized testing plan appropriate for your target colleges"
    ];
  }
  
  return timelinePoints;
}

/**
 * Helper function: Summarize activities for readability
 */
function summarizeActivities(activities: string): string {
  if (!activities || activities === "None specified" || activities.toLowerCase() === "no specified activities") {
    return "your current interests";
  }
  
  // Split activities by common separators and clean up
  const activityList = activities
    .split(/[,;]/)
    .map(activity => activity.trim())
    .filter(activity => activity.length > 0);
  
  if (activityList.length === 0) {
    return "your various activities";
  } else if (activityList.length === 1) {
    return activityList[0];
  } else if (activityList.length === 2) {
    return `${activityList[0]} and ${activityList[1]}`;
  } else {
    // For 3+ activities, mention a few and summarize
    return `${activityList[0]}, ${activityList[1]}, and other activities`;
  }
}

/**
 * Helper function: Format skill name for readability
 */
function formatSkillName(skill: string): string {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

/**
 * Helper function: Determine grade category
 */
function getGradeCategory(grade: string): 'freshman' | 'sophomore' | 'junior' | 'senior' | 'other' {
  const lowerGrade = grade.toLowerCase();
  
  if (lowerGrade.includes('9') || lowerGrade.includes('fresh')) {
    return 'freshman';
  } else if (lowerGrade.includes('10') || lowerGrade.includes('soph')) {
    return 'sophomore';
  } else if (lowerGrade.includes('11') || lowerGrade.includes('jun')) {
    return 'junior';
  } else if (lowerGrade.includes('12') || lowerGrade.includes('sen')) {
    return 'senior';
  } else {
    return 'other';
  }
}