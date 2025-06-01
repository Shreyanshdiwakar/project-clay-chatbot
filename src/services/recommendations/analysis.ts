/**
 * Recommendation Analysis Service
 * 
 * This module provides advanced analysis capabilities for generating
 * more personalized and relevant recommendations.
 */

import { StudentProfile } from '@/components/StudentQuestionnaire';

// Student skill assessment - determines appropriate difficulty level and learning path
export function assessUserSkillLevel(profile: StudentProfile): {
  skillLevels: Record<string, 'beginner' | 'intermediate' | 'advanced'>;
  recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced';
  learningPath: string[];
} {
  // Extract key information
  const grade = profile.gradeLevel.toLowerCase();
  const major = profile.intendedMajor.toLowerCase();
  const activities = profile.currentActivities.toLowerCase();
  const interests = profile.interestedActivities.toLowerCase();
  
  // Initialize skill levels
  const skillLevels: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
    research: 'beginner',
    technical: 'beginner',
    leadership: 'beginner',
    communication: 'beginner',
    analytical: 'beginner'
  };
  
  // Assess grade level
  let gradeLevel = 0;
  if (grade.includes('9') || grade.includes('fresh')) {
    gradeLevel = 1;
  } else if (grade.includes('10') || grade.includes('soph')) {
    gradeLevel = 2;
  } else if (grade.includes('11') || grade.includes('jun')) {
    gradeLevel = 3;
  } else if (grade.includes('12') || grade.includes('sen')) {
    gradeLevel = 4;
  }
  
  // Assess research skills
  if (activities.includes('research') || activities.includes('lab') || activities.includes('science fair')) {
    skillLevels.research = gradeLevel >= 3 ? 'advanced' : 'intermediate';
  } else if (activities.includes('science') || activities.includes('experiment') || activities.includes('project')) {
    skillLevels.research = 'intermediate';
  }
  
  // Assess technical skills
  if (activities.includes('coding') || activities.includes('programming') || 
      activities.includes('app') || activities.includes('software') || 
      activities.includes('develop')) {
    skillLevels.technical = gradeLevel >= 3 ? 'advanced' : 'intermediate';
  } else if (activities.includes('computer') || activities.includes('tech') || 
             activities.includes('math') || activities.includes('engineer')) {
    skillLevels.technical = 'intermediate';
  }
  
  // Assess leadership skills
  if (activities.includes('president') || activities.includes('founder') || 
      activities.includes('captain') || activities.includes('lead') || 
      activities.includes('chair')) {
    skillLevels.leadership = gradeLevel >= 2 ? 'advanced' : 'intermediate';
  } else if (activities.includes('club') || activities.includes('team') || 
             activities.includes('organization') || activities.includes('committee')) {
    skillLevels.leadership = 'intermediate';
  }
  
  // Assess communication skills
  if (activities.includes('debate') || activities.includes('speech') || 
      activities.includes('publication') || activities.includes('editor') || 
      activities.includes('write')) {
    skillLevels.communication = gradeLevel >= 3 ? 'advanced' : 'intermediate';
  } else if (activities.includes('present') || activities.includes('journal') || 
             activities.includes('newspaper') || activities.includes('blog')) {
    skillLevels.communication = 'intermediate';
  }
  
  // Assess analytical skills
  if (activities.includes('math') || activities.includes('science') || 
      activities.includes('research') || activities.includes('econom') || 
      activities.includes('analysis')) {
    skillLevels.analytical = gradeLevel >= 3 ? 'advanced' : 'intermediate';
  } else if (activities.includes('problem') || activities.includes('puzzle') || 
             activities.includes('game') || activities.includes('debate')) {
    skillLevels.analytical = 'intermediate';
  }
  
  // Consider grade level for overall assessment
  // Freshmen and sophomores generally start at lower levels
  if (gradeLevel <= 2) {
    Object.keys(skillLevels).forEach(skill => {
      if (skillLevels[skill] === 'advanced') {
        skillLevels[skill] = 'intermediate';
      }
    });
  }
  
  // Determine recommended overall difficulty level
  const skillCounts = {
    beginner: Object.values(skillLevels).filter(level => level === 'beginner').length,
    intermediate: Object.values(skillLevels).filter(level => level === 'intermediate').length,
    advanced: Object.values(skillLevels).filter(level => level === 'advanced').length
  };
  
  let recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced';
  
  if (skillCounts.advanced >= 2 && gradeLevel >= 3) {
    recommendedDifficulty = 'advanced';
  } else if (skillCounts.intermediate >= 3 || gradeLevel >= 2) {
    recommendedDifficulty = 'intermediate';
  } else {
    recommendedDifficulty = 'beginner';
  }
  
  // Create personalized learning path
  const learningPath = generateLearningPath(profile, skillLevels, recommendedDifficulty);
  
  return {
    skillLevels,
    recommendedDifficulty,
    learningPath
  };
}

