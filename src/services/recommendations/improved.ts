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
  enhanceCompetitionRecommendations,
  generateMonthlyTimeline
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
    
    // 3. Generate high-quality project recommendations
    const projectRecommendations = await generateHighQualityProjects(profile, skillAssessment);
    
    // 4. Get competition recommendations using web search
    const competitions = await getCompetitionRecommendations(profile, userHistory.viewedCompetitions);
    
    // 5. Enhance competition data with metadata
    const enhancedCompetitions = enhanceCompetitionRecommendations(competitions, profile);
    
    // 6. Generate skill recommendations
    const skillRecommendations = generateSkillRecommendations(profile, skillAssessment);
    
    // 7. Generate monthly timeline
    const monthlyTimeline = generateMonthlyTimeline(profile);
    
    // 8. Flatten monthly timeline into a list of strings for compatibility
    const timeline = Object.entries(monthlyTimeline)
      .sort(([monthA], [monthB]) => {
        const months = [
          'September', 'October', 'November', 'December', 
          'January', 'February', 'March', 'April', 
          'May', 'June', 'July', 'August'
        ];
        return months.indexOf(monthA) - months.indexOf(monthB);
      })
      .map(([month, activities]) => {
        if (activities.length === 0) return '';
        return `${month}: ${activities.join('. ')}`;
      })
      .filter(item => item !== '');
    
    // 9. Generate comprehensive profile analysis
    const profileAnalysis = await generateEnhancedProfileAnalysis(profile, skillAssessment);
    
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
        'Create a digital portfolio of your academic and extracurricular work',
        'Start a research project related to your intended major',
        'Design and implement a community service initiative',
        'Develop a personal brand and online presence'
      ],
      suggestedCompetitions: [
        'Research competitions specific to your field of interest',
        'Look for local scholarship opportunities aligned with your goals',
        'Find subject-specific olympiads or academic contests',
        'Search for innovation or entrepreneurship challenges',
        'Identify essay or creative contests related to your major'
      ],
      suggestedSkills: [
        'Critical thinking and problem-solving',
        'Effective written and verbal communication',
        'Time management and organization',
        'Leadership and team collaboration',
        'Research and analytical abilities'
      ],
      timeline: [
        'September: Set specific academic and extracurricular goals for this semester',
        'October: Research colleges and scholarship opportunities',
        'November: Prepare for standardized tests if applicable',
        'December: Reflect on semester accomplishments and plan for improvement',
        'January: Update your resume and activity list',
        'February: Develop relationships with potential recommenders',
        'March: Plan meaningful summer activities',
        'April: Focus on academic excellence and leadership development',
        'May: Prepare for final exams and standardized tests',
        'June: Begin summer activities with specific goals',
        'July: Visit colleges and refine your school list',
        'August: Prepare for the upcoming academic year'
      ],
      profileAnalysis: `Focus on developing experiences that showcase your interest in ${profile.intendedMajor || "your intended field"}. Seek opportunities that allow you to demonstrate both depth of commitment and breadth of skills.`,
      recommendedActivities: []
    };
  }
}

/**
 * Generate high-quality project recommendations based on the student's profile
 */
async function generateHighQualityProjects(profile: StudentProfile, skillAssessment: any) {
  try {
    // First try to get AI-generated high-impact projects
    const aiProjects = await generateAIProjects(profile);
    if (aiProjects && aiProjects.length >= 5) {
      // Transform AI projects into the expected format
      return aiProjects.map(project => ({
        name: project.name,
        description: project.description,
        complexity: project.complexity || 'intermediate',
        timeframe: project.timeframe || '2-3 months',
        skillsRequired: project.skillsRequired || [],
        skillsDeveloped: project.skillsDeveloped || [],
        steps: project.steps || [],
        resources: project.resources || [],
        category: project.category || ['Academic'],
        matchScore: project.matchScore || Math.floor(Math.random() * 15) + 80
      }));
    }
    
    // Fallback to the default tiered recommendations
    return await createTieredProjectRecommendations(profile, skillAssessment);
  } catch (error) {
    console.error('Error generating high-quality projects:', error);
    return await createTieredProjectRecommendations(profile, skillAssessment);
  }
}

/**
 * Generate AI-powered high-impact project recommendations
 */
