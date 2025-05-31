/**
 * Hybrid Recommendations Generator
 * 
 * This module combines standardized templates with AI-powered personalization
 * to create consistent yet customized recommendations for students.
 */

import { StudentProfile } from '@/components/StudentQuestionnaire';
import { selectTemplates, RecommendationTemplate } from './templates';
import { RecommendationResponse, EnhancedRecommendationResponse } from './types';
import { getModelResponse } from '@/services/openai/service';

/**
 * Detailed recommendation for activities with metadata
 */
interface ExternalActivityRecommendation {
  name: string;
  description: string;
  relevance: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: string;
  skillsDeveloped: string[];
}

/**
 * Competition recommendation with additional information
 */
interface CompetitionRecommendation {
  name: string;
  description: string;
  link: string;
  deadline?: string;
  eligibility?: string;
  benefits?: string;
}

/**
 * Enhanced recommendation response with AI-recommended activities
 */
// Use the ExternalActivityRecommendation type for strongly-typed recommendations
// The EnhancedRecommendationResponse is now imported from types.ts

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
    case 'senior':
      insights += "Senior year is focused on finalizing and submitting college applications while maintaining strong academic performance. For " + (major !== "undecided major" ? `students interested in ${major}` : "all students") + ", it's important to stay engaged in meaningful activities while avoiding senioritis. Use this time to visit colleges, make thoughtful decisions about where to attend, and prepare for the transition to college life.";
      break;
    default:
      insights += "Focus on maintaining strong academic performance while pursuing activities that align with your interests and goals. Use this time to explore potential majors and career paths through hands-on experiences and research.";
  }
  
  return insights;
}

/**
 * Fill template content with personalized variable values
 */
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
 * Make a request to the server-side API endpoint for AI-generated content
 */