// Helper function to generate a personalized learning path
function generateLearningPath(
  profile: StudentProfile,
  skillLevels: Record<string, 'beginner' | 'intermediate' | 'advanced'>,
  recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced'
): string[] {
  const major = profile.intendedMajor.toLowerCase();
  const path: string[] = [];
  
  // Identify weakest and strongest skills
  const sortedSkills = Object.entries(skillLevels)
    .sort(([, levelA], [, levelB]) => {
      const levelMap = { beginner: 0, intermediate: 1, advanced: 2 };
      return levelMap[levelA] - levelMap[levelB];
    });
  
  const weakestSkill = sortedSkills[0][0];
  const strongestSkill = sortedSkills[sortedSkills.length - 1][0];
  
  // Add skill development steps based on major and current skill levels
  if (major.includes('comput') || major.includes('engineer') || major.includes('tech') || 
      major.includes('math') || major.includes('physic')) {
    path.push(`Develop ${weakestSkill} skills through technical projects`);
    path.push('Create a portfolio showcasing your technical abilities');
    path.push('Participate in coding competitions or hackathons');
    
    if (recommendedDifficulty === 'beginner') {
      path.push('Learn fundamental programming concepts');
      path.push('Build simple applications to demonstrate basic skills');
    } else if (recommendedDifficulty === 'intermediate') {
      path.push('Develop more complex projects with practical applications');
      path.push('Contribute to open-source projects or research initiatives');
    } else {
      path.push('Lead technical teams or create innovative solutions to challenging problems');
      path.push('Pursue research opportunities or entrepreneurial ventures');
    }
  } else if (major.includes('business') || major.includes('econ') || major.includes('financ')) {
    path.push(`Strengthen ${weakestSkill} skills through business-focused activities`);
    path.push('Develop a business plan or economic analysis project');
    path.push('Participate in business competitions or case studies');
    
    if (recommendedDifficulty === 'beginner') {
      path.push('Learn fundamental business and economic concepts');
      path.push('Participate in introductory business programs or clubs');
    } else if (recommendedDifficulty === 'intermediate') {
      path.push('Take on leadership roles in business organizations');
      path.push('Develop market analysis or investment projects');
    } else {
      path.push('Create a startup or significant business initiative');
      path.push('Pursue advanced financial analysis or economic research');
    }
  } else if (major.includes('science') || major.includes('bio') || major.includes('chem')) {
    path.push(`Enhance ${weakestSkill} skills through scientific inquiry`);
    path.push('Design and conduct experiments in your area of interest');
    path.push('Participate in science fairs or research competitions');
    
    if (recommendedDifficulty === 'beginner') {
      path.push('Learn fundamental scientific methods and concepts');
      path.push('Join science clubs or entry-level research programs');
    } else if (recommendedDifficulty === 'intermediate') {
      path.push('Conduct more sophisticated experiments or literature reviews');
      path.push('Seek research assistantships or specialized programs');
    } else {
      path.push('Lead independent research projects with potential publication');
      path.push('Present findings at conferences or in scientific journals');
    }
  } else if (major.includes('art') || major.includes('music') || major.includes('drama') || 
             major.includes('film') || major.includes('design') || major.includes('creat')) {
    path.push(`Strengthen ${weakestSkill} skills through creative expression`);
    path.push('Develop a portfolio showcasing your artistic abilities');
    path.push('Participate in exhibitions, performances, or competitions');
    
    if (recommendedDifficulty === 'beginner') {
      path.push('Master fundamental techniques in your creative field');
      path.push('Join arts organizations or take specialized classes');
    } else if (recommendedDifficulty === 'intermediate') {
      path.push('Create more sophisticated works with conceptual depth');
      path.push('Seek mentorship or collaborative opportunities');
    } else {
      path.push('Develop a distinctive creative voice through ambitious projects');
      path.push('Pursue public exhibitions, performances, or publications');
    }
  } else {
    // Generic path for other majors
    path.push(`Improve ${weakestSkill} skills through targeted activities`);
    path.push(`Leverage your strength in ${strongestSkill} for new opportunities`);
    path.push('Develop a well-rounded profile with academic and extracurricular achievements');
    
    if (recommendedDifficulty === 'beginner') {
      path.push('Explore different activities to discover your passions');
      path.push('Build fundamental skills through entry-level opportunities');
    } else if (recommendedDifficulty === 'intermediate') {
      path.push('Take on leadership roles in organizations aligned with your interests');
      path.push('Develop specialized knowledge through focused projects');
    } else {
      path.push('Create significant impact through ambitious initiatives');
      path.push('Seek prestigious opportunities that showcase your abilities');
    }
  }
  
  return path;
}

// Enhanced project recommendation interface
export interface EnhancedProjectRecommendation {
  name: string;
  description: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  timeframe: string; // e.g., "2-4 weeks", "1-2 months", etc.
  skillsRequired: string[];
  skillsDeveloped: string[];
  steps: string[];
  resources: {
    name: string;
    url: string;
  }[];
  category: string[];
  matchScore: number;
}

// Enhanced competition recommendation interface
export interface EnhancedCompetitionRecommendation {
  name: string;
  url?: string;
  description: string;
  eligibility: string[];
  deadline: string;
  category: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  matchScore: number;
  competitiveness: 'low' | 'medium' | 'high';
  benefits: string[];
  fee?: string;
}

/**
 * Create a set of tiered project recommendations based on student profile
 */
