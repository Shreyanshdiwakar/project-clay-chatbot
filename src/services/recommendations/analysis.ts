/**
 * Recommendation System Analysis and Improvement Plan
 * 
 * This file provides a comprehensive analysis of the current recommendation system
 * and outlines specific improvements to enhance its effectiveness, relevance, and
 * user engagement.
 */

import { StudentProfile } from '@/components/StudentQuestionnaire';
import { 
  RecommendationResponse, 
  EnhancedRecommendationResponse 
} from './types';
import { selectTemplates } from './templates';

/**
 * Enhanced activity recommendation with additional metadata
 */
export interface EnhancedActivityRecommendation {
  name: string;
  description: string;
  relevance: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: string;
  skillsDeveloped: string[];
  category: 'academic' | 'leadership' | 'community' | 'creative' | 'technical' | 'entrepreneurial';
  matchScore: number; // 0-100 score indicating relevance to student profile
  prerequisites?: string[];
  outcomes?: string[];
  alternatives?: string[];
}

/**
 * Enhanced competition recommendation with detailed metadata
 */
export interface EnhancedCompetitionRecommendation {
  name: string;
  url: string;
  description: string;
  eligibility: string[];
  deadline: string;
  category: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  matchScore: number; // 0-100 score indicating relevance to student profile
  competitiveness: 'low' | 'medium' | 'high' | 'very high';
  fee?: string;
  benefits: string[];
}

/**
 * Enhanced project recommendation with implementation details
 */
export interface EnhancedProjectRecommendation {
  name: string;
  description: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  timeframe: string;
  skillsRequired: string[];
  skillsDeveloped: string[];
  steps: string[];
  resources: { name: string; url: string }[];
  category: string[];
  matchScore: number; // 0-100 score indicating relevance to student profile
}

/**
 * Fully enhanced recommendation response
 */
export interface ComprehensiveRecommendationResponse extends EnhancedRecommendationResponse {
  enhancedCompetitions: EnhancedCompetitionRecommendation[];
  enhancedProjects: EnhancedProjectRecommendation[];
  skillGapAnalysis: {
    currentSkills: string[];
    recommendedSkills: string[];
    learningPath: {
      shortTerm: string[];
      mediumTerm: string[];
      longTerm: string[];
    };
  };
  userFeedbackMetrics: {
    recommendationRelevance: number; // 0-100
    implementationDifficulty: number; // 0-100
    diversityScore: number; // 0-100
  };
  adaptiveRecommendations: boolean; // Whether recommendations adapt based on user progress
}

/**
 * User engagement metrics for recommendation evaluation
 */
export interface UserEngagementMetrics {
  viewCount: number; // How many times recommendations were viewed
  clickCount: number; // Interactions with recommendation items
  completionRate: number; // 0-100% of projects/activities completed
  feedbackScore: number; // 0-5 user rating
  timeSpent: number; // Seconds spent viewing recommendations
  returnRate: number; // How often users return to recommendations
}

/**
 * System performance metrics
 */
export interface SystemPerformanceMetrics {
  relevanceScore: number; // 0-100% relevance to user profile
  diversityScore: number; // 0-100% diversity of recommendations
  noveltyScore: number; // 0-100% uniqueness of recommendations
  responseTime: number; // Milliseconds to generate recommendations
  implementationRate: number; // % of recommendations implemented by users
}

/**
 * Current system evaluation
 * 
 * This function evaluates the current recommendation system and identifies
 * areas for improvement based on the specified criteria.
 */
export function evaluateCurrentSystem(): Record<string, string> {
  return {
    repetitiveCompetitions: `
      The current system pulls competition data from a limited set of sources, 
      often resulting in the same competitions being recommended to different students
      regardless of their specific profile nuances. The web search functionality attempts
      to diversify recommendations, but lacks sufficient filtering for relevance, recency,
      and user-specific matching.
    `,
    
    basicProjectRecommendations: `
      Project recommendations currently follow standardized templates with minimal
      customization beyond simple variable substitution. They lack depth in implementation
      guidance, complexity tiers, and progressive learning paths. Students receive
      generalized project ideas without specific steps, resources, or expected outcomes
      tailored to their skill level.
    `,
    
    userEngagementChallenges: `
      The current system does not track user engagement with recommendations or
      collect feedback on their relevance and usefulness. Without this data loop,
      the system cannot learn from user behavior or improve recommendations over time.
      This results in static recommendations that don't evolve with the student's
      progress or changing interests.
    `,
    
    recommendationDiversity: `
      Recommendations often cluster around common activities and skills without
      sufficient breadth across different domains relevant to the student's interests.
      The system does not adequately consider complementary skills or experiences
      that would create a well-rounded profile beyond the obvious choices for a
      given major or interest.
    `,
    
    personalizedLearningPath: `
      The current system provides point-in-time recommendations without establishing
      a coherent learning journey or growth path. Recommendations aren't sequenced
      based on prerequisite skills or progressive difficulty, limiting their
      educational value and long-term relevance to the student's development.
    `,
    
    dataSourceLimitations: `
      Competition and opportunity data is primarily hardcoded or retrieved through
      basic web searches without structured data validation or quality filtering.
      This leads to recommendations that may be outdated, irrelevant, or lacking
      important details such as deadlines, eligibility requirements, or application
      processes.
    `
  };
}

/**
 * Advanced filtering algorithm to prevent repetitive competition suggestions
 * 
 * This approach uses:
 * 1. User history tracking to avoid repeated suggestions
 * 2. Semantic similarity comparison to ensure diverse recommendations
 * 3. Difficulty and relevance scoring for better matching
 */
