/**
 * Hybrid Recommendations Generator
 * 
 * This module combines standardized templates with AI-powered personalization
 * to create consistent yet customized recommendations for students.
 */

import { StudentProfile } from '@/components/StudentQuestionnaire';
import { selectTemplates, RecommendationTemplate } from './templates';
import { RecommendationResponse } from '@/services/recommendations';

interface TemplateVariable {
  name: string;
  prompt: string;
}

// Map template variable names to specific prompts for the AI
const VARIABLE_PROMPTS: { [key: string]: string } = {
  // Timeline variables - Freshman
  'adjustToHighSchool': 'Suggest 1-2 specific ways for a freshman to adjust well to high school, based on their interests in {MAJOR}.',
  'freshmanSpringActivities': 'Recommend 1-2 specific spring activities for a freshman interested in {MAJOR}.',
  'summerOpportunities': 'Suggest 2-3 specific summer opportunities relevant for a freshman interested in {MAJOR}.',
  'summerDevelopment': 'Recommend one specific skill development activity for the summer related to {MAJOR}.',
  
  // Timeline variables - Sophomore
  'deepenInvolvement': 'Suggest a specific way to deepen involvement in extracurriculars related to {MAJOR}.',
  'fallAcademicFocus': 'Recommend specific academic focuses for a sophomore interested in {MAJOR}.',
  'springCollegePrep': 'Suggest specific college preparation steps for a sophomore interested in {MAJOR}.',
  'summerPrograms': 'Recommend 1-2 specific summer programs for a sophomore interested in {MAJOR}.',
  'leadershipOpportunities': 'Suggest a specific leadership opportunity related to {MAJOR}.',
  
  // Timeline variables - Junior
  'academicRigor': 'Recommend specific advanced courses relevant to {MAJOR}.',
  'extracurricularLeadership': 'Suggest a specific leadership role in extracurriculars related to {MAJOR}.',
  'collegeResearch': 'Recommend specific approaches to researching colleges for {MAJOR}.',
  'apAdvancedCourses': 'Suggest 2-3 specific AP or advanced courses relevant to {MAJOR}.',
  'summerBeforeSenior': 'Recommend a specific meaningful activity for summer before senior year related to {MAJOR}.',
  'specificSummerActivities': 'Suggest 1-2 specific summer activities that would strengthen a college application for {MAJOR}.',
  
  // Timeline variables - Senior
  'applicationStrategy': 'Recommend a specific application strategy for students interested in {MAJOR}.',
  'fallSeniorAdvice': 'Suggest 1-2 specific activities for fall of senior year related to {MAJOR}.',
  'finalDecision': 'Recommend specific factors to consider when making final college decisions for {MAJOR}.',
  'summerBeforeCollege': 'Suggest 1-2 specific activities for summer before college for a student majoring in {MAJOR}.',
  'transitionPreparation': 'Recommend specific preparations for transitioning to college for a {MAJOR} major.',
  
  // STEM Skills
  'technicalSkills': 'Suggest 1-2 specific technical skills relevant to {MAJOR} that the student should develop.',
  'researchMethods': 'Recommend specific research methods or approaches relevant to {MAJOR}.',
  'stemCommunication': 'Suggest specific communication skills important for {MAJOR}.',
  
  // Humanities Skills
  'criticalThinking': 'Recommend specific critical thinking approaches for {MAJOR}.',
  'humanitiesResearch': 'Suggest specific research skills relevant to {MAJOR}.',
  'presentationSkills': 'Recommend specific presentation skills important for {MAJOR}.',
  
  // Business Skills
  'financialSkills': 'Suggest specific financial skills relevant to {MAJOR}.',
  'leadershipSkills': 'Recommend specific leadership skills important for {MAJOR}.',
  'businessCommunication': 'Suggest specific communication skills relevant to {MAJOR}.',
  
  // Arts Skills
  'technicalArtSkills': 'Recommend specific technical skills relevant to {MAJOR} in the arts.',
  'portfolioAdvice': 'Suggest specific portfolio development approaches for {MAJOR}.',
  'artsBusiness': 'Recommend specific business aspects to learn related to {MAJOR} in the arts.',
  
  // Research Project
  'researchTopic': 'Suggest 1-2 specific research topics related to {MAJOR} appropriate for a high school student.',
  'researchImplementation': 'Recommend specific implementation steps for a research project related to {MAJOR}.',
  'researchPresentation': 'Suggest specific ways to present research findings related to {MAJOR}.',
  
  // Community Service
  'communityNeed': 'Suggest 1-2 specific community needs related to {MAJOR} that a student could address.',
  'serviceProjectPlan': 'Recommend specific planning steps for a service project related to {MAJOR}.',
  'serviceImplementation': 'Suggest specific implementation strategies for a service project related to {MAJOR}.',
  
  // Entrepreneurship
  'businessConcept': 'Suggest 1-2 specific business concepts related to {MAJOR} appropriate for a high school student.',
  'businessPlan': 'Recommend specific elements to include in a business plan related to {MAJOR}.',
  'businessLaunch': 'Suggest specific launch strategies for a business venture related to {MAJOR}.',
  
  // Creative
  'creativeConceptIdeas': 'Suggest 1-2 specific creative project ideas related to {MAJOR}.',
  'creativeProcess': 'Recommend specific process steps for a creative project related to {MAJOR}.',
  'creativeExhibition': 'Suggest specific ways to exhibit or share creative work related to {MAJOR}.'
};