export async function createTieredProjectRecommendations(
  profile: StudentProfile,
  skillAssessment: ReturnType<typeof assessUserSkillLevel>
): Promise<EnhancedProjectRecommendation[]> {
  // Extract key information
  const major = profile.intendedMajor.toLowerCase();
  const grade = profile.gradeLevel.toLowerCase();
  const activities = profile.currentActivities.toLowerCase();
  const interests = profile.interestedActivities.toLowerCase();
  const difficulty = skillAssessment.recommendedDifficulty;
  
  // Define project templates by category and difficulty
  const projectTemplates: Record<string, Record<string, Partial<EnhancedProjectRecommendation>>> = {
    'business': {
      'beginner': {
        name: "Small Business Plan",
        description: "Develop a comprehensive business plan for a small venture addressing a local need.",
        complexity: "beginner",
        timeframe: "2-4 weeks",
        category: ["Business", "Entrepreneurship"]
      },
      'intermediate': {
        name: "Market Analysis Project",
        description: "Conduct a detailed market analysis for a product or service, including competitor research and customer surveys.",
        complexity: "intermediate",
        timeframe: "1-2 months",
        category: ["Business", "Research", "Analysis"]
      },
      'advanced': {
        name: "Startup Launch",
        description: "Create and launch a real business venture with a minimal viable product and marketing strategy.",
        complexity: "advanced",
        timeframe: "3-6 months",
        category: ["Business", "Entrepreneurship", "Leadership"]
      },
      'micro-enterprise': {
        name: "Micro-Enterprise Initiative",
        description: "Start a small-scale business to demonstrate entrepreneurial skills and generate modest revenue.",
        complexity: "beginner",
        timeframe: "1-3 months",
        category: ["Business", "Entrepreneurship", "Social Impact"]
      },
      'business-competition': {
        name: "Business Competition Entry",
        description: "Prepare and submit a business plan or pitch for a competitive event like DECA or a pitch competition.",
        complexity: "intermediate",
        timeframe: "1-2 months",
        category: ["Business", "Competition", "Presentation"]
      }
    },
    'tech': {
      'beginner': {
        name: "Personal Website Development",
        description: "Create a personal website showcasing your portfolio and interests using HTML, CSS, and basic JavaScript.",
        complexity: "beginner",
        timeframe: "2-4 weeks",
        category: ["Technology", "Web Development"]
      },
      'intermediate': {
        name: "Mobile App Development",
        description: "Design and build a mobile application that solves a specific problem or meets a particular need.",
        complexity: "intermediate",
        timeframe: "1-3 months",
        category: ["Technology", "App Development", "Problem Solving"]
      },
      'advanced': {
        name: "AI/ML Research Project",
        description: "Develop a machine learning model to address a meaningful problem and analyze the results.",
        complexity: "advanced",
        timeframe: "2-4 months",
        category: ["Technology", "AI/ML", "Research"]
      },
      'game-development': {
        name: "Educational Game Development",
        description: "Create an educational game that teaches concepts related to your academic interests.",
        complexity: "intermediate",
        timeframe: "1-2 months",
        category: ["Technology", "Game Development", "Education"]
      },
      'automation': {
        name: "Automation Tool Development",
        description: "Create scripts or tools to automate repetitive tasks related to your interests or studies.",
        complexity: "intermediate",
        timeframe: "3-6 weeks",
        category: ["Technology", "Productivity", "Problem Solving"]
      }
    },
    'science': {
      'beginner': {
        name: "Scientific Literature Review",
        description: "Conduct a comprehensive review of scientific literature on a specific topic of interest.",
        complexity: "beginner",
        timeframe: "2-4 weeks",
        category: ["Science", "Research", "Academic"]
      },
      'intermediate': {
        name: "Data Analysis Project",
        description: "Collect and analyze data on a scientific question, producing visualizations and conclusions.",
        complexity: "intermediate",
        timeframe: "1-2 months",
        category: ["Science", "Data Analysis", "Research"]
      },
      'advanced': {
        name: "Independent Research Study",
        description: "Design and conduct a rigorous research study with potential for publication or presentation.",
        complexity: "advanced",
        timeframe: "3-6 months",
        category: ["Science", "Research", "Academic"]
      },
      'environmental': {
        name: "Environmental Monitoring Project",
        description: "Design and implement a system to monitor and analyze an environmental factor in your community.",
        complexity: "intermediate",
        timeframe: "1-3 months",
        category: ["Science", "Environmental", "Community"]
      },
      'health': {
        name: "Public Health Investigation",
        description: "Research a public health issue in your community and propose evidence-based solutions.",
        complexity: "intermediate",
        timeframe: "1-3 months",
        category: ["Science", "Health", "Community"]
      }
    },
    'arts': {
      'beginner': {
        name: "Digital Art Portfolio",
        description: "Create a cohesive collection of digital artworks showcasing your skills and creative vision.",
        complexity: "beginner",
        timeframe: "1-2 months",
        category: ["Arts", "Creative", "Digital"]
      },
      'intermediate': {
        name: "Short Film Production",
        description: "Write, direct, and produce a short film exploring themes related to your interests.",
        complexity: "intermediate",
        timeframe: "1-3 months",
        category: ["Arts", "Film", "Storytelling"]
      },
      'advanced': {
        name: "Community Art Installation",
        description: "Design and create a public art installation that engages with community issues or themes.",
        complexity: "advanced",
        timeframe: "2-4 months",
        category: ["Arts", "Community", "Public Engagement"]
      },
      'performing': {
        name: "Original Performance Piece",
        description: "Create and perform an original musical, theatrical, or dance piece expressing your creative vision.",
        complexity: "intermediate",
        timeframe: "1-3 months",
        category: ["Arts", "Performance", "Creative"]
      },
      'literary': {
        name: "Literary Journal or Publication",
        description: "Create and publish a literary journal featuring original works by you and your peers.",
        complexity: "intermediate",
        timeframe: "2-3 months",
        category: ["Arts", "Writing", "Publishing"]
      }
    },
    'social': {
      'beginner': {
        name: "Community Service Initiative",
        description: "Develop and implement a service project addressing a specific need in your community.",
        complexity: "beginner",
        timeframe: "2-4 weeks",
        category: ["Social Impact", "Community", "Service"]
      },
      'intermediate': {
        name: "Advocacy Campaign",
        description: "Create and run an advocacy campaign to raise awareness about an important cause.",
        complexity: "intermediate",
        timeframe: "1-3 months",
        category: ["Social Impact", "Advocacy", "Communication"]
      },
      'advanced': {
        name: "Nonprofit Development",
        description: "Establish a nonprofit organization or initiative with a sustainable operational model.",
        complexity: "advanced",
        timeframe: "3-6 months",
        category: ["Social Impact", "Nonprofit", "Leadership"]
      },
      'educational': {
        name: "Educational Workshop Series",
        description: "Design and lead a series of workshops teaching valuable skills to others in your community.",
        complexity: "intermediate",
        timeframe: "1-3 months",
        category: ["Education", "Leadership", "Community"]
      },
      'fundraising': {
        name: "School Fundraising Campaign",
        description: "Organize and execute a fundraising campaign for a specific school or community need.",
        complexity: "beginner",
        timeframe: "2-4 weeks",
        category: ["Fundraising", "Leadership", "Community"]
      }
    },
    'general': {
      'beginner': {
        name: "Personal Blog Development",
        description: "Create and maintain a blog focused on your academic interests and experiences.",
        complexity: "beginner",
        timeframe: "Ongoing",
        category: ["Communication", "Digital", "Personal Development"]
      },
      'intermediate': {
        name: "Mentorship Program",
        description: "Develop a structured mentorship program connecting experienced students with newcomers.",
        complexity: "intermediate",
        timeframe: "Semester-long",
        category: ["Leadership", "Education", "Community"]
      },
      'advanced': {
        name: "Research Publication",
        description: "Complete a research project worthy of submission to a student journal or conference.",
        complexity: "advanced",
        timeframe: "3-6 months",
        category: ["Research", "Academic", "Communication"]
      },
      'leadership': {
        name: "Student Organization Leadership",
        description: "Take on a significant leadership role in an existing student organization or club.",
        complexity: "intermediate",
        timeframe: "School year",
        category: ["Leadership", "Organization", "Community"]
      },
      'event': {
        name: "Academic or Special Interest Conference",
        description: "Plan and host a conference or symposium focused on topics related to your interests.",
        complexity: "advanced",
        timeframe: "2-4 months",
        category: ["Event Planning", "Leadership", "Communication"]
      }
    }
  };
  
  // Select category based on major
  let primaryCategory = 'general';
  let secondaryCategory = 'social';
  
  if (major.includes('business') || major.includes('econ') || major.includes('financ') || major.includes('account')) {
    primaryCategory = 'business';
    secondaryCategory = 'social';
  } else if (major.includes('comput') || major.includes('tech') || major.includes('engineer') || 
             major.includes('program') || major.includes('develop') || major.includes('info')) {
    primaryCategory = 'tech';
    secondaryCategory = 'science';
  } else if (major.includes('science') || major.includes('bio') || major.includes('chem') || 
             major.includes('physics') || major.includes('math') || major.includes('ecology')) {
    primaryCategory = 'science';
    secondaryCategory = 'tech';
  } else if (major.includes('art') || major.includes('music') || major.includes('drama') || 
             major.includes('theater') || major.includes('film') || major.includes('dance') || 
             major.includes('creative') || major.includes('design')) {
    primaryCategory = 'arts';
    secondaryCategory = 'social';
  }
  
  // Adjust based on activities and interests
  if ((activities + interests).includes('volunteer') || 
      (activities + interests).includes('community') || 
      (activities + interests).includes('service') || 
      (activities + interests).includes('impact')) {
    secondaryCategory = 'social';
  }
  
  // Select projects based on profile
  const selectedProjects: EnhancedProjectRecommendation[] = [];
  
  // Add primary category projects of appropriate difficulty
  const primaryTemplates = projectTemplates[primaryCategory];
  
  // Add at least one project at the recommended difficulty level
  const primaryDifficultyProject = primaryTemplates[difficulty];
  if (primaryDifficultyProject) {
    selectedProjects.push(completeProjectTemplate(
      primaryDifficultyProject, 
      profile, 
      skillAssessment
    ));
  }
  
  // Add more varied primary category projects
  const primaryKeys = Object.keys(primaryTemplates).filter(key => 
    key !== difficulty && !['beginner', 'intermediate', 'advanced'].includes(key)
  );
  
  for (const key of shuffleArray(primaryKeys).slice(0, 2)) {
    selectedProjects.push(completeProjectTemplate(
      primaryTemplates[key], 
      profile, 
      skillAssessment
    ));
  }
  
  // Add secondary category projects
  const secondaryTemplates = projectTemplates[secondaryCategory];
  const secondaryKeys = Object.keys(secondaryTemplates).filter(key => 
    !['beginner', 'intermediate', 'advanced'].includes(key)
  );
  
  for (const key of shuffleArray(secondaryKeys).slice(0, 2)) {
    selectedProjects.push(completeProjectTemplate(
      secondaryTemplates[key], 
      profile, 
      skillAssessment
    ));
  }
  
  // Add a general project
  const generalTemplates = projectTemplates['general'];
  const generalKeys = Object.keys(generalTemplates).filter(key => 
    key !== 'beginner' && key !== 'intermediate' && key !== 'advanced'
  );
  
  if (generalKeys.length > 0) {
    const randomKey = generalKeys[Math.floor(Math.random() * generalKeys.length)];
    selectedProjects.push(completeProjectTemplate(
      generalTemplates[randomKey], 
      profile, 
      skillAssessment
    ));
  }
  
  // Make sure we have at least 5 projects
  while (selectedProjects.length < 5) {
    // Randomly select from any category
    const allCategories = Object.keys(projectTemplates);
    const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
    const categoryTemplates = projectTemplates[randomCategory];
    const templateKeys = Object.keys(categoryTemplates);
    const randomKey = templateKeys[Math.floor(Math.random() * templateKeys.length)];
    
    // Check if we already have this project
    const projectTemplate = categoryTemplates[randomKey];
    if (!selectedProjects.some(p => p.name === projectTemplate.name)) {
      selectedProjects.push(completeProjectTemplate(
        projectTemplate, 
        profile, 
        skillAssessment
      ));
    }
  }
  
  return selectedProjects;
}