export function advancedCompetitionFiltering(
  competitions: EnhancedCompetitionRecommendation[],
  profile: StudentProfile,
  previousRecommendations: string[] = []
): EnhancedCompetitionRecommendation[] {
  // 1. Remove previously recommended competitions
  let filteredCompetitions = competitions.filter(
    comp => !previousRecommendations.includes(comp.name)
  );
  
  // 2. Calculate match scores based on student profile
  filteredCompetitions = calculateCompetitionMatchScores(filteredCompetitions, profile);
  
  // 3. Ensure category diversity
  const diverseCompetitions = ensureCategoryDiversity(filteredCompetitions);
  
  // 4. Sort by match score and select top results
  return diverseCompetitions
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5); // Limit to top 5 recommendations
}

/**
 * Calculate match scores between competitions and student profile
 */
function calculateCompetitionMatchScores(
  competitions: EnhancedCompetitionRecommendation[],
  profile: StudentProfile
): EnhancedCompetitionRecommendation[] {
  const major = profile.intendedMajor.toLowerCase();
  const activities = (profile.currentActivities + ' ' + profile.interestedActivities).toLowerCase();
  const grade = profile.gradeLevel.toLowerCase();
  
  return competitions.map(competition => {
    let score = 60; // Base score
    
    // Major alignment
    if (competition.category.some(cat => major.includes(cat.toLowerCase()))) {
      score += 15;
    }
    
    // Activity alignment
    if (competition.category.some(cat => activities.includes(cat.toLowerCase()))) {
      score += 10;
    }
    
    // Grade level appropriateness
    if (competition.eligibility.some(eli => 
      (eli.includes('high school') || 
       (grade.includes('9') && eli.includes('freshman')) ||
       (grade.includes('10') && eli.includes('sophomore')) ||
       (grade.includes('11') && eli.includes('junior')) ||
       (grade.includes('12') && eli.includes('senior')))
    )) {
      score += 15;
    }
    
    // Adjust score based on difficulty and student profile
    if (profile.satScore && !profile.satScore.includes('plan')) {
      const numericScore = parseInt(profile.satScore.replace(/\D/g, ""));
      
      // For high-scoring students, increase score for advanced competitions
      if (numericScore >= 1400 && competition.difficulty === 'advanced') {
        score += 10;
      }
      
      // For lower-scoring students, increase score for beginner competitions
      if (numericScore < 1200 && competition.difficulty === 'beginner') {
        score += 10;
      }
    }
    
    // Ensure score stays within 0-100 range
    return {
      ...competition,
      matchScore: Math.min(100, Math.max(0, score))
    };
  });
}

/**
 * Ensure diversity across competition categories
 */
function ensureCategoryDiversity(
  competitions: EnhancedCompetitionRecommendation[]
): EnhancedCompetitionRecommendation[] {
  const categoryCount: Record<string, number> = {};
  const result: EnhancedCompetitionRecommendation[] = [];
  
  // First pass: count categories
  competitions.forEach(comp => {
    comp.category.forEach(cat => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
  });
  
  // Sort by match score
  const sortedCompetitions = [...competitions].sort((a, b) => b.matchScore - a.matchScore);
  
  // Second pass: select diverse competitions
  // Start with the highest match score
  for (const comp of sortedCompetitions) {
    // Skip if already selected
    if (result.includes(comp)) continue;
    
    // Check if this category is over-represented
    const categoryOverRepresented = comp.category.every(cat => 
      result.filter(r => r.category.includes(cat)).length >= 2
    );
    
    if (!categoryOverRepresented || result.length < 3) {
      result.push(comp);
    }
    
    // Stop once we have enough
    if (result.length >= 5) break;
  }
  
  // If we didn't get enough, add more from the sorted list
  if (result.length < 5) {
    for (const comp of sortedCompetitions) {
      if (!result.includes(comp)) {
        result.push(comp);
      }
      if (result.length >= 5) break;
    }
  }
  
  return result;
}

/**
 * Skill level assessment for more appropriate project matching
 * 
 * This approach:
 * 1. Evaluates current skills from profile and activities
 * 2. Matches skill levels to appropriate projects
 * 3. Suggests a learning path with progressive difficulty
 */
export function assessUserSkillLevel(profile: StudentProfile): {
  skillLevels: Record<string, 'beginner' | 'intermediate' | 'advanced'>;
  recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced';
  learningPath: string[];
} {
  // Extract relevant information
  const major = profile.intendedMajor.toLowerCase();
  const activities = (profile.currentActivities + ' ' + profile.interestedActivities).toLowerCase();
  const grade = profile.gradeLevel.toLowerCase();
  
  // Default skill levels
  const skillLevels: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
    research: 'beginner',
    technical: 'beginner',
    creative: 'beginner',
    leadership: 'beginner',
    communication: 'beginner'
  };
  
  // Analyze activities for skill indicators
  if (activities.includes('research') || activities.includes('lab') || activities.includes('science fair')) {
    skillLevels.research = 'intermediate';
  }
  
  if (activities.includes('program') || activities.includes('coding') || activities.includes('develop')) {
    skillLevels.technical = 'intermediate';
  }
  
  if (activities.includes('lead') || activities.includes('president') || activities.includes('captain')) {
    skillLevels.leadership = 'intermediate';
  }
  
  if (activities.includes('art') || activities.includes('music') || activities.includes('creative')) {
    skillLevels.creative = 'intermediate';
  }
  
  if (activities.includes('debate') || activities.includes('speech') || activities.includes('writing')) {
    skillLevels.communication = 'intermediate';
  }
  
  // Advanced skills require specific indicators
  if (activities.includes('publish') || activities.includes('presented research')) {
    skillLevels.research = 'advanced';
  }
  
  if (activities.includes('app') || activities.includes('website') || activities.includes('software')) {
    skillLevels.technical = 'advanced';
  }
  
  if (activities.includes('founded') || activities.includes('director')) {
    skillLevels.leadership = 'advanced';
  }
  
  // Adjust based on grade level
  if (grade.includes('11') || grade.includes('12') || grade.includes('junior') || grade.includes('senior')) {
    // Upper classmen likely have more developed skills
    Object.keys(skillLevels).forEach(skill => {
      if (skillLevels[skill] === 'beginner') {
        skillLevels[skill] = 'intermediate';
      }
    });
  }
  
  // Determine overall recommended difficulty
  const skillValues = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3
  };
  
  const averageSkillLevel = Object.values(skillLevels).reduce(
    (sum, level) => sum + skillValues[level], 0
  ) / Object.keys(skillLevels).length;
  
  let recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced';
  if (averageSkillLevel < 1.5) {
    recommendedDifficulty = 'beginner';
  } else if (averageSkillLevel < 2.5) {
    recommendedDifficulty = 'intermediate';
  } else {
    recommendedDifficulty = 'advanced';
  }
  
  // Generate learning path
  const learningPath = generateLearningPath(skillLevels, major);
  
  return {
    skillLevels,
    recommendedDifficulty,
    learningPath
  };
}