/**
 * Generate personalized variable content using AI
 */
async function generateVariableContent(
  variableName: string, 
  profile: StudentProfile
): Promise<string> {
  try {
    // Get the prompt template for this variable
    const promptTemplate = VARIABLE_PROMPTS[variableName] || 
      'Provide a specific recommendation relevant to {MAJOR}.';
    
    // Customize the prompt with student information
    const customizedPrompt = promptTemplate.replace(
      '{MAJOR}', 
      profile.intendedMajor || 'their intended major'
    );
    
    // For now, we'll just mock some responses for demonstrating the concept
    // In production, this would call the AI API to get personalized content
    const mockResponses: {[key: string]: string[]} = {
      'adjustToHighSchool': [
        'Join a STEM-focused club like Robotics or Coding Club to connect with peers who share your interests',
        'Set up a regular study schedule that balances your academic workload with time for personal projects'
      ],
      'summerOpportunities': [
        'Attend a summer coding camp or workshop where you can build your first app',
        'Take an introductory online course in computer science fundamentals',
        'Volunteer at a local tech repair shop to gain hands-on experience'
      ],
      'researchTopic': [
        'Develop a small-scale environmental monitoring system using Arduino or Raspberry Pi',
        'Create a data analysis project examining trends in local weather patterns or pollution levels'
      ],
      'technicalSkills': [
        'Learn basic programming in Python, a versatile language used in many STEM fields',
        'Develop skills in data visualization using tools like Matplotlib or Tableau'
      ]
    };
    
    // Return a mock response or default message
    const responses = mockResponses[variableName] || ['Specific recommendation for ' + profile.intendedMajor];
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  } catch (error) {
    console.error('Error generating variable content:', error);
    return 'Specific recommendation for your interests';
  }
}

/**
 * Generate comprehensive profile analysis with AI-driven insights
 * Creates a structured narrative analyzing the student's profile
 */
async function generateProfileAnalysis(profile: StudentProfile): Promise<string> {
  try {
    // Extract key information from profile
    const major = profile.intendedMajor || "undecided major";
    const grade = profile.gradeLevel || "current grade";
    const currentActivities = profile.currentActivities || "no specified activities";
    const interestedActivities = profile.interestedActivities || "no specified interests";
    const satScore = profile.satScore || "unreported SAT score";
    const additionalInfo = profile.additionalInfo;
    
    // Get grade category for tailored advice
    const gradeCategory = getGradeCategory(grade);
    
    // 1. AI-Generated Overall Narrative
    const aiNarrative = await generateOverallProfileNarrative(profile);
    const overallNarrative = `**Profile Overview**\n${aiNarrative}`;
    
    // 2. Overall Assessment Section
    const overallAssessment = generateOverallAssessment(major, currentActivities, grade);
    
    // 3. Strengths Analysis
    const strengthsAnalysis = generateStrengthsAnalysis(major, currentActivities, interestedActivities, satScore);
    
    // 4. Areas for Development
    const developmentAreas = generateDevelopmentAreas(major, currentActivities, interestedActivities, gradeCategory);
    
    // 5. Connection to Future Goals
    const futureGoalsConnection = generateFutureGoalsConnection(major, grade, currentActivities, additionalInfo);
    
    // 6. Grade-specific Insights
    const gradeSpecificInsights = generateGradeSpecificInsights(gradeCategory, major);
    
    // Combine all sections into a cohesive narrative
    return `${overallNarrative}

${overallAssessment}

${strengthsAnalysis}

${developmentAreas}

${futureGoalsConnection}

${gradeSpecificInsights}`;
  } catch (error) {
    console.error('Error generating profile analysis:', error);
    return `Based on your interest in ${profile.intendedMajor || "your field of interest"}, focus on developing expertise while exploring opportunities that showcase your initiative and passion.`;
  }
}