/**
 * Helper function to complete a project template with personalized details
 */
function completeProjectTemplate(
  template: Partial<EnhancedProjectRecommendation>,
  profile: StudentProfile,
  skillAssessment: ReturnType<typeof assessUserSkillLevel>
): EnhancedProjectRecommendation {
  const major = profile.intendedMajor || "your field of interest";
  
  // Generate a match score between 70-95
  const matchScore = Math.floor(Math.random() * 26) + 70;
  
  // Select skills to develop based on skill assessment
  const weakestSkills = Object.entries(skillAssessment.skillLevels)
    .filter(([_, level]) => level === 'beginner')
    .map(([skill, _]) => skill);
  
  const allSkills = Object.keys(skillAssessment.skillLevels);
  
  // Select skills to develop (prioritizing weaker skills)
  const skillsToDeveop = weakestSkills.length > 0 
    ? [...shuffleArray(weakestSkills).slice(0, 1), ...shuffleArray(allSkills).slice(0, 1)]
    : shuffleArray(allSkills).slice(0, 2);
  
  // Format skill names
  const formattedSkills = skillsToDeveop.map(skill => {
    switch (skill) {
      case 'research': return 'Research methodology';
      case 'technical': return 'Technical skills';
      case 'leadership': return 'Leadership and management';
      case 'communication': return 'Communication and presentation';
      case 'analytical': return 'Analytical thinking';
      default: return skill.charAt(0).toUpperCase() + skill.slice(1);
    }
  });
  
  // Create project implementation steps
  const steps = [
    `Research ${template.name?.toLowerCase().includes('research') ? 'your topic' : 'successful examples'} and create a detailed plan`,
    `Develop the necessary ${template.category?.includes('Technology') ? 'technical skills' : 'knowledge and resources'} for implementation`,
    `Create a ${template.category?.includes('Business') ? 'business plan or proposal' : 'project outline'} with clear objectives`,
    `Execute the ${template.category?.includes('Research') ? 'research methodology' : 'implementation plan'} in stages`,
    `Document your process and ${template.category?.includes('Creative') ? 'creative decisions' : 'results'} thoroughly`,
    `Present your ${template.category?.includes('Social Impact') ? 'impact and outcomes' : 'work and findings'} to relevant audiences`
  ];
  
  // Create resources based on project type
  const resources = [];
  if (template.category?.includes('Technology')) {
    resources.push(
      { name: 'Online Coding Courses', url: 'https://www.codecademy.com/' },
      { name: 'GitHub Project Management', url: 'https://github.com/' }
    );
  } else if (template.category?.includes('Business')) {
    resources.push(
      { name: 'Business Plan Templates', url: 'https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan' },
      { name: 'Market Research Guidelines', url: 'https://www.entrepreneur.com/starting-a-business/market-research/207388' }
    );
  } else if (template.category?.includes('Science')) {
    resources.push(
      { name: 'Research Methodology Guide', url: 'https://www.sciencebuddies.org/science-fair-projects/science-fair' },
      { name: 'Data Analysis Tutorials', url: 'https://www.khanacademy.org/math/statistics-probability' }
    );
  } else if (template.category?.includes('Arts')) {
    resources.push(
      { name: 'Digital Portfolio Platforms', url: 'https://www.behance.net/' },
      { name: 'Creative Project Management', url: 'https://trello.com/' }
    );
  } else {
    resources.push(
      { name: 'Project Planning Resources', url: 'https://asana.com/' },
      { name: 'Presentation Skills Guide', url: 'https://www.toastmasters.org/resources' }
    );
  }
  
  // Ensure required fields have values
  return {
    name: template.name || 'Custom Project',
    description: template.description || `A project designed to develop key skills for ${major}.`,
    complexity: template.complexity || 'beginner',
    timeframe: template.timeframe || '2-4 weeks',
    skillsRequired: template.skillsRequired || [formattedSkills[0]],
    skillsDeveloped: formattedSkills,
    steps: steps,
    resources: resources,
    category: template.category || ['Personal Development'],
    matchScore
  };
}