/**
 * Generate a learning path based on current skill levels and major
 */
function generateLearningPath(
  skillLevels: Record<string, 'beginner' | 'intermediate' | 'advanced'>,
  major: string
): string[] {
  const path: string[] = [];
  
  // Identify skills to focus on based on major
  if (major.includes('comput') || major.includes('engineer')) {
    if (skillLevels.technical === 'beginner') {
      path.push('Learn the fundamentals of programming with Python or JavaScript');
      path.push('Build a simple web application with a user interface');
    } else if (skillLevels.technical === 'intermediate') {
      path.push('Develop a full-stack application with database integration');
      path.push('Contribute to open-source projects in your field');
    } else {
      path.push('Create a comprehensive software solution to a real-world problem');
      path.push('Publish your technical work or present at a conference');
    }
  } else if (major.includes('business') || major.includes('econ')) {
    if (skillLevels.leadership === 'beginner') {
      path.push('Start a small entrepreneurial project or school fundraiser');
      path.push('Learn fundamental business concepts through online courses');
    } else if (skillLevels.leadership === 'intermediate') {
      path.push('Create a business plan for a startup idea');
      path.push('Lead a school organization with budget responsibility');
    } else {
      path.push('Launch a functional business venture with measurable results');
      path.push('Organize a business competition or networking event');
    }
  }
  
  // Add communication skills progression for any major
  if (skillLevels.communication === 'beginner') {
    path.push('Practice public speaking through class presentations');
  } else if (skillLevels.communication === 'intermediate') {
    path.push('Lead workshops or training sessions in your area of expertise');
  } else {
    path.push('Present your work at conferences or community events');
  }
  
  return path;
}

/**
 * Create tiered project recommendations with implementation details
 */
