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
    
    // 9. Generate monthly timeline
    const monthlyTimeline = generateMonthlyTimeline(profile);
    
    // 10. Flatten monthly timeline into a list of strings for compatibility
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
        return `${month}: ${activities[0]}${activities.length > 1 ? ` and ${activities.length - 1} more activities` : ''}`;
      })
      .filter(item => item !== '');
    
    // 11. Update user history
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
    
    // 12. Construct the enhanced recommendation response
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

    // Make the API call for a personalized analysis
    const response = await getModelResponse(prompt, null, null, false);
    
    if (response.success && response.content) {
      return response.content;
    }
    
    // Fallback if API call fails
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
      5. Include at least 2 competitions that directly relate to ${profile.intendedMajor}
      
      For EACH competition, include:
      1. The complete, accurate name of the competition
      2. A brief explanation of what it involves
      3. A direct website link in markdown format like this: [Competition Name](https://website-url.com)
      
      IMPORTANT: Avoid these competitions that the student has already seen:
      ${previousRecommendations.join(', ')}
      
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
 * Provide major-specific competition recommendations as a fallback
 */
function getMajorSpecificCompetitions(major: string): string[] {
  const lowerMajor = major.toLowerCase();
  
  // Business/Economics competitions
  if (lowerMajor.includes('business') || lowerMajor.includes('econ') || 
      lowerMajor.includes('financ') || lowerMajor.includes('account')) {
    return [
      "[DECA International Career Development Conference](https://www.deca.org/high-school-programs/) - Business-focused competition for emerging leaders and entrepreneurs.",
      "[National Economics Challenge](https://www.econedlink.org/national-economics-challenge/) - Tests knowledge of economic principles and current events in economics.",
      "[Diamond Challenge](https://diamondchallenge.org/) - Global entrepreneurship competition for high school students.",
      "[FBLA National Leadership Conference](https://www.fbla-pbl.org/conferences/nlc/) - Competition testing business knowledge, skills, and leadership abilities.",
      "[Wharton Global High School Investment Competition](https://globalyouth.wharton.upenn.edu/investment-competition/) - Online investment simulation for high school students."
    ];
  }
  
  // Computer Science/Engineering competitions
  if (lowerMajor.includes('comput') || lowerMajor.includes('program') || 
      lowerMajor.includes('engineer') || lowerMajor.includes('tech')) {
    return [
      "[FIRST Robotics Competition](https://www.firstinspires.org/robotics/frc) - Team-based robotics programs that build science, engineering, and technology skills.",
      "[Technovation Challenge](https://technovationchallenge.org/) - Technology entrepreneurship program for young women.",
      "[Congressional App Challenge](https://www.congressionalappchallenge.us/) - Competition encouraging students to learn code and create their own apps.",
      "[Regeneron International Science and Engineering Fair (ISEF)](https://www.societyforscience.org/isef/) - World's largest pre-college science competition.",
      "[American Computer Science League](https://www.acsl.org/) - Computer science and programming contest for K-12 students."
    ];
  }
  
  // Science competitions
  if (lowerMajor.includes('science') || lowerMajor.includes('bio') || 
      lowerMajor.includes('chem') || lowerMajor.includes('physic')) {
    return [
      "[Regeneron International Science and Engineering Fair (ISEF)](https://www.societyforscience.org/isef/) - World's largest pre-college science competition.",
      "[Science Olympiad](https://www.soinc.org/) - Team competition testing knowledge in various science disciplines.",
      "[Junior Science and Humanities Symposium](https://www.jshs.org/) - Promotes original research in sciences, engineering, and mathematics.",
      "[International Biology Olympiad](https://www.ibo-info.org/) - Prestigious competition for high school students excelling in biology.",
      "[Chemistry Olympiad](https://www.acs.org/education/students/highschool/olympiad.html) - Competition testing chemistry knowledge with potential for international competition."
    ];
  }
  
  // Arts competitions
  if (lowerMajor.includes('art') || lowerMajor.includes('music') || 
      lowerMajor.includes('drama') || lowerMajor.includes('film') || lowerMajor.includes('design')) {
    return [
      "[Scholastic Art & Writing Awards](https://www.artandwriting.org/) - Nation's longest-running recognition program for creative teens.",
      "[YoungArts](https://youngarts.org/apply/) - Application-based award for talented artists in visual, literary, design and performing arts.",
      "[National YoungArts Foundation Competition](https://youngarts.org/competition/) - Prestigious arts competition for emerging artists.",
      "[Photographer's Forum College and High School Photography Contest](https://pfmagazine.com/photography-contest/) - Competition for emerging photographers.",
      "[National HighSchool Music Institute](https://music.northwestern.edu/nhsmi) - Summer program for outstanding high school musicians."
    ];
  }
  
  // Humanities competitions
  if (lowerMajor.includes('english') || lowerMajor.includes('histor') || 
      lowerMajor.includes('polit') || lowerMajor.includes('philos') || lowerMajor.includes('psycho')) {
    return [
      "[National History Day](https://www.nhd.org/) - Year-long research-based program for students to explore historical topics.",
      "[John Locke Essay Competition](https://www.johnlockeinstitute.com/essay-competition) - Philosophy essay competition for high school students.",
      "[The Concord Review](https://www.tcr.org/) - Journal publishing exemplary high school history essays.",
      "[American Foreign Policy Council Essay Contest](https://www.afpc.org/about/internships-fellowships) - Essay competition on foreign policy topics.",
      "[Profile in Courage Essay Contest](https://www.jfklibrary.org/learn/education/profile-in-courage-essay-contest) - Essay contest on political courage based on Kennedy's book."
    ];
  }
  
  // Mathematics competitions
  if (lowerMajor.includes('math')) {
    return [
      "[International Mathematical Olympiad](https://www.imo-official.org/) - World championship mathematics competition for high school students.",
      "[American Mathematics Competitions](https://www.maa.org/math-competitions) - Series of competitions testing mathematical problem-solving skills.",
      "[MathCounts](https://www.mathcounts.org/) - National math coaching and competition program.",
      "[Harvard-MIT Mathematics Tournament](https://www.hmmt.org/) - Student-organized competition held at MIT and Harvard.",
      "[Mu Alpha Theta](https://mualphatheta.org/competitions) - National high school and two-year college mathematics honor society with competitions."
    ];
  }
  
  // General academic competitions (default)
  return [
    "[Regeneron Science Talent Search](https://www.societyforscience.org/regeneron-sts/) - The nation's most prestigious science research competition for high school seniors.",
    "[The Breakthrough Junior Challenge](https://breakthroughjuniorchallenge.org/) - Global competition for students to inspire creative thinking about science.",
    "[National Speech and Debate Tournament](https://www.speechanddebate.org/nationals/) - Premier national speech and debate competition.",
    "[Model United Nations](https://www.nmun.org/) - Authentic simulation of the UN General Assembly and other multilateral bodies.",
    "[Quiz Bowl](https://www.naqt.com/about-quiz-bowl.html) - Academic competition that tests knowledge across all academic disciplines."
  ];
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
    "Collaboration and teamwork",
    "Time management and organization",
    "Leadership and initiative"
  ];
  
  // Major-specific skills
  const majorSpecificSkills: string[] = [];
  
  // Business/Economics skills
  if (major.includes('business') || major.includes('econ') || 
      major.includes('financ') || major.includes('account')) {
    if (skillLevels.analytical === 'beginner') {
      majorSpecificSkills.push("Financial literacy and basic accounting principles");
      majorSpecificSkills.push("Introduction to business models and strategies");
    } else if (skillLevels.analytical === 'intermediate') {
      majorSpecificSkills.push("Financial analysis and business planning");
      majorSpecificSkills.push("Market research and competitive analysis");
    } else {
      majorSpecificSkills.push("Advanced financial modeling and investment analysis");
      majorSpecificSkills.push("Strategic planning and organizational development");
    }
    
    if (skillLevels.leadership === 'beginner') {
      majorSpecificSkills.push("Fundamentals of team dynamics and collaboration");
    } else if (skillLevels.leadership === 'intermediate') {
      majorSpecificSkills.push("Project management and organizational leadership");
    } else {
      majorSpecificSkills.push("Executive decision-making and organizational strategy");
    }
  }
  
  // Computer Science/Engineering skills
  else if (major.includes('comput') || major.includes('tech') || 
           major.includes('engineer') || major.includes('program')) {
    if (skillLevels.technical === 'beginner') {
      majorSpecificSkills.push("Programming fundamentals in Python or JavaScript");
      majorSpecificSkills.push("Basic web development with HTML/CSS");
    } else if (skillLevels.technical === 'intermediate') {
      majorSpecificSkills.push("Full-stack development with databases and APIs");
      majorSpecificSkills.push("Software engineering principles and best practices");
    } else {
      majorSpecificSkills.push("Advanced algorithms and data structures");
      majorSpecificSkills.push("DevOps and deployment architecture");
    }
    
    if (skillLevels.analytical === 'beginner') {
      majorSpecificSkills.push("Logical problem-solving and debugging skills");
    } else if (skillLevels.analytical === 'intermediate') {
      majorSpecificSkills.push("System design and architectural planning");
    } else {
      majorSpecificSkills.push("Performance optimization and advanced debugging");
    }
  }
  
  // Science skills
  else if (major.includes('science') || major.includes('bio') || 
           major.includes('chem') || major.includes('physics')) {
    if (skillLevels.research === 'beginner') {
      majorSpecificSkills.push("Scientific method and experimental design basics");
      majorSpecificSkills.push("Laboratory safety and basic techniques");
    } else if (skillLevels.research === 'intermediate') {
      majorSpecificSkills.push("Advanced research methodologies and data collection");
      majorSpecificSkills.push("Statistical analysis and experimental validation");
    } else {
      majorSpecificSkills.push("Specialized laboratory techniques relevant to your field");
      majorSpecificSkills.push("Scientific paper writing and publication process");
    }
    
    if (skillLevels.communication === 'beginner') {
      majorSpecificSkills.push("Scientific communication fundamentals");
    } else if (skillLevels.communication === 'intermediate') {
      majorSpecificSkills.push("Advanced scientific presentation and visualization");
    } else {
      majorSpecificSkills.push("Translating complex scientific concepts for different audiences");
    }
  }
  
  // Arts skills
  else if (major.includes('art') || major.includes('music') || 
           major.includes('drama') || major.includes('film') || 
           major.includes('design') || major.includes('creative')) {
    if (skillLevels.communication === 'beginner') {
      majorSpecificSkills.push("Fundamentals of your chosen artistic medium");
      majorSpecificSkills.push("Basic portfolio development and presentation");
    } else if (skillLevels.communication === 'intermediate') {
      majorSpecificSkills.push("Advanced techniques in your artistic specialty");
      majorSpecificSkills.push("Portfolio curation and artistic statement development");
    } else {
      majorSpecificSkills.push("Professional-level creation and production");
      majorSpecificSkills.push("Grant writing and artistic proposal development");
    }
    
    majorSpecificSkills.push("Understanding the business aspects of creative industries");
  }
  
  // Humanities skills
  else if (major.includes('english') || major.includes('histor') || 
           major.includes('polit') || major.includes('philos') || 
           major.includes('sociol') || major.includes('psychol')) {
    if (skillLevels.communication === 'beginner') {
      majorSpecificSkills.push("Academic writing and citation methods");
      majorSpecificSkills.push("Critical reading and text analysis");
    } else if (skillLevels.communication === 'intermediate') {
      majorSpecificSkills.push("Advanced research methods in humanities");
      majorSpecificSkills.push("Scholarly writing and argumentation");
    } else {
      majorSpecificSkills.push("Theory application and interdisciplinary analysis");
      majorSpecificSkills.push("Publication-quality academic writing");
    }
    
    if (skillLevels.research === 'beginner') {
      majorSpecificSkills.push("Source evaluation and information literacy");
    } else if (skillLevels.research === 'intermediate') {
      majorSpecificSkills.push("Qualitative and quantitative research methods");
    } else {
      majorSpecificSkills.push("Advanced research design and methodology");
    }
  }
  
  // If no major-specific skills were added, add some general ones
  if (majorSpecificSkills.length === 0) {
    majorSpecificSkills.push("Subject-specific knowledge in your field of interest");
    majorSpecificSkills.push("Problem-solving techniques relevant to your intended major");
    majorSpecificSkills.push("Research methods appropriate for your academic interests");
  }
  
  // Combine all skills, prioritizing major-specific ones first
  const allSkills = [...majorSpecificSkills, ...coreSkills];
  
  // Return 5-7 skills, ensuring diversity
  return allSkills.slice(0, Math.min(7, allSkills.length));
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