/**
 * Enhance competition recommendations with metadata
 */
export function enhanceCompetitionRecommendations(
  competitions: string[],
  profile: StudentProfile
): EnhancedCompetitionRecommendation[] {
  // Create enhanced competition data
  return competitions.map((competition, idx) => {
    // Extract name and URL if in markdown format [name](url)
    const linkMatch = competition.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const name = linkMatch ? linkMatch[1] : competition.split(' - ')[0];
    const url = linkMatch ? linkMatch[2] : (
      competition.includes('http') ? competition.match(/https?:\/\/[^\s)]+/)?.[0] : ''
    );
    
    // Extract description
    let description = competition;
    if (linkMatch) {
      description = competition.replace(/\[([^\]]+)\]\(([^)]+)\)/, '$1');
    }
    if (description.includes(' - ')) {
      description = description.split(' - ').slice(1).join(' - ');
    }
    
    // Determine appropriate difficulty based on competition name and index
    let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
    let competitiveness: 'low' | 'medium' | 'high' = 'medium';
    
    const lowerName = name.toLowerCase();
    if (lowerName.includes('international') || lowerName.includes('olympiad') || 
        lowerName.includes('isef') || lowerName.includes('worldwide')) {
      difficulty = 'advanced';
      competitiveness = 'high';
    } else if (lowerName.includes('national') || lowerName.includes('challenge') ||
               lowerName.includes('competition')) {
      difficulty = 'intermediate';
      competitiveness = 'medium';
    } else if (lowerName.includes('local') || lowerName.includes('school') ||
               lowerName.includes('regional') || lowerName.includes('community')) {
      difficulty = 'beginner';
      competitiveness = 'low';
    }
    
    // Generate match score
    const matchScore = 75 + Math.floor(Math.random() * 20);
    
    // Determine category based on competition name
    const categories: string[] = ['Competition'];
    if (lowerName.includes('science') || lowerName.includes('research') ||
        lowerName.includes('math') || lowerName.includes('bio') || 
        lowerName.includes('chem') || lowerName.includes('physics')) {
      categories.push('Science');
    }
    if (lowerName.includes('business') || lowerName.includes('entrepreneur') ||
        lowerName.includes('econ') || lowerName.includes('finance') ||
        lowerName.includes('deca')) {
      categories.push('Business');
    }
    if (lowerName.includes('art') || lowerName.includes('design') ||
        lowerName.includes('music') || lowerName.includes('film') ||
        lowerName.includes('theater') || lowerName.includes('creative')) {
      categories.push('Arts');
    }
    if (lowerName.includes('tech') || lowerName.includes('hack') ||
        lowerName.includes('code') || lowerName.includes('programming') ||
        lowerName.includes('app') || lowerName.includes('robot')) {
      categories.push('Technology');
    }
    if (lowerName.includes('essay') || lowerName.includes('writing') ||
        lowerName.includes('literature') || lowerName.includes('journal')) {
      categories.push('Writing');
    }
    if (lowerName.includes('social') || lowerName.includes('community') ||
        lowerName.includes('volunteer') || lowerName.includes('impact')) {
      categories.push('Social Impact');
    }
    
    // If no specific category was identified, add a generic one
    if (categories.length === 1) {
      categories.push('Academic');
    }
    
    // Benefits of participation
    const benefits = [
      'College application enhancement',
      'Recognition in your field',
      'Skill development'
    ];
    
    if (competitiveness === 'high') {
      benefits.push('Prestige');
      benefits.push('Networking with field leaders');
      if (Math.random() > 0.5) {
        benefits.push('Monetary prizes');
      }
    } else if (competitiveness === 'medium') {
      benefits.push('Valuable experience');
      if (Math.random() > 0.5) {
        benefits.push('Potential scholarship opportunities');
      }
    } else {
      benefits.push('Building your resume');
      benefits.push('Personal growth');
    }
    
    // Determine eligibility based on student's grade
    const eligibility = ['High school students'];
    const grade = profile.gradeLevel.toLowerCase();
    
    if (grade.includes('9') || grade.includes('fresh')) {
      if (difficulty === 'advanced') {
        eligibility.push('Typically more suitable for upperclassmen, but ambitious freshmen can participate');
      } else {
        eligibility.push('Open to freshmen');
      }
    } else if (grade.includes('10') || grade.includes('soph')) {
      if (difficulty === 'advanced') {
        eligibility.push('Challenging but accessible for motivated sophomores');
      } else {
        eligibility.push('Well-suited for sophomore participants');
      }
    } else if (grade.includes('11') || grade.includes('jun')) {
      eligibility.push('Ideal for juniors building their college applications');
    } else if (grade.includes('12') || grade.includes('sen')) {
      eligibility.push('Great opportunity for seniors to showcase their skills');
      if (difficulty === 'advanced') {
        eligibility.push('May have application deadlines aligned with college applications');
      }
    }
    
    return {
      name,
      url,
      description,
      eligibility,
      deadline: 'Check website for current deadlines',
      category: categories,
      difficulty,
      matchScore,
      competitiveness,
      benefits
    };
  });
}

