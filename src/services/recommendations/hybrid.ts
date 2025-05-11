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
 * Fill a template with personalized variable content
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
 * Generate hybrid recommendations combining templates with AI personalization
 */
export async function generateHybridRecommendations(
  profile: StudentProfile
): Promise<RecommendationResponse> {
  try {
    // Select the appropriate templates based on the student profile
    const templates = selectTemplates(profile);
    
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
    
    // Create the final personalized recommendations
    return {
      suggestedProjects: projectLines,
      suggestedCompetitions: [
        `Participate in competitions related to ${profile.intendedMajor}`,
        'Join academic olympiads or subject-specific contests in your area of interest',
        'Look for hackathons or innovation challenges that match your skills'
      ],
      suggestedSkills: skillLines,
      timeline: timeline,
      profileAnalysis: `Based on your interest in ${profile.intendedMajor} and current activities in ${profile.currentActivities}, you've already shown commitment to your academic interests. Focus on developing deeper expertise and leadership in these areas while exploring new opportunities that showcase your initiative and passion.`
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
      profileAnalysis: 'Continue to develop your interests and build experience in your chosen field.'
    };
  }
} 