async function generateAIProjects(profile: StudentProfile) {
  try {
    // Create a prompt for generating high-quality projects
    const prompt = `
      Create a portfolio of 5 unique, high-impact projects for a high school student with the following profile:
      
      Name: ${profile.name}
      Grade: ${profile.gradeLevel}
      Intended Major: ${profile.intendedMajor || "Undecided"}
      Current Activities: ${profile.currentActivities || "None specified"}
      Interested Activities: ${profile.interestedActivities || "None specified"}
      
      For EACH project, provide the following in JSON format:
      1. name - A specific, impressive project title (not generic)
      2. description - A detailed description of what the project involves
      3. complexity - One of: "beginner", "intermediate", or "advanced"
      4. timeframe - Expected completion time (e.g., "2-3 months")
      5. skillsDeveloped - Array of at least 3 specific skills this project develops
      6. category - Array of categories (e.g., "Research", "Technology", "Community Service")
      7. steps - Array of at least 5 specific implementation steps
      8. resources - Array of helpful resources with name and url properties
      
      Requirements:
      - Projects should be diverse and cover different aspects of the student's interests
      - Projects should be specific and detailed (not generic)
      - Projects should demonstrate increasing complexity and sophistication
      - Each project should be ambitious enough for college applications but realistic for a high school student
      - Each project should showcase different skills and strengths
      - Include at least one research project, one community service project, and one creative or technical project
      
      Format your response as a JSON array containing 5 project objects.
    `;
    
    // Call the AI service
    const response = await getModelResponse(prompt, null, null, false);
    
    if (!response.success) {
      throw new Error(response.error || "Failed to generate projects");
    }
    
    // Parse the AI response
    try {
      // Try to find JSON array in the response
      const jsonPattern = /```json\s*(\[[\s\S]*?\])\s*```|(\[[\s\S]*?\])/;
      const jsonMatch = response.content.match(jsonPattern);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[2];
        return JSON.parse(jsonString);
      }
      
      // If no JSON array pattern found, try to parse the entire response
      return JSON.parse(response.content);
    } catch (parseError) {
      console.error("Error parsing AI project recommendations:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Error generating AI projects:", error);
    return null;
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
      I need recommendations for a diverse set of prestigious academic competitions, olympiads, and challenges for a high school student with the following profile:
      
      Grade: ${profile.gradeLevel}
      Intended Major: ${profile.intendedMajor || "Undecided"}
      Current Activities: ${profile.currentActivities || "None specified"}
      Interests: ${profile.interestedActivities || "None specified"}
      
      Please provide a list of 5-8 specific, currently active competitions that:
      1. Include a mix of difficulty levels (beginner, intermediate, advanced)
      2. Represent different categories (STEM, humanities, leadership, etc.)
      3. Have varying levels of competitiveness
      4. Are well-aligned with this student's interests and grade level
      5. Include at least 2-3 competitions that directly relate to ${profile.intendedMajor || "their interests"}
      6. Include at least 1-2 prestigious, nationally/internationally recognized competitions
      7. Include 1-2 competitions that focus on innovation or creative problem-solving
      
      For EACH competition, include:
      1. The complete, accurate name of the competition
      2. A brief but specific explanation of what it involves
      3. A direct website link in markdown format like this: [Competition Name](https://website-url.com)
      
      IMPORTANT: Provide specific, prestigious competitions that would strengthen a college application. Each must be a real, verifiable competition with an active website. Avoid generic suggestions.
      
      Format each recommendation as a separate bullet point with the link included.
    `;

    // Make the API call with web search enabled to get current competition information
    const response = await getModelResponse(prompt, null, null, true);
    
    if (response.success && response.content) {
      // Parse the response to extract competitions with links
      const content = response.content;
      
      // Extract each bullet point containing a competition
      const bulletPoints = content
        .split(/\n+/)
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[\s-*]+/, '').trim());
      
      if (bulletPoints.length >= 5) {
        return bulletPoints;
      }
      
      // If we don't have enough bullet points, look for numbered lists
      const numberedPoints = content
        .split(/\n+/)
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
      
      if (numberedPoints.length >= 5) {
        return numberedPoints;
      }
      
      // If we still don't have enough, extract paragraphs containing links
      const paragraphs = content
        .split(/\n\n+/)
        .filter(para => para.includes('http') || para.includes('www') || para.includes('.org') || para.includes('.com'))
        .map(para => para.trim());
      
      if (paragraphs.length >= 5) {
        return paragraphs;
      }
    }
    
    // If we still don't have good results, fall back to major-specific competition templates
    return getMajorSpecificCompetitions(profile.intendedMajor);
  } catch (error) {
    console.error('Error generating competition recommendations:', error);
    // Fallback to major-specific competitions if the API call fails
    return getMajorSpecificCompetitions(profile.intendedMajor);
  }
}

/**
 * Generate enhanced profile analysis that provides deeper insights
 */
async function generateEnhancedProfileAnalysis(
  profile: StudentProfile,
  skillAssessment: any
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
      
      Please provide:
      1. A comprehensive analysis of the student's current profile strengths
      2. Key areas for development based on their intended major
      3. How their current activities align with college application needs
      4. Specific focus areas that would strengthen their profile
      5. Grade-appropriate next steps for their college preparation journey
      
      Make the analysis personalized, constructive, and actionable. Focus on concrete, specific advice rather than generalities. Include 3-5 paragraphs and be encouraging but realistic.
    `;

    // Make the API call for a personalized analysis
    const response = await getModelResponse(prompt, null, null, false);
    
    if (response.success && response.content) {
      return response.content;
    }
    
    // Fallback if API call fails
    throw new Error("Failed to generate profile analysis");
  } catch (error) {
    console.error('Error generating enhanced profile analysis:', error);
    
    // Generate a fallback profile analysis based on the profile data
    const major = profile.intendedMajor || "undecided field";
    const grade = profile.gradeLevel || "current grade";
    
    return `Based on your interest in ${major} and your current activities, you're building a solid foundation for college applications. As a ${grade} student, focus on developing leadership in 1-2 key activities rather than spreading yourself too thin across many commitments.

To strengthen your profile for ${major}, seek opportunities that demonstrate both your academic abilities and personal initiative. This could include research projects, community service related to your field, or specialized competitions that highlight your skills.

Over the next year, prioritize academic excellence in courses related to ${major}, while developing your extracurricular activities to show increasing responsibility and impact. This balanced approach will create a compelling narrative for college admissions officers.`;
  }
}

/**
 * Generate skill recommendations with progression paths
 */
function generateSkillRecommendations(
  profile: StudentProfile, 
  skillAssessment: any
): string[] {
  // Major-specific skills
  const majorSkillsMap = {
    // Computer Science/Tech skills
    "computer science": [
      "Advanced programming in a specialized language (Python, Java, etc.)",
      "Data structures and algorithms proficiency",
      "Full-stack web or mobile application development",
      "Machine learning and AI fundamentals",
      "Version control and collaborative development workflows",
      "System architecture and design principles"
    ],
    "software": [
      "Software development lifecycle management",
      "Advanced programming in multiple languages",
      "Testing and quality assurance methodologies",
      "Cloud computing and deployment architecture",
      "Database design and optimization",
      "UI/UX principles and implementation"
    ],
    "engineering": [
      "Engineering design process and documentation",
      "CAD/CAM software proficiency",
      "Applied mathematics for engineering problems",
      "Prototyping and iterative development",
      "Technical writing and communication",
      "Project management for engineering projects"
    ],
    
    // Business skills
    "business": [
      "Financial statement analysis and interpretation",
      "Market research and competitive analysis",
      "Business plan development and pitch creation",
      "Strategic planning and business model design",
      "Leadership and organizational management",
      "Professional networking and relationship building"
    ],
    "economics": [
      "Economic data analysis and interpretation",
      "Statistical modeling and econometrics",
      "Research methodology for economic questions",
      "Policy analysis and evaluation",
      "Critical analysis of economic theories",
      "Financial modeling and forecasting"
    ],
    "finance": [
      "Financial modeling and valuation techniques",
      "Investment analysis and portfolio management",
      "Risk assessment and management",
      "Financial statement analysis and interpretation",
      "Banking and financial markets knowledge",
      "Quantitative analysis and statistical methods"
    ],
    
    // Sciences
    "biology": [
      "Laboratory techniques and experimental design",
      "Biological data analysis and interpretation",
      "Scientific research methodology",
      "Specialized knowledge in your area of interest (molecular, ecological, etc.)",
      "Technical writing for scientific papers",
      "Critical analysis of scientific literature"
    ],
    "chemistry": [
      "Advanced laboratory techniques and safety protocols",
      "Chemical data analysis and interpretation",
      "Experimental design and hypothesis testing",
      "Specialized knowledge in organic, inorganic, or physical chemistry",
      "Analytical instrument operation and data interpretation",
      "Scientific writing and publication preparation"
    ],
    "physics": [
      "Advanced mathematical modeling",
      "Experimental design and execution",
      "Data analysis and statistical methods",
      "Computational physics and simulation techniques",
      "Technical writing and scientific communication",
      "Critical analysis of physical theories"
    ],
    
    // Arts and Humanities
    "art": [
      "Mastery of specific artistic techniques",
      "Portfolio development and curation",
      "Artist statement writing and articulation",
      "Critical analysis of artistic works",
      "Exhibition planning and presentation",
      "Digital documentation of artwork"
    ],
    "music": [
      "Advanced performance techniques for your instrument/voice",
      "Music theory and composition",
      "Rehearsal and practice methodology",
      "Performance preparation and stage presence",
      "Recording techniques and production basics",
      "Repertoire development and program design"
    ],
    "history": [
      "Primary source research and analysis",
      "Historiographical analysis",
      "Critical writing and argumentation",
      "Research methodology and documentation",
      "Contextual analysis of historical events",
      "Synthesis of multiple historical perspectives"
    ],
    "english": [
      "Advanced analytical writing",
      "Literary criticism and theory application",
      "Research methodology for literary studies",
      "Rhetorical analysis and persuasive writing",
      "Critical reading and textual interpretation",
      "Creative writing techniques and development"
    ],
    
    // General/Other
    "psychology": [
      "Research design and experimental methods",
      "Statistical analysis for psychological data",
      "Ethical considerations in psychological research",
      "Critical analysis of psychological theories",
      "Case study analysis and interpretation",
      "Scientific writing for psychology"
    ],
    "political science": [
      "Political theory analysis and application",
      "Policy analysis and evaluation",
      "Research methodology for political questions",
      "Comparative political systems analysis",
      "Critical writing and argumentation",
      "Data analysis for political research"
    ],
    "communications": [
      "Strategic communication planning",
      "Media production and content creation",
      "Audience analysis and targeted messaging",
      "Public speaking and presentation skills",
      "Visual communication and design principles",
      "Digital media strategy and implementation"
    ]
  };
  
  // Universal skills that benefit all majors
  const universalSkills = [
    "Advanced research methodology",
    "Data analysis and interpretation",
    "Leadership and team management",
    "Project design and implementation",
    "Professional communication (written and verbal)",
    "Critical thinking and problem solving",
    "Time management and organizational skills",
    "Ethical reasoning and decision-making"
  ];
  
  // Parse the intended major to match our categories
  const major = profile.intendedMajor?.toLowerCase() || "";
  
  // Find matching major skills
  let majorSkills: string[] = [];
  
  for (const [key, skills] of Object.entries(majorSkillsMap)) {
    if (major.includes(key)) {
      majorSkills = skills;
      break;
    }
  }
  
  // If no match found, use universal skills
  if (majorSkills.length === 0) {
    majorSkills = universalSkills.slice(0, 6);
  }
  
  // Combine major-specific skills with some universal skills
  const combinedSkills = [
    ...majorSkills.slice(0, 6),
    ...universalSkills.slice(0, 2)
  ];
  
  // Shuffle and return limited set to avoid overwhelming
  return shuffleArray(combinedSkills).slice(0, 7);
}

/**
 * Provide major-specific competition recommendations
 */
function getMajorSpecificCompetitions(major: string): string[] {
  const lowerMajor = (major || "").toLowerCase();
  
  // Computer Science / Engineering competitions
  if (lowerMajor.includes('comput') || lowerMajor.includes('software') || 
      lowerMajor.includes('engineer') || lowerMajor.includes('tech')) {
    return [
      "[International Science and Engineering Fair (ISEF)](https://www.societyforscience.org/isef/) - The world's largest pre-college science competition where students present original research projects.",
      "[Google Science Fair](https://sciencejournalforkids.org/google-science-fair/) - A global online competition that challenges students to solve real-world problems using scientific inquiry.",
      "[International Olympiad in Informatics (IOI)](https://ioinformatics.org/) - Prestigious algorithmic programming competition for high school students.",
      "[FIRST Robotics Competition](https://www.firstinspires.org/robotics/frc) - Team-based robotics program combining science, technology, engineering, and business principles.",
      "[Regeneron Science Talent Search](https://www.societyforscience.org/regeneron-sts/) - The nation's oldest and most prestigious science and math competition for high school seniors.",
      "[Congressional App Challenge](https://www.congressionalappchallenge.us/) - A nationwide app competition for middle and high school students, run by Members of Congress.",
      "[Imagine Cup](https://imaginecup.microsoft.com/) - Microsoft's premier student technology competition focusing on innovative solutions using cloud technologies."
    ];
  }
  
  // Business / Economics competitions
  if (lowerMajor.includes('business') || lowerMajor.includes('econ') || 
      lowerMajor.includes('financ') || lowerMajor.includes('account')) {
    return [
      "[DECA International Career Development Conference](https://www.deca.org/competitions) - Business competition developing future leaders in marketing, finance, hospitality, and management.",
      "[National Economics Challenge](https://www.councilforeconed.org/national-economics-challenge/) - The nation's most prestigious economics competition for high school students.",
      "[Diamond Challenge](https://diamondchallenge.org/) - International entrepreneurship competition with cash prizes for high school students.",
      "[FBLA National Leadership Conference](https://www.fbla-pbl.org/conferences/nlc/) - Competition testing business knowledge, skills, and leadership abilities.",
      "[Wharton Global High School Investment Competition](https://globalyouth.wharton.upenn.edu/investment-competition/) - Online investment simulation challenging high school students worldwide.",
      "[Young Entrepreneurs Academy (YEA!)](https://yeausa.org/) - Program that guides students through launching real businesses and competing for funding.",
      "[Harvard Global Case Competition](https://www.hbsaaa.org/s/1738/cc/index2.aspx?sid=1738&gid=8&pgid=1432) - Case competition focusing on real-world business problems."
    ];
  }
  
  // Science / Biology / Chemistry competitions
  if (lowerMajor.includes('science') || lowerMajor.includes('bio') || 
      lowerMajor.includes('chem') || lowerMajor.includes('physic')) {
    return [
      "[International Science and Engineering Fair (ISEF)](https://www.societyforscience.org/isef/) - The world's largest international pre-college science competition.",
      "[USA Biology Olympiad (USABO)](https://www.usabo-trc.org/) - The premiere biology competition for high school students in the United States.",
      "[Chemistry Olympiad](https://www.acs.org/education/students/highschool/olympiad.html) - Competition testing chemistry knowledge with potential for international competition.",
      "[International Physics Olympiad (IPhO)](https://www.ipho-new.org/) - Prestigious global competition for exceptional high school physics students.",
      "[Regeneron Science Talent Search](https://www.societyforscience.org/regeneron-sts/) - The nation's oldest and most prestigious science and math competition for high school seniors.",
      "[Stockholm Junior Water Prize](https://www.siwi.org/prizes/stockholmjuniorwaterprize/) - International competition focusing on water-related research projects.",
      "[Science Olympiad](https://www.soinc.org/) - Team competition testing knowledge in various science disciplines."
    ];
  }
  
  // Mathematics competitions
  if (lowerMajor.includes('math')) {
    return [
      "[International Mathematical Olympiad (IMO)](https://www.imo-official.org/) - The world championship mathematics competition for high school students.",
      "[American Mathematics Competitions (AMC)](https://www.maa.org/math-competitions) - Series of contests that lead toward the International Mathematical Olympiad.",
      "[Harvard-MIT Mathematics Tournament (HMMT)](https://www.hmmt.org/) - Prestigious math competition held annually at MIT or Harvard.",
      "[Mu Alpha Theta National Convention](https://mualphatheta.org/national-convention) - National mathematics competition with various individual and team events.",
      "[Math Prize for Girls](https://mathprize.atfoundation.org/) - The world's largest math prize for young women.",
      "[International Tournament of Young Mathematicians (ITYM)](https://www.itym.org/) - Team-based research competition in mathematics.",
      "[Putnam Competition](https://www.maa.org/math-competitions/putnam-competition) - Although primarily for college students, exceptional high school students may participate."
    ];
  }
  
  // Arts / Creative competitions
  if (lowerMajor.includes('art') || lowerMajor.includes('music') || 
      lowerMajor.includes('drama') || lowerMajor.includes('film') || lowerMajor.includes('design')) {
    return [
      "[Scholastic Art & Writing Awards](https://www.artandwriting.org/) - The nation's longest-running recognition program for creative teens across various art forms.",
      "[YoungArts](https://youngarts.org/apply/) - Prestigious national competition for talented artists in visual, literary, design and performing arts.",
      "[National High School Musical Theatre Awards (The Jimmy Awards)](https://www.jimmyawards.com/) - Celebrates outstanding student achievement in high school musical theatre performances.",
      "[All-National Honor Ensembles](https://nafme.org/programs/all-national-honor-ensembles/) - Premier national music ensembles for top high school musicians.",
      "[International Youth Photography Competition](https://www.viewbug.com/contests) - International competition for young photographers.",
      "[Tribeca Film Festival Young Filmmaker Competition](https://tribecafilm.com/festival/submissions) - Film festival with special categories for young filmmakers.",
      "[Cooper Hewitt National High School Design Competition](https://www.cooperhewitt.org/education/national-high-school-design-competition/) - National design competition addressing real-world challenges."
    ];
  }
  
  // Humanities competitions
  if (lowerMajor.includes('english') || lowerMajor.includes('histor') || 
      lowerMajor.includes('literature') || lowerMajor.includes('writing')) {
    return [
      "[National History Day](https://www.nhd.org/) - Year-long research-based program for students to explore historical topics.",
      "[John Locke Essay Competition](https://www.johnlocke.com/essay-competition) - Philosophy essay competition for high school students.",
      "[The Concord Review](https://www.tcr.org/) - Journal publishing exemplary high school history essays with annual awards.",
      "[Profile in Courage Essay Contest](https://www.jfklibrary.org/learn/education/profile-in-courage-essay-contest) - Essay contest on political courage based on Kennedy's book.",
      "[National Council of Teachers of English (NCTE) Achievement Awards](https://ncte.org/awards/achievement-awards-in-writing/) - Writing awards for high school juniors.",
      "[Princeton University Ten-Minute Play Contest](https://arts.princeton.edu/about/opportunities/high-school-contests/ten-minute-play-contest/) - Playwriting contest for 11th grade students.",
      "[Bennington Young Writers Awards](https://www.bennington.edu/events/young-writers-awards) - Fiction, poetry, and nonfiction competition for high school students."
    ];
  }
  
  // Social Sciences
  if (lowerMajor.includes('psycholog') || lowerMajor.includes('sociol') || 
      lowerMajor.includes('politic') || lowerMajor.includes('international')) {
    return [
      "[Harvard Undergraduate Foreign Policy Initiative Essay Contest](https://www.hufpi.org/) - Essay competition focusing on international relations and policy.",
      "[Yale Review of International Studies Essay Contest](https://yris.yira.org/essay-contest) - International affairs essay competition for high school students.",
      "[National Peace Essay Contest](https://www.usip.org/public-education/students/national-peace-essay-contest) - Essay contest exploring conflict and peacebuilding.",
      "[Model United Nations Competitions](https://www.nmun.org/) - Simulations of UN proceedings and international relations.",
      "[Psychology Thesis Competition](https://www.apa.org/education-career/awards) - Research competition for psychological science projects.",
      "[National Speech and Debate Association Tournaments](https://www.speechanddebate.org/nationals/) - Various categories including Lincoln-Douglas Debate and Public Forum.",
      "[Civic Action Project Competition](https://www.crfcap.org/) - Project-based civic learning competition."
    ];
  }
  
  // General academic competitions (default)
  return [
    "[Regeneron Science Talent Search](https://www.societyforscience.org/regeneron-sts/) - The nation's most prestigious science research competition for high school seniors.",
    "[The Breakthrough Junior Challenge](https://breakthroughjuniorchallenge.org/) - Global competition for students to inspire creative thinking about science.",
    "[National Speech and Debate Tournament](https://www.speechanddebate.org/nationals/) - Premier national speech and debate competition.",
    "[Conrad Challenge](https://www.conradchallenge.org/) - Innovation and entrepreneurship competition for developing solutions to real-world problems.",
    "[National Academic Quiz Tournaments (NAQT)](https://www.naqt.com/) - Quiz bowl competitions testing knowledge across all academic disciplines.",
    "[Future Problem Solving Program International](https://www.fpspi.org/) - Academic competition focusing on creative problem-solving skills.",
    "[Modeling the Future Challenge](https://www.mtfchallenge.org/) - Actuarial science and risk analysis competition."
  ];
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