/**
 * Generate a month-by-month timeline based on student profile
 */
export function generateMonthlyTimeline(profile: StudentProfile): Record<string, string[]> {
  // Extract key information
  const grade = profile.gradeLevel.toLowerCase();
  const major = profile.intendedMajor.toLowerCase();
  
  // Determine grade level
  let gradeLevel = 0;
  if (grade.includes('9') || grade.includes('fresh')) {
    gradeLevel = 9;
  } else if (grade.includes('10') || grade.includes('soph')) {
    gradeLevel = 10;
  } else if (grade.includes('11') || grade.includes('jun')) {
    gradeLevel = 11;
  } else if (grade.includes('12') || grade.includes('sen')) {
    gradeLevel = 12;
  }
  
  // Create monthly timeline with appropriate activities
  const timeline: Record<string, string[]> = {};
  const months = [
    'September', 'October', 'November', 'December', 
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August'
  ];
  
  // Generate advice for each month based on grade level
  months.forEach(month => {
    timeline[month] = [];
    
    // Common activities for all students
    if (month === 'September') {
      timeline[month].push('Set specific academic goals for the semester');
      timeline[month].push('Identify key extracurricular activities to focus on');
    } else if (month === 'December' || month === 'May') {
      timeline[month].push('Prepare for semester final exams');
      timeline[month].push('Reflect on accomplishments and areas for improvement');
    } else if (month === 'June') {
      timeline[month].push('Begin summer activities with a clear plan');
    } else if (month === 'August') {
      timeline[month].push('Prepare for the upcoming academic year');
    }
    
    // Grade-specific activities
    if (gradeLevel === 9) { // Freshman
      switch (month) {
        case 'September':
          timeline[month].push('Join 2-3 clubs aligned with your interests');
          timeline[month].push('Establish good study habits from the beginning');
          break;
        case 'October':
          timeline[month].push('Start documenting your activities and achievements');
          timeline[month].push('Meet with your guidance counselor to discuss four-year plan');
          break;
        case 'November':
          timeline[month].push('Begin exploring summer programs for next year');
          break;
        case 'January':
          timeline[month].push('Consider taking honors courses for next year');
          timeline[month].push('Explore community service opportunities');
          break;
        case 'February':
          timeline[month].push('Research academic competitions relevant to your interests');
          break;
        case 'March':
          timeline[month].push('Plan sophomore year course selection');
          timeline[month].push('Identify leadership opportunities for next year');
          break;
        case 'April':
          timeline[month].push('Apply for summer programs or plan summer activities');
          break;
        case 'June':
          timeline[month].push('Begin summer reading to prepare for next year');
          timeline[month].push('Work on building specific skills related to your interests');
          break;
        case 'July':
          timeline[month].push('Volunteer or work part-time to gain experience');
          break;
      }
    } else if (gradeLevel === 10) { // Sophomore
      switch (month) {
        case 'September':
          timeline[month].push('Take on more active roles in your clubs or activities');
          timeline[month].push('Begin researching potential colleges and requirements');
          break;
        case 'October':
          timeline[month].push('Take the PSAT for practice and prepare for standardized tests');
          timeline[month].push('Start a more focused extracurricular activity related to your major');
          break;
        case 'November':
          timeline[month].push('Research AP/honors courses for junior year');
          timeline[month].push('Consider job shadowing professionals in your field of interest');
          break;
        case 'December':
          timeline[month].push('Begin developing a resume with your activities and achievements');
          break;
        case 'January':
          timeline[month].push('Plan challenging courses for junior year');
          timeline[month].push('Research summer programs, internships, or research opportunities');
          break;
        case 'February':
          timeline[month].push('Attend college fairs or virtual information sessions');
          break;
        case 'March':
          timeline[month].push('Consider taking SAT Subject Tests in courses you excel in');
          timeline[month].push('Seek leadership positions in extracurricular activities');
          break;
        case 'April':
          timeline[month].push('Register for SAT/ACT for next year');
          timeline[month].push('Apply for summer programs or internships');
          break;
        case 'May':
          timeline[month].push('Create a study plan for standardized tests');
          break;
        case 'June':
          timeline[month].push('Begin SAT/ACT preparation');
          timeline[month].push('Start a summer project related to your interests');
          break;
        case 'July':
          timeline[month].push('Visit college campuses if possible');
          break;
        case 'August':
          timeline[month].push('Develop a junior year action plan with specific goals');
          break;
      }
    } else if (gradeLevel === 11) { // Junior
      switch (month) {
        case 'September':
          timeline[month].push('Focus on achieving your best GPA this critical year');
          timeline[month].push('Take leadership positions in extracurricular activities');
          break;
        case 'October':
          timeline[month].push('Take the PSAT/NMSQT for potential scholarship qualification');
          timeline[month].push('Begin researching specific colleges that match your profile');
          break;
        case 'November':
          timeline[month].push('Meet with your counselor to discuss college planning');
          timeline[month].push('Create a standardized testing schedule for the year');
          break;
        case 'December':
          timeline[month].push('Prepare for standardized tests (SAT/ACT)');
          timeline[month].push('Begin researching scholarship opportunities');
          break;
        case 'January':
          timeline[month].push('Register for spring SAT/ACT dates');
          timeline[month].push('Research potential summer programs, internships, or research opportunities');
          break;
        case 'February':
          timeline[month].push('Develop a preliminary college list with safety, match, and reach schools');
          timeline[month].push('Consider who might write your recommendation letters');
          break;
        case 'March':
          timeline[month].push('Take first SAT/ACT');
          timeline[month].push('Visit college campuses during spring break');
          break;
        case 'April':
          timeline[month].push('Prepare for AP/IB exams if applicable');
          timeline[month].push('Finalize summer plans for meaningful activities');
          break;
        case 'May':
          timeline[month].push('Take AP/IB exams and SAT Subject Tests if needed');
          timeline[month].push('Ask teachers for recommendation letters before summer');
          break;
        case 'June':
          timeline[month].push('Begin drafting college essays');
          timeline[month].push('Start meaningful summer activities (internship, research, etc.)');
          break;
        case 'July':
          timeline[month].push('Visit additional colleges if possible');
          timeline[month].push('Work on college application essays');
          break;
        case 'August':
          timeline[month].push('Finalize college list and begin organizing application materials');
          timeline[month].push('Complete first drafts of college essays');
          break;
      }
    } else if (gradeLevel === 12) { // Senior
      switch (month) {
        case 'September':
          timeline[month].push('Finalize college list with safety, match, and reach schools');
          timeline[month].push('Complete your Common Application profile');
          break;
        case 'October':
          timeline[month].push('Submit early action/decision applications');
          timeline[month].push('Complete FAFSA and CSS Profile for financial aid');
          break;
        case 'November':
          timeline[month].push('Submit remaining early applications');
          timeline[month].push('Continue working on regular decision applications');
          break;
        case 'December':
          timeline[month].push('Receive early application results');
          timeline[month].push('Complete and submit regular decision applications');
          break;
        case 'January':
          timeline[month].push('Submit remaining applications (most regular deadlines)');
          timeline[month].push('Request mid-year reports sent to colleges');
          break;
        case 'February':
          timeline[month].push('Apply for scholarships');
          timeline[month].push('Maintain focus on grades for strong finish');
          break;
        case 'March':
          timeline[month].push('Receive admissions decisions from regular decision schools');
          timeline[month].push('Compare financial aid packages');
          break;
        case 'April':
          timeline[month].push('Make your final college decision (most deposits due May 1)');
          timeline[month].push('Notify schools you will not attend');
          break;
        case 'May':
          timeline[month].push('Complete AP/IB exams');
          timeline[month].push('Send final transcript to your chosen college');
          break;
        case 'June':
          timeline[month].push('Prepare for college orientation');
          timeline[month].push('Thank teachers and counselors who wrote recommendations');
          break;
        case 'July':
          timeline[month].push('Complete required forms and orientation tasks for college');
          timeline[month].push('Prepare for college transition (housing, courses, etc.)');
          break;
        case 'August':
          timeline[month].push('Finalize college preparations and packing');
          timeline[month].push('Attend orientation and prepare for the transition to college');
          break;
      }
    }
    
    // Add major-specific activities
    if (major.includes('business') || major.includes('econ') || major.includes('financ') || major.includes('account')) {
      // Business-specific recommendations
      if (month === 'October') {
        timeline[month].push('Research business competitions like DECA or Future Business Leaders of America');
      } else if (month === 'November') {
        timeline[month].push('Develop a business-related project or startup concept');
      } else if (month === 'January') {
        timeline[month].push('Look for business or finance-related summer programs or internships');
      } else if (month === 'March') {
        timeline[month].push('Prepare for business competition participation if applicable');
      } else if (month === 'June') {
        timeline[month].push('Read books on business, economics, or entrepreneurship');
      }
    } else if (major.includes('comput') || major.includes('tech') || major.includes('engineer')) {
      // Tech-specific recommendations
      if (month === 'October') {
        timeline[month].push('Join coding competitions or hackathons');
      } else if (month === 'November') {
        timeline[month].push('Start or continue a personal coding project');
      } else if (month === 'January') {
        timeline[month].push('Look for tech internships or coding bootcamps for summer');
      } else if (month === 'March') {
        timeline[month].push('Prepare a technical portfolio of your projects');
      } else if (month === 'June') {
        timeline[month].push('Learn a new programming language or technical skill');
      }
    } else if (major.includes('science') || major.includes('bio') || major.includes('chem')) {
      // Science-specific recommendations
      if (month === 'October') {
        timeline[month].push('Plan a science fair project or research proposal');
      } else if (month === 'November') {
        timeline[month].push('Reach out to potential research mentors or programs');
      } else if (month === 'January') {
        timeline[month].push('Apply for summer research programs or science camps');
      } else if (month === 'March') {
        timeline[month].push('Present research at science fairs or competitions if applicable');
      } else if (month === 'June') {
        timeline[month].push('Conduct summer research or participate in a science program');
      }
    }
  });
  
  return timeline;
}

/**
 * Helper function to shuffle an array
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}