async function makeServerSideRequest(message: string, useWebSearch: boolean = false): Promise<string> {
  try {
    // Construct the absolute URL for the API endpoint
    const apiUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/chat` 
      : process.env.NEXT_PUBLIC_API_BASE_URL 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat`
        : '/api/chat'; // Fallback to relative URL
    
    console.log(`Making API request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        isWebSearch: useWebSearch
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error making server-side request:', error);
    throw error;
  }
}

/**
 * Get competition recommendations using web search
 * This function uses web search to find relevant, up-to-date competitions
 */
async function getCompetitionRecommendations(
  profile: StudentProfile
): Promise<CompetitionRecommendation[]> {
  try {
    const prompt = `
      Based on this student profile:
      - Grade: ${profile.gradeLevel}
      - Intended Major: ${profile.intendedMajor}
      - Current Activities: ${profile.currentActivities}
      - Interested In: ${profile.interestedActivities}
      
      Use web search to find 5 specific, current academic competitions, olympiads, or challenges that are most relevant to this student's interests and background.
      
      For each competition, include:
      1. Official name of the competition
      2. A brief description
      3. The official website URL (provide complete URL, not just the domain)
      4. Eligibility requirements (grade levels, age, etc.)
      5. Key deadlines if available
      6. Why this competition specifically matches this student's profile
      
      Format your response as JSON with the following structure:
      {
        "competitions": [
          {
            "name": "Competition Name",
            "description": "Brief description",
            "link": "https://complete.url.com",
            "eligibility": "Eligibility info",
            "deadline": "Deadline info or 'Varies'",
            "benefits": "Why this is valuable"
          }
        ]
      }
      
      Use web search to ensure information is current and accurate for ${new Date().getFullYear()}-${new Date().getFullYear() + 1}.
      Only include competitions with active websites and upcoming opportunities.
      Focus on competitions with the greatest prestige and impact for college applications.
    `;

    console.log("Requesting competition recommendations using web search");
    
    try {
      // Make a request to the AI with web search enabled
      const modelResponse = await getModelResponse(prompt, null, null, true);
      
      if (!modelResponse.success || !modelResponse.content) {
        throw new Error("Failed to generate competition recommendations");
      }
      
      const responseContent = modelResponse.content;
      
      // Extract JSON from the response
      const jsonMatch = responseContent.match(/```json\n([\s\S]*)\n```/) || 
                        responseContent.match(/```\n([\s\S]*)\n```/) || 
                        responseContent.match(/\{[\s\S]*\}/);
                        
      if (!jsonMatch) {
        console.error("Could not extract JSON from response:", responseContent.substring(0, 200));
        return generateFallbackCompetitions(profile);
      }
      
      const jsonString = jsonMatch[1] || jsonMatch[0];
      
      // Parse the JSON response
      const parsedResponse = JSON.parse(jsonString);
      
      if (!Array.isArray(parsedResponse.competitions)) {
        console.error("Invalid competitions format in response:", parsedResponse);
        return generateFallbackCompetitions(profile);
      }
      
      // Format and validate the competition recommendations
      return parsedResponse.competitions.map(comp => ({
        name: comp.name || 'Recommended Competition',
        description: comp.description || 'No description provided',
        link: comp.link || '#',
        deadline: comp.deadline || 'Varies',
        eligibility: comp.eligibility || 'High school students',
        benefits: comp.benefits || 'Enhances your college application'
      }));
    } catch (parseError) {
      console.error('Error parsing competition recommendations:', parseError);
      return generateFallbackCompetitions(profile);
    }
  } catch (error) {
    console.error('Error getting competition recommendations:', error);
    return generateFallbackCompetitions(profile);
  }
}

/**
 * Generate fallback competition recommendations if web search fails
 */
function generateFallbackCompetitions(profile: StudentProfile): CompetitionRecommendation[] {
  const major = profile.intendedMajor?.toLowerCase() || '';
  
  const fallbackCompetitions: CompetitionRecommendation[] = [
    {
      name: "International Science and Engineering Fair (ISEF)",
      description: "The world's largest international pre-college science competition.",
      link: "https://www.societyforscience.org/isef/",
      eligibility: "High school students grades 9-12",
      deadline: "Regional deadlines vary; finals in May",
      benefits: "Prestigious recognition, scholarships, and networking with leading scientists"
    },
    {
      name: "The Breakthrough Junior Challenge",
      description: "A global competition for students to create short videos explaining scientific concepts.",
      link: "https://breakthroughjuniorchallenge.org/",
      eligibility: "Students ages 13-18",
      deadline: "Submissions typically due in June",
      benefits: "$250,000 scholarship for the winner, plus benefits for teachers and schools"
    },
    {
      name: "International Mathematical Olympiad (IMO)",
      description: "The world's championship mathematics competition for high school students.",
      link: "https://www.imo-official.org/",
      eligibility: "High school students under age 20",
      deadline: "National selection processes begin in fall",
      benefits: "Gold, silver, and bronze medals; recognized by top universities worldwide"
    }
  ];
  
  // Add more specialized competitions based on intended major
  if (major.includes('comput') || major.includes('tech') || major.includes('program')) {
    fallbackCompetitions.push({
      name: "USA Computing Olympiad (USACO)",
      description: "A computer programming competition for secondary school students.",
      link: "http://www.usaco.org/",
      eligibility: "Secondary school students",
      deadline: "Multiple contests throughout the year",
      benefits: "Recognition by top computer science programs; training camp opportunities"
    });
  } else if (major.includes('business') || major.includes('econ')) {
    fallbackCompetitions.push({
      name: "DECA International Career Development Conference",
      description: "Business case study competitions in various categories.",
      link: "https://www.deca.org/",
      eligibility: "High school students",
      deadline: "State competitions typically January-March",
      benefits: "Leadership development, networking, and scholarships"
    });
  } else if (major.includes('art') || major.includes('design')) {
    fallbackCompetitions.push({
      name: "Scholastic Art & Writing Awards",
      description: "Nation's longest-running recognition program for creative students.",
      link: "https://www.artandwriting.org/",
      eligibility: "Students grades 7-12, ages 13 and up",
      deadline: "Regional deadlines typically in December/January",
      benefits: "Scholarships, exhibition opportunities, and national recognition"
    });
  }
  
  return fallbackCompetitions;
}

/**
 * Get activity recommendations using the server-side API endpoint
 */
async function getExternalActivityRecommendations(
  profile: StudentProfile
): Promise<ExternalActivityRecommendation[]> {
  try {
    const prompt = `
      Given this student profile:
      - Grade: ${profile.gradeLevel}
      - Intended Major: ${profile.intendedMajor}
      - Current Activities: ${profile.currentActivities}
      - Interested In: ${profile.interestedActivities}
      
      Search and recommend 3-5 specific, current, and relevant activities, programs, or opportunities that    
      Format each recommendation as a structured JSON object with:
      - name: string
      - description: string
      - relevance: string
      - difficulty: "beginner" | "intermediate" | "advanced"
      - timeCommitment: string
      - skillsDeveloped: string[]
      
      Return a JSON object with a 'recommendations' array containing these activity objects.
      Include specific, real programs where possible, with current information.
    `;

    try {
      // Make a request to the server-side API
      const responseContent = await makeServerSideRequest(prompt);
      
      // Parse the JSON response
      // The API response might be in markdown format, so we try to extract JSON from it
      const jsonMatch = responseContent.match(/```json\n([\s\S]*)\n```/) || 
                        responseContent.match(/\{[\s\S]*\}/);
                        
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseContent;
      
      const parsedResponse = JSON.parse(jsonString);
      
      if (Array.isArray(parsedResponse.recommendations)) {
        return parsedResponse.recommendations.map(rec => ({
          name: rec.name || 'Recommended Activity',
          description: rec.description || 'No description provided',
          relevance: rec.relevance || 'Aligns with your interests and goals',
          difficulty: rec.difficulty || 'intermediate',
          timeCommitment: rec.timeCommitment || 'Varies',
          skillsDeveloped: rec.skillsDeveloped || ['Leadership', 'Project Management']
        }));
      }
      throw new Error('Invalid response format from API');
    } catch (parseError) {
      console.error('Error parsing API response:', parseError);
      return generateMockActivityRecommendations(profile);
    }
  } catch (error) {
    console.error('Error getting external activity recommendations:', error);
    return generateMockActivityRecommendations(profile);
  }
}

/**
 * Generate mock activity recommendations based on student profile
 */
function generateMockActivityRecommendations(
  profile: StudentProfile
): ExternalActivityRecommendation[] {
  const major = (profile.intendedMajor || "undecided").toLowerCase();
  const grade = (profile.gradeLevel || "").toLowerCase();
  
  // Base recommendations that are good for any student
  const baseRecommendations: ExternalActivityRecommendation[] = [
    {
      name: "Community Service Leadership Program",
      description: "Lead and organize community service projects that address local needs.",
      relevance: "Develops leadership and project management skills valued by colleges.",
      difficulty: "intermediate",
      timeCommitment: "5-10 hours per month",
      skillsDeveloped: ["Leadership", "Project Management", "Community Engagement"]
    }
  ];

  // Add major-specific recommendations
  if (major.includes('comput') || major.includes('tech') || major.includes('engineer')) {
    baseRecommendations.push({
      name: "Local Tech Meetup Groups",
      description: "Join and participate in local technology meetups and coding groups.",
      relevance: "Direct exposure to tech community and current trends.",
      difficulty: "beginner",
      timeCommitment: "4-6 hours per month",
      skillsDeveloped: ["Networking", "Technical Knowledge", "Communication"]
    });
    
    baseRecommendations.push({
      name: "Personal Coding Project",
      description: "Develop an app or website that solves a real problem in your community.",
      relevance: "Demonstrates practical application of technical skills.",
      difficulty: "advanced",
      timeCommitment: "10-15 hours per month",
      skillsDeveloped: ["Programming", "Problem Solving", "User Experience Design"]
    });
  } else if (major.includes('business') || major.includes('econ')) {
    baseRecommendations.push({
      name: "Student Enterprise Program",
      description: "Start and run a small business or social enterprise at school.",
      relevance: "Hands-on business experience shows entrepreneurial initiative.",
      difficulty: "advanced",
      timeCommitment: "10-15 hours per month",
      skillsDeveloped: ["Entrepreneurship", "Financial Management", "Marketing"]
    });
    
    baseRecommendations.push({
      name: "Business Case Competition",
      description: "Form a team to participate in business case analysis competitions.",
      relevance: "Develops analytical thinking and presentation skills.",
      difficulty: "intermediate",
      timeCommitment: "Varies by competition cycle",
      skillsDeveloped: ["Strategic Analysis", "Teamwork", "Presentation Skills"]
    });
  } else if (major.includes('art') || major.includes('music') || major.includes('drama')) {
    baseRecommendations.push({
      name: "Portfolio Development Workshop",
      description: "Join workshops focused on creating professional artistic portfolios.",
      relevance: "Essential for applications to arts programs.",
      difficulty: "intermediate",
      timeCommitment: "8-12 hours per month",
      skillsDeveloped: ["Portfolio Curation", "Artistic Critique", "Professional Presentation"]
    });
    
    baseRecommendations.push({
      name: "Community Arts Initiative",
      description: "Create or participate in arts programs for underserved communities.",
      relevance: "Demonstrates social impact through artistic expression.",
      difficulty: "intermediate",
      timeCommitment: "6-10 hours per month",
      skillsDeveloped: ["Community Engagement", "Project Management", "Artistic Expression"]
    });
  } else if (major.includes('science') || major.includes('bio') || major.includes('chem')) {
    baseRecommendations.push({
      name: "Independent Research Project",
      description: "Design and conduct a research project with teacher mentorship.",
      relevance: "Demonstrates scientific thinking and research skills.",
      difficulty: "advanced",
      timeCommitment: "8-12 hours per month",
      skillsDeveloped: ["Research Methods", "Data Analysis", "Scientific Writing"]
    });
    
    baseRecommendations.push({
      name: "Science Communication Initiative",
      description: "Create content explaining scientific concepts to the general public.",
      relevance: "Shows ability to communicate complex ideas clearly.",
      difficulty: "intermediate",
      timeCommitment: "4-8 hours per month",
      skillsDeveloped: ["Communication", "Content Creation", "Simplifying Complex Concepts"]
    });
  }

  // Add grade-specific recommendations
  if (grade.includes('fresh') || grade.includes('9')) {
    baseRecommendations.push({
      name: "Exploration Academy",
      description: "Join a program designed to help freshmen explore different academic and career interests.",
      relevance: "Helps identify interests and potential majors early.",
      difficulty: "beginner",
      timeCommitment: "2-4 hours per week",
      skillsDeveloped: ["Self-awareness", "Academic Exploration", "Goal Setting"]
    });
  } else if (grade.includes('soph') || grade.includes('10')) {
    baseRecommendations.push({
      name: "Mentorship Connection Program",
      description: "Connect with upperclassmen or professionals in fields of interest.",
      relevance: "Provides guidance and insight into potential career paths.",
      difficulty: "beginner",
      timeCommitment: "2-3 hours per month",
      skillsDeveloped: ["Networking", "Career Exploration", "Communication"]
    });
  } else if (grade.includes('jun') || grade.includes('11')) {
    baseRecommendations.push({
      name: "Research Assistant Program",
      description: "Assist in university research projects during summer.",
      relevance: "Gain research experience and academic exposure at the college level.",
      difficulty: "advanced",
      timeCommitment: "20-30 hours per week (summer)",
      skillsDeveloped: ["Research Methods", "Academic Writing", "Data Analysis"]
    });
  } else if (grade.includes('sen') || grade.includes('12')) {
    baseRecommendations.push({
      name: "Capstone Project",
      description: "Create a culminating project that showcases your skills and interests.",
      relevance: "Demonstrates the culmination of your high school learning and experiences.",
      difficulty: "advanced",
      timeCommitment: "10-15 hours per month",
      skillsDeveloped: ["Project Management", "Presentation", "Subject Expertise"]
    });
  }

  // If there are no major-specific recommendations, add general ones
  if (baseRecommendations.length < 3) {
    baseRecommendations.push({
      name: "Leadership Development Program",
      description: "Participate in workshops and activities designed to build leadership capabilities.",
      relevance: "Leadership skills are valued across all fields and majors.",
      difficulty: "intermediate",
      timeCommitment: "4-6 hours per month",
      skillsDeveloped: ["Leadership", "Communication", "Problem-solving"]
    });
  }

  return baseRecommendations;
}

/**
 * Generate hybrid recommendations combining templates with AI personalization
 */
export async function generateHybridRecommendations(
  profile: StudentProfile
): Promise<EnhancedRecommendationResponse> {
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

    // Get competition recommendations with web search
    console.log("Generating competition recommendations with web search");
    const competitionRecs = await getCompetitionRecommendations(profile);
    
    // Format competition recommendations with links
    const competitions = competitionRecs.map(comp => 
      `${comp.name} - [${comp.link}](${comp.link})`
    );
    
    // Get external activity recommendations
    const recommendedActivities = await getExternalActivityRecommendations(profile);
    
    return {
      suggestedProjects: projectLines,
      suggestedCompetitions: competitions,
      suggestedSkills: skillLines,
      timeline: timeline,
      profileAnalysis: profileAnalysis,
      recommendedActivities: recommendedActivities
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
        'International Science and Engineering Fair - [https://www.societyforscience.org/isef/]',
        'Regeneron Science Talent Search - [https://www.societyforscience.org/regeneron-sts/]',
        'International Mathematical Olympiad - [https://www.imo-official.org/]'
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
      profileAnalysis: `Based on your interest in ${profile.intendedMajor || "your field of interest"}, focus on developing expertise while exploring opportunities that showcase your initiative and passion.`,
      recommendedActivities: []
    };
  }
}