/**
 * Generate an overall narrative summary of the student's profile using AI
 * This provides a holistic view combining all profile elements
 */
async function generateOverallProfileNarrative(profile: StudentProfile): Promise<string> {
  try {
    // Extract key information from profile
    const major = profile.intendedMajor || "undecided major";
    const grade = profile.gradeLevel || "current grade";
    const currentActivities = profile.currentActivities || "no specified activities";
    const interestedActivities = profile.interestedActivities || "no specified interests";
    const satScore = profile.satScore || "unreported SAT score";
    
    // In a production environment, this would make an API call to an LLM
    // For now, we'll generate a structured narrative based on the profile data
    
    // Determine educational stage and goals
    const gradeCategory = getGradeCategory(grade);
    let narrative = "";
    
    // Add personalized introduction based on profile completeness
    if (major !== "undecided major" && currentActivities !== "no specified activities") {
      narrative += `Your profile reveals a student with clear direction in ${major} and active engagement through ${summarizeActivities(currentActivities)}. `;
    } else if (major !== "undecided major") {
      narrative += `Your interest in ${major} provides a strong foundation for your educational journey. `;
    } else if (currentActivities !== "no specified activities") {
      narrative += `Your involvement in ${summarizeActivities(currentActivities)} demonstrates your commitment to growth outside the classroom. `;
    } else {
      narrative += `You're at an important stage in your educational journey where exploration and discovery will help shape your path forward. `;
    }
    
    // Add grade-specific context
    switch(gradeCategory) {
      case 'freshman':
        narrative += `As a freshman, you're at the beginning of your high school journey with many opportunities to explore and establish strong foundations. `;
        break;
      case 'sophomore':
        narrative += `Your sophomore year is an ideal time to start focusing your interests while maintaining academic excellence across subjects. `;
        break;
      case 'junior':
        narrative += `Junior year marks a critical period for college preparation, where your academic performance and leadership activities carry significant weight. `;
        break;
      case 'senior':
        narrative += `As you navigate your senior year, your focus should be on showcasing your accomplishments while making thoughtful decisions about your future education. `;
        break;
      default:
        narrative += `Your current grade level provides unique opportunities and challenges to prepare for your future education. `;
    }
    
    // Add major-specific insights
    if (major !== "undecided major") {
      if (major.toLowerCase().includes("comput") || major.toLowerCase().includes("engineer") || 
          major.toLowerCase().includes("tech")) {
        narrative += `In the ${major} field, combining strong technical foundations with practical projects will help you stand out to colleges. Your ability to demonstrate both theoretical understanding and applied skills through personal projects or competitions will be particularly valuable. `;
      } else if (major.toLowerCase().includes("business") || major.toLowerCase().includes("econ")) {
        narrative += `For a student interested in ${major}, developing practical experience through leadership roles, entrepreneurial ventures, or business-focused competitions can significantly strengthen your profile. Colleges value applicants who demonstrate initiative and real-world understanding of business principles. `;
      } else if (major.toLowerCase().includes("art") || major.toLowerCase().includes("music") || 
                 major.toLowerCase().includes("creative")) {
        narrative += `In pursuing ${major}, developing a distinctive portfolio that showcases your creative voice and technical skills will be essential. Colleges look for artistic students who demonstrate both talent and dedication through consistent practice and participation in exhibitions or performances. `;
      } else if (major.toLowerCase().includes("science") || major.toLowerCase().includes("biology") || 
                 major.toLowerCase().includes("chem")) {
        narrative += `For a student interested in ${major}, combining rigorous coursework with hands-on research or laboratory experience will strengthen your application. Colleges value students who demonstrate scientific curiosity beyond classroom requirements through independent projects or research opportunities. `;
      } else {
        narrative += `Your interest in ${major} provides clear direction for your academic and extracurricular choices. Building depth in this area while maintaining breadth in your overall education will create a compelling profile for college applications. `;
      }
    }
    
    // Add activity insights
    if (currentActivities !== "no specified activities") {
      if (currentActivities.toLowerCase().includes("leader") || 
          currentActivities.toLowerCase().includes("president") || 
          currentActivities.toLowerCase().includes("captain")) {
        narrative += `Your leadership experience in extracurricular activities demonstrates initiative and responsibility that colleges highly value. Continue developing these leadership skills while mentoring others. `;
      } else {
        narrative += `Your extracurricular involvement shows commitment to interests outside the classroom. Consider seeking leadership opportunities in these activities to demonstrate growth and increased responsibility. `;
      }
    }
    
    // Include forward-looking conclusion
    narrative += `Moving forward, focus on building a cohesive narrative across your academics, activities, and personal development that authentically represents your strengths and aspirations.`;
    
    return narrative;
  } catch (error) {
    console.error('Error generating overall narrative:', error);
    return `You have laid a good foundation for your college preparation journey. Continue developing your unique strengths while exploring new opportunities aligned with your interests.`;
  }
}