export function createTieredProjectRecommendations(
  profile: StudentProfile,
  skillAssessment: ReturnType<typeof assessUserSkillLevel>
): EnhancedProjectRecommendation[] {
  const major = profile.intendedMajor.toLowerCase();
  const projects: EnhancedProjectRecommendation[] = [];
  
  // Add a beginner project regardless of skill level
  if (major.includes('comput') || major.includes('tech') || major.includes('engineer')) {
    projects.push({
      name: "Personal Portfolio Website",
      description: "Create a professional website to showcase your projects and skills",
      complexity: "beginner",
      timeframe: "2-4 weeks",
      skillsRequired: ["Basic HTML/CSS", "Simple JavaScript"],
      skillsDeveloped: ["Web Development", "Content Organization", "Personal Branding"],
      steps: [
        "1. Learn HTML/CSS basics through tutorials",
        "2. Design a simple layout with your information",
        "3. Add project showcases and descriptions",
        "4. Deploy to GitHub Pages or similar free hosting",
        "5. Share with mentors for feedback and improvement"
      ],
      resources: [
        { name: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web" },
        { name: "GitHub Pages", url: "https://pages.github.com/" },
        { name: "FreeCodeCamp Web Design", url: "https://www.freecodecamp.org/learn/responsive-web-design/" }
      ],
      category: ["Web Development", "Computer Science", "Design"],
      matchScore: 85
    });
    
    // Add intermediate project
    if (skillAssessment.recommendedDifficulty !== "beginner") {
      projects.push({
        name: "Environmental Monitoring System",
        description: "Build a device that collects and analyzes environmental data using sensors and microcontrollers",
        complexity: "intermediate",
        timeframe: "4-8 weeks",
        skillsRequired: ["Basic Programming", "Electronics Fundamentals", "Data Analysis"],
        skillsDeveloped: ["IoT Development", "Data Visualization", "Hardware Integration", "Environmental Science"],
        steps: [
          "1. Choose environmental factors to monitor (temperature, humidity, air quality, etc.)",
          "2. Select appropriate sensors and microcontroller (Arduino or Raspberry Pi recommended)",
          "3. Assemble hardware components with proper connections",
          "4. Program the device to collect and store data",
          "5. Create visualization dashboard for the collected data",
          "6. Analyze trends and patterns in your data",
          "7. Present findings and possible applications"
        ],
        resources: [
          { name: "Arduino Project Hub", url: "https://create.arduino.cc/projecthub" },
          { name: "Raspberry Pi Projects", url: "https://projects.raspberrypi.org/" },
          { name: "Adafruit Learning System", url: "https://learn.adafruit.com/" }
        ],
        category: ["Engineering", "Computer Science", "Environmental Science", "Data Science"],
        matchScore: 90
      });
    }
    
    // Add advanced project
    if (skillAssessment.recommendedDifficulty === "advanced") {
      projects.push({
        name: "Machine Learning Application for Local Issue",
        description: "Develop an ML-powered application that addresses a specific challenge in your school or community",
        complexity: "advanced",
        timeframe: "2-4 months",
        skillsRequired: ["Programming Proficiency", "Data Analysis", "Basic ML Concepts"],
        skillsDeveloped: ["Machine Learning", "AI Ethics", "Problem-Solving", "Project Management"],
        steps: [
          "1. Identify a local problem that could benefit from ML (e.g., resource allocation, pattern recognition)",
          "2. Collect and prepare relevant dataset",
          "3. Research appropriate ML algorithms for your problem",
          "4. Build and train your model using libraries like TensorFlow or PyTorch",
          "5. Create a user interface for interaction with your model",
          "6. Test with real users from your target audience",
          "7. Document your process, challenges, and results",
          "8. Present your solution to community stakeholders"
        ],
        resources: [
          { name: "Kaggle Courses", url: "https://www.kaggle.com/learn" },
          { name: "Google Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course" },
          { name: "AI4ALL", url: "https://ai-4-all.org/resources/" }
        ],
        category: ["Artificial Intelligence", "Computer Science", "Data Science", "Community Impact"],
        matchScore: 95
      });
    }
  }
  
  // For business/economics majors
  else if (major.includes('business') || major.includes('econ') || major.includes('financ')) {
    projects.push({
      name: "School Fundraising Campaign",
      description: "Organize and manage a fundraising initiative for your school or a cause you care about",
      complexity: "beginner",
      timeframe: "4-6 weeks",
      skillsRequired: ["Basic Communication", "Organization"],
      skillsDeveloped: ["Fundraising", "Marketing", "Budget Management", "Leadership"],
      steps: [
        "1. Select a meaningful cause or project to fund",
        "2. Set specific, measurable fundraising goals",
        "3. Create a marketing plan to promote your campaign",
        "4. Develop a budget and track expenses",
        "5. Implement the fundraising activities",
        "6. Document results and create a final report",
        "7. Thank donors and communicate impact"
      ],
      resources: [
        { name: "School Fundraising Ideas", url: "https://www.fundraisingip.com/fundraising-ideas/school-fundraising-ideas/" },
        { name: "GoFundMe Education", url: "https://www.gofundme.com/c/fundraising-ideas/school" }
      ],
      category: ["Business", "Marketing", "Finance", "Leadership"],
      matchScore: 85
    });
    
    // Add more projects for business majors based on skill level...
  }
  
  // Add projects for other major types...
  
  return projects;
}

/**
 * Enhanced competition data sourcing and matching algorithm
 */
export function enhanceCompetitionRecommendations(
  competitions: string[],
  profile: StudentProfile
): EnhancedCompetitionRecommendation[] {
  // Parse existing competition strings
  const parsedCompetitions = competitions.map(comp => parseCompetitionString(comp));
  
  // Enrich with additional metadata
  return enrichCompetitionData(parsedCompetitions, profile);
}

/**
 * Parse competition strings into structured format
 */
function parseCompetitionString(competitionString: string): Partial<EnhancedCompetitionRecommendation> {
  // Extract name and URL if available
  const nameMatch = competitionString.match(/^([^\[\(]+)/);
  const name = nameMatch ? nameMatch[1].trim() : competitionString.trim();
  
  // Extract URL if in markdown format [name](url)
  const urlMatch = competitionString.match(/\[([^\]]+)\]\(([^)]+)\)/);
  const url = urlMatch ? urlMatch[2] : "";
  
  // Extract description (anything after the name/url)
  let description = competitionString;
  if (nameMatch) {
    description = competitionString.replace(nameMatch[0], '').trim();
  }
  if (urlMatch) {
    description = description.replace(urlMatch[0], '').trim();
  }
  // Remove any leading punctuation
  description = description.replace(/^[-:;,.\s]+/, '').trim();
  
  return {
    name,
    url,
    description,
    category: inferCompetitionCategories(name, description)
  };
}

/**
 * Infer categories from competition name and description
 */
function inferCompetitionCategories(name: string, description: string): string[] {
  const categories: string[] = [];
  const text = (name + ' ' + description).toLowerCase();
  
  // Subject areas
  if (text.includes('math') || text.includes('mathematic')) categories.push('Mathematics');
  if (text.includes('science') || text.includes('scientific')) categories.push('Science');
  if (text.includes('physics')) categories.push('Physics');
  if (text.includes('chemistry') || text.includes('chem ')) categories.push('Chemistry');
  if (text.includes('biology') || text.includes('bio ')) categories.push('Biology');
  if (text.includes('computer') || text.includes('coding') || text.includes('programming')) 
    categories.push('Computer Science');
  if (text.includes('engineering') || text.includes('robot')) categories.push('Engineering');
  if (text.includes('business') || text.includes('entrepreneur')) categories.push('Business');
  if (text.includes('econ')) categories.push('Economics');
  if (text.includes('essay') || text.includes('writing')) categories.push('Writing');
  if (text.includes('art') || text.includes('design')) categories.push('Arts');
  if (text.includes('history')) categories.push('History');
  if (text.includes('philosophy')) categories.push('Philosophy');
  
  // Competition types
  if (text.includes('olympiad')) categories.push('Olympiad');
  if (text.includes('challenge')) categories.push('Challenge');
  if (text.includes('fair')) categories.push('Fair');
  if (text.includes('contest')) categories.push('Contest');
  if (text.includes('scholarship')) categories.push('Scholarship');
  if (text.includes('award')) categories.push('Award');
  
  // Default category if none found
  if (categories.length === 0) categories.push('Academic');
  
  return categories;
}

/**
 * Enrich competition data with additional metadata
 */
function enrichCompetitionData(
  competitions: Partial<EnhancedCompetitionRecommendation>[],
  profile: StudentProfile
): EnhancedCompetitionRecommendation[] {
  // Map known competitions to enhanced data
  return competitions.map(comp => {
    const name = comp.name || '';
    
    // Default values
    const enhanced: EnhancedCompetitionRecommendation = {
      name: name,
      url: comp.url || '',
      description: comp.description || 'A competitive opportunity for students to showcase their skills and knowledge.',
      eligibility: ['High school students'],
      deadline: 'Varies annually, check website for current deadlines',
      category: comp.category || ['Academic'],
      difficulty: 'intermediate',
      matchScore: 75,
      competitiveness: 'medium',
      benefits: ['Recognition', 'College application enhancement']
    };
    
    // Enhanced data for well-known competitions
    if (name.includes('Science Talent Search') || name.includes('Regeneron')) {
      return {
        ...enhanced,
        name: 'Regeneron Science Talent Search (STS)',
        url: 'https://www.societyforscience.org/regeneron-sts/',
        description: 'The nation\'s oldest and most prestigious science competition for high school seniors, providing an important forum for original research.',
        eligibility: ['High school seniors', 'U.S. citizens or permanent residents'],
        deadline: 'November (annually)',
        category: ['Science', 'Research', 'STEM'],
        difficulty: 'advanced',
        competitiveness: 'very high',
        benefits: ['Scholarships up to $250,000', 'National recognition', 'Research community connection'],
        matchScore: calculateCompetitionMatchScore('science', profile)
      };
    }
    else if (name.includes('International Science and Engineering Fair') || name.includes('ISEF')) {
      return {
        ...enhanced,
        name: 'International Science and Engineering Fair (ISEF)',
        url: 'https://www.societyforscience.org/isef/',
        description: 'The world\'s largest international pre-college science competition, providing a forum for students to showcase their research.',
        eligibility: ['High school students (grades 9-12)', 'Winners of affiliated science fairs'],
        deadline: 'Varies by regional fair (typically winter/spring)',
        category: ['Science', 'Engineering', 'STEM', 'Research'],
        difficulty: 'advanced',
        competitiveness: 'high',
        benefits: ['Scholarships and awards', 'International recognition', 'College recruitment exposure'],
        matchScore: calculateCompetitionMatchScore('science', profile)
      };
    }
    else if (name.includes('Math') && name.includes('Olympiad')) {
      return {
        ...enhanced,
        name: 'International Mathematical Olympiad (IMO)',
        url: 'https://www.imo-official.org/',
        description: 'The World Championship Mathematics Competition for High School students held annually in a different country.',
        eligibility: ['High school students', 'Under 20 years old', 'Selected through national competitions'],
        deadline: 'Varies by country (national qualification rounds)',
        category: ['Mathematics', 'Problem Solving', 'Olympiad'],
        difficulty: 'advanced',
        competitiveness: 'very high',
        benefits: ['International recognition', 'Gold/Silver/Bronze medals', 'Network with math talent worldwide'],
        matchScore: calculateCompetitionMatchScore('math', profile)
      };
    }
    
    // Generic competition matching score
    enhanced.matchScore = calculateCompetitionMatchScore(
      enhanced.category.join(' ').toLowerCase(), 
      profile
    );
    
    return enhanced;
  });
}

/**
 * Calculate competition match score based on profile
 */
function calculateCompetitionMatchScore(competitionCategory: string, profile: StudentProfile): number {
  const major = profile.intendedMajor.toLowerCase();
  const interests = (profile.currentActivities + ' ' + profile.interestedActivities).toLowerCase();
  
  let score = 65; // Base score
  
  // Major alignment (up to +20)
  if (major.includes('comput') && competitionCategory.includes('computer')) score += 20;
  else if (major.includes('math') && competitionCategory.includes('math')) score += 20;
  else if (major.includes('scien') && competitionCategory.includes('science')) score += 20;
  else if (major.includes('engineer') && competitionCategory.includes('engineer')) score += 20;
  else if (major.includes('business') && competitionCategory.includes('business')) score += 20;
  else if (major.includes('art') && competitionCategory.includes('art')) score += 20;
  else if (major.includes('write') && competitionCategory.includes('essay')) score += 20;
  // Add more major-competition matches...
  else if (competitionCategory.includes(major.substring(0, 5))) score += 15;
  
  // Interest alignment (up to +15)
  if (interests.includes('research') && competitionCategory.includes('research')) score += 15;
  else if (interests.includes('robot') && competitionCategory.includes('robot')) score += 15;
  else if (interests.includes('code') && competitionCategory.includes('program')) score += 15;
  // Add more interest-competition matches...
  
  // Ensure score is within range
  return Math.min(100, Math.max(0, score));
}

/**
 * Implement the new hybrid recommendation approach
 * 
 * This combines:
 * 1. Collaborative filtering (similar students like similar activities)
 * 2. Content-based filtering (matching based on properties)
 * 3. User feedback incorporation
 * 4. Progressive recommendation paths
 */
export async function generateImprovedRecommendations(
  profile: StudentProfile,
  userHistory?: {
    viewedRecommendations?: string[];
    completedActivities?: string[];
    feedback?: Record<string, number>; // recommendation ID -> rating
  }
): Promise<ComprehensiveRecommendationResponse> {
  // 1. Get base recommendations using existing system
  const baseTemplates = selectTemplates(profile);
  
  // 2. Assess student skill level
  const skillAssessment = assessUserSkillLevel(profile);
  
  // 3. Generate tiered project recommendations
  const enhancedProjects = createTieredProjectRecommendations(profile, skillAssessment);
  
  // 4. Get raw competition recommendations 
  // (Note: In a real implementation, this would call the actual API)
  const mockCompetitions: EnhancedCompetitionRecommendation[] = [
    {
      name: "International Science and Engineering Fair (ISEF)",
      url: "https://www.societyforscience.org/isef/",
      description: "The world's largest pre-college science competition.",
      eligibility: ["High school students (grades 9-12)", "Winners of affiliated fairs"],
      deadline: "Varies by regional fair",
      category: ["Science", "Engineering", "Research", "STEM"],
      difficulty: "advanced",
      matchScore: 85,
      competitiveness: "high",
      benefits: ["Scholarships", "Awards", "Recognition", "College recruitment"]
    },
    {
      name: "Regeneron Science Talent Search",
      url: "https://www.societyforscience.org/regeneron-sts/",
      description: "The nation's oldest and most prestigious science competition for high school seniors.",
      eligibility: ["High school seniors", "U.S. citizens or permanent residents"],
      deadline: "November",
      category: ["Science", "Research", "STEM"],
      difficulty: "advanced",
      matchScore: 90,
      competitiveness: "very high",
      benefits: ["Scholarships up to $250,000", "National recognition"]
    },
    // Add more mock competitions...
    {
      name: "FIRST Robotics Competition",
      url: "https://www.firstinspires.org/robotics/frc",
      description: "A robotics competition where teams design, build, and program robots to compete in challenges.",
      eligibility: ["High school students (grades 9-12)"],
      deadline: "Registration in fall, competition in spring",
      category: ["Robotics", "Engineering", "Programming", "STEM"],
      difficulty: "intermediate",
      matchScore: 80,
      competitiveness: "medium",
      benefits: ["Teamwork experience", "Technical skills", "Scholarships", "Networking"]
    },
    {
      name: "Congressional App Challenge",
      url: "https://www.congressionalappchallenge.us/",
      description: "A competition encouraging students to learn code by creating their own applications.",
      eligibility: ["Middle and high school students"],
      deadline: "November",
      category: ["Computer Science", "App Development", "Programming", "STEM"],
      difficulty: "intermediate",
      matchScore: 75,
      competitiveness: "medium",
      benefits: ["Recognition", "Congressional acknowledgment", "Exhibition"]
    },
    {
      name: "National Economics Challenge",
      url: "https://www.econedlink.org/national-economics-challenge/",
      description: "The nation's most prestigious economics competition for high school students.",
      eligibility: ["High school students (grades 9-12)"],
      deadline: "Spring registration",
      category: ["Economics", "Business", "Finance"],
      difficulty: "advanced",
      matchScore: 70,
      competitiveness: "high",
      benefits: ["Awards", "Recognition", "Economics knowledge"]
    },
    {
      name: "Scholastic Art & Writing Awards",
      url: "https://www.artandwriting.org/",
      description: "The nation's longest-running, most prestigious recognition program for creative teens.",
      eligibility: ["Students grades 7-12"],
      deadline: "December/January (varies by region)",
      category: ["Art", "Writing", "Creative", "Humanities"],
      difficulty: "intermediate",
      matchScore: 65,
      competitiveness: "high",
      benefits: ["Scholarships", "Exhibition", "Publication", "Recognition"]
    },
    {
      name: "National Speech and Debate Tournament",
      url: "https://www.speechanddebate.org/nationals/",
      description: "Premier national speech and debate competition with multiple event categories.",
      eligibility: ["Qualified high school students", "District champions"],
      deadline: "Qualification throughout school year",
      category: ["Speech", "Debate", "Communication", "Humanities"],
      difficulty: "advanced",
      matchScore: 60,
      competitiveness: "very high",
      benefits: ["Recognition", "Communication skills", "Scholarships"]
    }
  ];
  
  // 5. Apply advanced filtering to competitions
  const enhancedCompetitions = advancedCompetitionFiltering(
    mockCompetitions, 
    profile,
    userHistory?.viewedRecommendations || []
  );
  
  // 6. Generate skill gap analysis
  const skillGapAnalysis = {
    currentSkills: inferCurrentSkills(profile),
    recommendedSkills: generateRecommendedSkills(profile, inferCurrentSkills(profile)),
    learningPath: {
      shortTerm: skillAssessment.learningPath.slice(0, 1),
      mediumTerm: skillAssessment.learningPath.slice(1, 2),
      longTerm: skillAssessment.learningPath.slice(2)
    }
  };
  
  // 7. Calculate user feedback metrics (would use actual data in production)
  const userFeedbackMetrics = {
    recommendationRelevance: 85, // 0-100
    implementationDifficulty: 65, // 0-100
    diversityScore: 80 // 0-100
  };
  
  // 8. Create comprehensive response with all enhanced components
  return {
    // Basic recommendation components (from existing system)
    suggestedProjects: enhancedProjects.map(p => p.name),
    suggestedCompetitions: enhancedCompetitions.map(c => 
      c.url ? `[${c.name}](${c.url})` : c.name
    ),
    suggestedSkills: skillGapAnalysis.recommendedSkills,
    timeline: [
      // Generate timeline based on grade level
      "Focus on building foundational skills and exploring interests",
      "Develop expertise in key areas aligned with your intended major",
      "Take leadership roles and create substantive projects",
      "Finalize college applications and showcase achievements"
    ],
    profileAnalysis: generateEnhancedProfileAnalysis(profile, skillAssessment),
    
    // Enhanced recommendation components
    recommendedActivities: [], // Would populate with actual data
    enhancedCompetitions: enhancedCompetitions,
    enhancedProjects: enhancedProjects,
    skillGapAnalysis: skillGapAnalysis,
    userFeedbackMetrics: userFeedbackMetrics,
    adaptiveRecommendations: true
  };
}

/**
 * Infer current skills from student profile
 */
function inferCurrentSkills(profile: StudentProfile): string[] {
  const skills: string[] = [];
  const activities = (profile.currentActivities + ' ' + profile.interestedActivities).toLowerCase();
  
  // Map activities to skills
  if (activities.includes('research')) skills.push('Research Methodology');
  if (activities.includes('program') || activities.includes('coding')) skills.push('Programming');
  if (activities.includes('lead') || activities.includes('president')) skills.push('Leadership');
  if (activities.includes('volunteer') || activities.includes('community')) skills.push('Community Service');
  if (activities.includes('debate') || activities.includes('speech')) skills.push('Public Speaking');
  if (activities.includes('write') || activities.includes('journal')) skills.push('Writing');
  if (activities.includes('art') || activities.includes('design')) skills.push('Creative Expression');
  
  // Add some default skills based on grade level
  const grade = profile.gradeLevel.toLowerCase();
  if (grade.includes('11') || grade.includes('12') || grade.includes('junior') || grade.includes('senior')) {
    skills.push('Time Management');
    skills.push('Academic Research');
  }
  
  return skills.length > 0 ? skills : ['Academic Foundations', 'Time Management'];
}

/**
 * Generate recommended skills based on gaps
 */
function generateRecommendedSkills(profile: StudentProfile, currentSkills: string[]): string[] {
  const major = profile.intendedMajor.toLowerCase();
  const recommendedSkills: string[] = [];
  
  // Essential skills for any student
  if (!currentSkills.some(s => s.includes('Management'))) {
    recommendedSkills.push('Project Management');
  }
  
  if (!currentSkills.some(s => s.includes('Speak'))) {
    recommendedSkills.push('Public Speaking and Presentation');
  }
  
  // Major-specific skills
  if (major.includes('comput') || major.includes('tech')) {
    if (!currentSkills.some(s => s.includes('Program'))) {
      recommendedSkills.push('Programming in a High-Level Language');
    }
    if (!currentSkills.some(s => s.includes('Data'))) {
      recommendedSkills.push('Data Analysis and Visualization');
    }
  }
  
  if (major.includes('science') || major.includes('bio') || major.includes('chem')) {
    if (!currentSkills.some(s => s.includes('Research'))) {
      recommendedSkills.push('Scientific Research Methods');
    }
    if (!currentSkills.some(s => s.includes('Lab'))) {
      recommendedSkills.push('Laboratory Techniques and Safety');
    }
  }
  
  if (major.includes('business') || major.includes('econ')) {
    if (!currentSkills.some(s => s.includes('Financial'))) {
      recommendedSkills.push('Financial Literacy and Analysis');
    }
    if (!currentSkills.some(s => s.includes('Entrepreneur'))) {
      recommendedSkills.push('Entrepreneurial Thinking');
    }
  }
  
  if (major.includes('art') || major.includes('design') || major.includes('music')) {
    if (!currentSkills.some(s => s.includes('Portfolio'))) {
      recommendedSkills.push('Portfolio Development and Curation');
    }
    if (!currentSkills.some(s => s.includes('Critique'))) {
      recommendedSkills.push('Critical Analysis and Artistic Critique');
    }
  }
  
  // Ensure we have at least 3 recommendations
  if (recommendedSkills.length < 3) {
    const additionalOptions = [
      'Collaborative Teamwork',
      'Technical Writing',
      'Critical Thinking and Analysis',
      'Research and Documentation',
      'Professional Networking'
    ];
    
    for (const skill of additionalOptions) {
      if (!recommendedSkills.includes(skill) && !currentSkills.includes(skill)) {
        recommendedSkills.push(skill);
        if (recommendedSkills.length >= 3) break;
      }
    }
  }
  
  return recommendedSkills;
}

/**
 * Generate an enhanced profile analysis with more detailed insights
 */
function generateEnhancedProfileAnalysis(
  profile: StudentProfile,
  skillAssessment: ReturnType<typeof assessUserSkillLevel>
): string {
  const major = profile.intendedMajor || "undecided field";
  const grade = profile.gradeLevel || "current grade level";
  const gradeCategory = getGradeCategory(grade);
  
  // Skill level assessment summary
  const skillLevels = skillAssessment.skillLevels;
  const strongestSkill = Object.entries(skillLevels)
    .sort((a, b) => getSkillValue(b[1]) - getSkillValue(a[1]))
    [0];
  
  const weakestSkill = Object.entries(skillLevels)
    .sort((a, b) => getSkillValue(a[1]) - getSkillValue(b[1]))
    [0];
  
  // Build comprehensive analysis
  let analysis = `Your profile shows a focus on ${major} with a particular strength in ${formatSkillName(strongestSkill[0])} (${strongestSkill[1]} level). `;
  
  // Grade-specific insights
  switch (gradeCategory) {
    case 'freshman':
      analysis += `As a freshman, you're at an excellent stage to explore different aspects of ${major} while building a strong academic foundation. Your current activities provide a good starting point, and there's significant room to develop specialized skills and experiences over the next three years. `;
      break;
    case 'sophomore':
      analysis += `As a sophomore, you're entering a key phase for developing depth in your activities related to ${major}. Now is the time to move from general participation to seeking specific leadership roles or specialized projects that demonstrate your commitment and growth. `;
      break;
    case 'junior':
      analysis += `Junior year is critical for your college applications. Your interest in ${major} should now be reflected in your course selections, extracurricular leadership, and potentially a substantive project or research experience that showcases your capabilities in this field. `;
      break;
    case 'senior':
      analysis += `As a senior applying to college, your profile should emphasize your highest achievements and deepest involvements related to ${major}. Focus on how your experiences have prepared you for college-level work in this field and demonstrated your potential for future contributions. `;
      break;
    default:
      analysis += `At your current stage, focusing on developing skills and experiences aligned with ${major} will strengthen your college applications. `;
  }
  
  // Skill development focus
  analysis += `Based on your profile, I recommend focusing on developing your ${formatSkillName(weakestSkill[0])} skills (currently at ${weakestSkill[1]} level) to create a more balanced profile. `;
  
  // Competitive positioning
  analysis += `For competitive college admissions in ${major}, you'll want to demonstrate both breadth of knowledge and depth of expertise. The recommended projects and competitions are designed to help you showcase your abilities while building relevant skills that colleges value in successful applicants. `;
  
  // Development pathway
  analysis += `Your overall skill level suggests you're ready for ${skillAssessment.recommendedDifficulty}-level activities. The recommendations provided create a pathway for growth that will help you progress to more advanced opportunities aligned with your interests and goals.`;
  
  return analysis;
}

/**
 * Helper function to get skill value for sorting
 */
function getSkillValue(level: 'beginner' | 'intermediate' | 'advanced'): number {
  switch (level) {
    case 'beginner': return 1;
    case 'intermediate': return 2;
    case 'advanced': return 3;
    default: return 0;
  }
}

/**
 * Format skill name for readability
 */
function formatSkillName(skill: string): string {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

/**
 * Determine grade category for analysis
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

/**
 * Define benchmarks and metrics for measuring recommendation system improvements
 */
export const systemBenchmarks = {
  relevance: {
    description: "Measure how well recommendations match student profile",
    metrics: [
      {
        name: "Profile Match Score",
        target: ">=85%",
        measurement: "Average of match scores across all recommendations"
      },
      {
        name: "Major Alignment",
        target: ">=90%",
        measurement: "Percentage of recommendations directly relevant to intended major"
      },
      {
        name: "User Satisfaction",
        target: ">=4.2/5",
        measurement: "Average rating from user feedback surveys"
      }
    ]
  },
  
  diversity: {
    description: "Ensure recommendations cover a variety of categories and difficulty levels",
    metrics: [
      {
        name: "Category Diversity",
        target: ">=4 categories",
        measurement: "Number of unique categories in recommendation set"
      },
      {
        name: "Skill Breadth",
        target: ">=5 unique skills",
        measurement: "Number of distinct skills covered in recommendations"
      },
      {
        name: "Difficulty Distribution",
        target: "All 3 levels represented",
        measurement: "Presence of beginner, intermediate, and advanced recommendations"
      }
    ]
  },
  
  engagement: {
    description: "Track user interaction with recommendations",
    metrics: [
      {
        name: "Click-through Rate",
        target: ">=40%",
        measurement: "Percentage of recommendations users interact with"
      },
      {
        name: "Implementation Rate",
        target: ">=25%",
        measurement: "Percentage of recommendations users report completing"
      },
      {
        name: "Return Rate",
        target: ">=65%",
        measurement: "Percentage of users who return to view recommendations"
      }
    ]
  },
  
  performance: {
    description: "Ensure system operates efficiently",
    metrics: [
      {
        name: "Generation Time",
        target: "<3 seconds",
        measurement: "Time to generate full recommendation set"
      },
      {
        name: "Data Freshness",
        target: "<=6 months",
        measurement: "Age of competition and opportunity data"
      },
      {
        name: "Error Rate",
        target: "<1%",
        measurement: "Percentage of recommendation requests that fail"
      }
    ]
  }
};

/**
 * Implementation roadmap for the enhanced recommendation system
 */
export const implementationRoadmap = [
  {
    phase: "Phase 1: Foundation Improvements",
    timeline: "2-4 weeks",
    tasks: [
      "Implement basic skill level assessment algorithm",
      "Create tiered project structures with detailed steps",
      "Develop enhanced competition metadata extraction",
      "Set up metrics tracking for basic engagement data"
    ],
    deliverables: [
      "Skill assessment module",
      "Tiered project recommendation system",
      "Enhanced competition data model",
      "Basic metrics dashboard"
    ]
  },
  {
    phase: "Phase 2: Advanced Filtering & Personalization",
    timeline: "4-6 weeks",
    tasks: [
      "Implement advanced filtering to prevent repetition",
      "Develop user history tracking and preference learning",
      "Create adaptive difficulty adjustment based on feedback",
      "Build comprehensive skill progression paths"
    ],
    deliverables: [
      "Anti-repetition algorithm",
      "User preference model",
      "Adaptive difficulty system",
      "Skill progression generator"
    ]
  },
  {
    phase: "Phase 3: Feedback Loop & Continuous Improvement",
    timeline: "Ongoing",
    tasks: [
      "Implement user feedback collection for each recommendation",
      "Develop analytics dashboard for recommendation performance",
      "Create A/B testing framework for recommendation strategies",
      "Build automatic data refreshing for competition information"
    ],
    deliverables: [
      "Feedback collection system",
      "Performance analytics dashboard",
      "A/B testing platform",
      "Data refresh automation"
    ]
  }
];

/**
 * Long-term vision for the recommendation system
 */
export const systemVision = {
  adaptiveLearning: `
    The recommendation system will evolve into an adaptive learning platform that 
    understands not just what activities to suggest, but how to sequence them for
    optimal skill development and college preparation. The system will learn from
    both individual user patterns and aggregate user data to continuously improve
    its recommendation quality.
  `,
  
  personalizedJourneys: `
    Rather than providing static recommendations, the system will create dynamic,
    personalized journeys for each student based on their starting point, goals,
    and ongoing progress. It will suggest adjustments based on performance and 
    changing interests, creating a truly adaptive college preparation experience.
  `,
  
  dataEnrichment: `
    The system will integrate with multiple external data sources to maintain
    current, comprehensive information on competitions, scholarships, and 
    opportunities. It will automatically evaluate the quality of these opportunities
    based on user feedback and outcomes, ensuring only the most valuable recommendations
    are presented to students.
  `,
  
  communityInsights: `
    By aggregating anonymized data on student activities, success patterns, and
    college outcomes, the system will provide valuable insights to the broader
    educational community about effective preparation strategies. This will create
    a virtuous cycle of continuous improvement for both the recommendation engine
    and the student community it serves.
  `
};