/**
 * Determines the grade category for tailored advice
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
 * Generates an overall assessment of the student's profile
 */
function generateOverallAssessment(major: string, activities: string, grade: string): string {
  // Check if the student has declared a specific major
  const hasDeclaredMajor = major !== "undecided major";
  
  // Check if the student has listed activities
  const hasActivities = activities !== "no specified activities";
  
  if (hasDeclaredMajor && hasActivities) {
    return `**Overall Profile Assessment**\nYour profile shows a focused interest in ${major} supported by your involvement in ${summarizeActivities(activities)}. As a ${grade} student, you're demonstrating good academic direction that aligns with your potential college aspirations.`;
  } else if (hasDeclaredMajor) {
    return `**Overall Profile Assessment**\nYour profile indicates a clear interest in ${major}, which provides good direction for your academic journey. As a ${grade} student, you should now focus on building experiences that demonstrate this interest through relevant activities.`;
  } else if (hasActivities) {
    return `**Overall Profile Assessment**\nWhile you haven't specified a intended major yet, your involvement in ${summarizeActivities(activities)} suggests interests you could explore academically. As a ${grade} student, these activities provide a foundation for discovering potential college majors.`;
  } else {
    return `**Overall Profile Assessment**\nAs a ${grade} student, you're at an exploratory stage where you can discover your academic interests and potential career paths. This is a great time to try different activities and subjects to find what resonates with you.`;
  }
}

/**
 * Creates a concise summary of activities
 */
function summarizeActivities(activities: string): string {
  // Split activities by common separators and clean up
  const activityList = activities
    .split(/[,;]/)
    .map(activity => activity.trim())
    .filter(activity => activity.length > 0);
  
  if (activityList.length === 0) {
    return "various activities";
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
 * Analyzes student's strengths based on their profile
 */
function generateStrengthsAnalysis(major: string, currentActivities: string, interestedActivities: string, satScore: string): string {
  let strengths = "**Key Strengths**\n";
  
  // Check for academic indicators
  if (satScore !== "unreported SAT score" && !satScore.toLowerCase().includes("plan")) {
    let scoreAssessment = "";
    
    // Simple score analysis
    if (satScore.includes("1")) {
      const numericScore = parseInt(satScore.replace(/\D/g, ""));
      if (numericScore >= 1400) {
        scoreAssessment = "Your strong SAT score demonstrates excellent academic preparation and testing aptitude. ";
      } else if (numericScore >= 1200) {
        scoreAssessment = "Your solid SAT score shows good academic foundation and test-taking skills. ";
      } else {
        scoreAssessment = "Your SAT score provides a starting point for your college preparation. ";
      }
    }
    
    strengths += scoreAssessment;
  }
  
  // Analyze current activities for relevant strengths
  if (currentActivities !== "no specified activities") {
    strengths += `Your involvement in ${summarizeActivities(currentActivities)} demonstrates commitment and time management. `;
    
    // Look for leadership indicators
    if (currentActivities.toLowerCase().includes("leader") || 
        currentActivities.toLowerCase().includes("president") || 
        currentActivities.toLowerCase().includes("captain")) {
      strengths += "You've shown leadership capabilities through your roles, which colleges value highly. ";
    }
    
    // Look for major-relevant activities
    if (major !== "undecided major" && activityRelatesToMajor(currentActivities, major)) {
      strengths += `Your activities align well with your interest in ${major}, showing authentic engagement in your field. `;
    }
  }
  
  // Check interest in future activities
  if (interestedActivities !== "no specified interests") {
    strengths += `Your interest in exploring ${summarizeActivities(interestedActivities)} shows initiative and forward thinking about your development. `;
  }
  
  return strengths;
}

/**
 * Checks if activities relate to the intended major
 */
function activityRelatesToMajor(activities: string, major: string): boolean {
  const lowerActivities = activities.toLowerCase();
  const lowerMajor = major.toLowerCase();
  
  // STEM major relationships
  if (lowerMajor.includes("comput") || lowerMajor.includes("engineer") || 
      lowerMajor.includes("math") || lowerMajor.includes("physics")) {
    return lowerActivities.includes("robot") || lowerActivities.includes("math") || 
           lowerActivities.includes("science") || lowerActivities.includes("tech") ||
           lowerActivities.includes("code") || lowerActivities.includes("comput");
  }
  
  // Business major relationships
  if (lowerMajor.includes("business") || lowerMajor.includes("econ") || 
      lowerMajor.includes("financ") || lowerMajor.includes("account")) {
    return lowerActivities.includes("business") || lowerActivities.includes("econ") || 
           lowerActivities.includes("deca") || lowerActivities.includes("entrepreneur") ||
           lowerActivities.includes("invest") || lowerActivities.includes("market");
  }
  
  // Arts major relationships
  if (lowerMajor.includes("art") || lowerMajor.includes("music") || 
      lowerMajor.includes("drama") || lowerMajor.includes("theater") || 
      lowerMajor.includes("film")) {
    return lowerActivities.includes("art") || lowerActivities.includes("music") || 
           lowerActivities.includes("band") || lowerActivities.includes("drama") ||
           lowerActivities.includes("theater") || lowerActivities.includes("film") ||
           lowerActivities.includes("creativ");
  }
  
  // General match for other majors
  return lowerActivities.includes(lowerMajor.substring(0, 4));
}

/**
 * Identifies key development areas based on profile
 */
function generateDevelopmentAreas(major: string, currentActivities: string, interestedActivities: string, gradeCategory: string): string {
  let development = "**Areas for Development**\n";
  
  // Major-specific development areas
  if (major !== "undecided major") {
    const hasRelatedActivities = currentActivities !== "no specified activities" && 
                               activityRelatesToMajor(currentActivities, major);
    
    if (!hasRelatedActivities) {
      development += `Consider pursuing activities more closely aligned with your interest in ${major} to demonstrate commitment to this field. `;
    }
    
    // Suggest deeper engagement
    development += `Look for opportunities to deepen your knowledge in ${major} through specialized courses, projects, or mentorship. `;
  } else {
    development += "Take time to explore potential majors by engaging with different subjects and related extracurricular activities. Reflection on what you enjoy and excel at will help narrow your focus. ";
  }
  
  // Grade-specific development areas
  switch(gradeCategory) {
    case 'freshman':
      development += "Focus on building strong academic foundations and exploring different extracurriculars to discover your interests. ";
      break;
    case 'sophomore':
      development += "Begin to narrow your extracurricular focus while maintaining strong academics. Consider taking more challenging courses in areas of interest. ";
      break;
    case 'junior':
      development += "Prioritize leadership roles in your key activities and challenge yourself with rigorous coursework relevant to your interests. Prepare for standardized tests and begin researching colleges. ";
      break;
    case 'senior':
      development += "Showcase the culmination of your high school journey through capstone projects, continued leadership, and finalized college applications that highlight your unique strengths. ";
      break;
    default:
      development += "Work on developing a balanced profile with academics, extracurriculars, and personal projects that reflect your interests. ";
  }
  
  return development;
}

/**
 * Connects current profile to future goals
 */
function generateFutureGoalsConnection(major: string, grade: string, activities: string, additionalInfo?: string): string {
  let connection = "**Connection to Future Goals**\n";
  
  if (major !== "undecided major") {
    connection += `Your interest in ${major} forms a strong foundation for your college applications and potential career paths. `;
    
    // Major-specific connections
    if (major.toLowerCase().includes("comput") || major.toLowerCase().includes("engineer") || 
        major.toLowerCase().includes("tech")) {
      connection += "Consider showcasing your technical skills through personal projects or competitions that demonstrate hands-on capabilities in addition to theoretical knowledge. ";
    } else if (major.toLowerCase().includes("business") || major.toLowerCase().includes("econ")) {
      connection += "Look for opportunities to demonstrate entrepreneurial thinking, perhaps through starting a small venture or leading a school fundraising initiative. ";
    } else if (major.toLowerCase().includes("art") || major.toLowerCase().includes("music") || 
               major.toLowerCase().includes("creative")) {
      connection += "Focus on building a strong portfolio that showcases your creative vision and technical execution. Consider how your unique artistic perspective can be highlighted in your applications. ";
    }
  } else {
    connection += "Use this time to connect your current activities with potential academic interests. Observe which subjects and activities you find most engaging and consider how they might translate to college majors. ";
  }
  
  // Incorporate additional information if provided
  if (additionalInfo && additionalInfo.trim().length > 0) {
    // Look for specific keywords in additional info
    if (additionalInfo.toLowerCase().includes("career") || 
        additionalInfo.toLowerCase().includes("job") || 
        additionalInfo.toLowerCase().includes("profession")) {
      connection += "Your career aspirations mentioned in your additional information should guide your choice of activities and academic focus. Seek experiences that build relevant skills for that path. ";
    }
    
    if (additionalInfo.toLowerCase().includes("passion") || 
        additionalInfo.toLowerCase().includes("love") || 
        additionalInfo.toLowerCase().includes("enjoy")) {
      connection += "The passions you've mentioned can become powerful themes in your college applications, showing authenticity and deep engagement. ";
    }
  }
  
  return connection;
}

/**
 * Provides grade-specific insights and next steps
 */
function generateGradeSpecificInsights(gradeCategory: string, major: string): string {
  let insights = "**Next Steps Based on Your Grade Level**\n";
  
  switch(gradeCategory) {
    case 'freshman':
      insights += "As a freshman, your priority should be exploring broadly while building strong academic habits. Try different clubs and activities to see what resonates with you, while maintaining solid grades in all subjects. Begin thinking about which subjects might interest you for a future major, but keep an open mind.";
      break;
    case 'sophomore':
      insights += "Sophomore year is ideal for narrowing your focus while preparing for the increased rigor of junior year. Begin to take leadership in 1-2 key extracurriculars rather than participating in many activities. Consider taking honors courses in subjects related to " + (major !== "undecided major" ? `your interest in ${major}` : "your strongest academic areas") + ". Research potential summer programs for next year that could deepen your expertise.";
      break;
    case 'junior':
      insights += "Junior year is critical for college applications. Focus on maintaining strong grades in challenging courses, particularly in " + (major !== "undecided major" ? `subjects related to ${major}` : "your areas of interest") + ". Prepare thoroughly for standardized tests, aiming to complete them by early senior year. Take leadership positions in your key activities and begin researching colleges that match your academic profile and interests.";
      break;
async function fillTemplate(
  template: RecommendationTemplate, 
  profile: StudentProfile
): Promise<string> {
  let filledContent = template.template;
  
  // For each variable in the template, generate personalized content
  for (const variableName of template.variables) {
    const personalizedContent = await generateVariableContent(variableName, profile);
    // Replace the variable placeholder with the personalized content
    filledContent = filledContent.replace(
      `{{${variableName}}}`, 
      personalizedContent
    );
  }
  
  return filledContent;
}

/**
 * Generate hybrid recommendations combining templates with AI personalization
 */
export async function generateHybridRecommendations(
  profile: StudentProfile
): Promise<RecommendationResponse> {
  try {
    // Select the appropriate templates based on the student profile
    const templates = selectTemplates(profile);
    
    // Generate complete profile analysis with narrative
    const profileAnalysis = await generateProfileAnalysis(profile);
    
    // Generate the timeline recommendation
    let timeline: string[] = [];
    if (templates.timeline) {
      const filledTimeline = await fillTemplate(templates.timeline, profile);
      timeline = filledTimeline.split('\n\n').filter(section => section.trim() !== '');
    }
    
    // Generate skill recommendations
    const skills = await Promise.all(
      templates.skills.map(template => fillTemplate(template, profile))
    );
    
    // Generate project recommendations
    const projects = await Promise.all(
      templates.projects.map(template => fillTemplate(template, profile))
    );
    
    // Extract individual skill and project items
    const skillLines = skills.join('\n').split('\n')
      .filter(line => line.includes('- '))
      .map(line => line.replace(/^[^-]*- /, '').trim());
      
    const projectLines = projects.join('\n').split('\n')
      .filter(line => line.includes('- '))
      .map(line => line.replace(/^[^-]*- /, '').trim());

    // Generate competition suggestions based on profile and major
    const competitions = generateCompetitionSuggestions(profile.intendedMajor);
    
    return {
      suggestedProjects: projectLines,
      suggestedCompetitions: competitions,
      suggestedSkills: skillLines,
      timeline: timeline,
      profileAnalysis: profileAnalysis
    };
  } catch (error) {
    console.error('Error generating hybrid recommendations:', error);
    
    // Fallback to basic recommendations
    return {
      suggestedProjects: [
        'Develop an independent project related to your interests',
        'Create a portfolio showcasing your work and accomplishments'
      ],
      suggestedCompetitions: [
        'Research competitions in your field of interest',
        'Participate in local or regional academic contests'
      ],
      suggestedSkills: [
        'Develop strong communication and presentation skills',
        'Build technical skills relevant to your intended major',
        'Practice leadership and teamwork through group activities'
      ],
      timeline: [
        'Focus on academic excellence and extracurricular depth',
        'Research colleges and prepare for standardized tests',
        'Develop and submit strong applications',
        'Make your final college decision'
      ],
      profileAnalysis: `Based on your interest in ${profile.intendedMajor || "your field of interest"}, focus on developing expertise while exploring opportunities that showcase your initiative and passion.`
    };
  }
}

/**
 * Generate competition suggestions based on student's intended major
 */
function generateCompetitionSuggestions(major: string): string[] {
  const defaultCompetitions = [
    'Academic competitions in your field of interest',
    'Local and regional student contests',
    'Research and project showcase events'
  ];

  if (!major || major === "undecided major") return defaultCompetitions;

  const lowerMajor = major.toLowerCase();
  
  if (lowerMajor.includes('comput') || lowerMajor.includes('tech') || lowerMajor.includes('engineer')) {
    return [
      'Hackathons and coding competitions',
      'Science and Engineering fairs',
      'Robotics competitions',
      'Math and programming olympiads'
    ];
  }
  
  if (lowerMajor.includes('business') || lowerMajor.includes('econ')) {
    return [
      'DECA competitions',
      'Business plan competitions',
      'Stock market simulation contests',
      'Entrepreneurship challenges'
    ];
  }
  
  if (lowerMajor.includes('science') || lowerMajor.includes('bio') || lowerMajor.includes('chem')) {
    return [
      'Science Olympiad',
      'Science Bowl competitions',
      'Research science fairs',
      'Laboratory research programs'
    ];
  }
  
  if (lowerMajor.includes('art') || lowerMajor.includes('music') || lowerMajor.includes('drama')) {
    return [
      'Art exhibitions and contests',
      'Music performance competitions',
      'Theater and drama festivals',
      'Portfolio showcases'
    ];
  }
  
  return defaultCompetitions;
}
