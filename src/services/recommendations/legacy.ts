import { StudentProfile } from '@/components/StudentQuestionnaire';

interface RecommendationOptions {
  includeProjects?: boolean;
  includeCompetitions?: boolean;
  includeSkills?: boolean;
  includeTimeline?: boolean;
}

export interface RecommendationResponse {
  suggestedProjects: string[];
  suggestedCompetitions: string[];
  suggestedSkills: string[];
  timeline: string[];
  profileAnalysis: string;
}

/**
 * Generates personalized recommendations based on student profile
 */
export async function generateRecommendations(
  profile: StudentProfile,
  options: RecommendationOptions = {}
): Promise<RecommendationResponse> {
  try {
    // Construct a prompt from the student profile
    const prompt = `
      I am a student with the following profile:
      - Name: ${profile.name}
      - Grade: ${profile.gradeLevel}
      - Intended Major: ${profile.intendedMajor}
      - Current Activities: ${profile.currentActivities}
      - Activities I'm Interested In: ${profile.interestedActivities}
      - SAT Score: ${profile.satScore}
      - Additional Info: ${profile.additionalInfo}
      
      Based on this information, please provide:
      ${options.includeProjects !== false ? '- Recommended projects I should work on' : ''}
      ${options.includeCompetitions !== false ? '- Competitions I should consider participating in' : ''}
      ${options.includeSkills !== false ? '- Skills I should develop' : ''}
      ${options.includeTimeline !== false ? '- A timeline for my college application process' : ''}
      - An overall analysis of my profile strengths and areas for improvement
    `.trim();

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        isProfileQuery: true
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get recommendations: ${response.statusText}`);
    }

    const data = await response.json();
    
    // For actual implementation, the AI would return structured data
    // Here we're mocking a structured response based on the majors and interests
    return processRecommendationResponse(data.message, profile);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return getFallbackRecommendations(profile);
  }
}

/**
 * Process the AI's response to extract structured recommendations
 */
function processRecommendationResponse(message: string, profile: StudentProfile): RecommendationResponse {
  // In a real implementation, we'd properly parse the AI response
  // For now, we'll return a fallback
  return getFallbackRecommendations(profile);
}

/**
 * Generate fallback recommendations based on the profile
 * This serves as a backup in case the API call fails
 */
function getFallbackRecommendations(profile: StudentProfile): RecommendationResponse {
  // Extract key information
  const major = profile.intendedMajor.toLowerCase();
  const activities = (profile.currentActivities + " " + profile.interestedActivities).toLowerCase();
  
  // Default recommendations
  const recommendations: RecommendationResponse = {
    suggestedProjects: [
      "Create a personal portfolio website to showcase your accomplishments",
      "Start a blog about your academic interests and learnings",
      "Develop a structured study plan for standardized tests"
    ],
    suggestedCompetitions: [
      "Look into local science fairs or exhibitions",
      "Research essay competitions related to your interests",
      "Consider academic olympiads in your strongest subjects"
    ],
    suggestedSkills: [
      "Develop strong time management and organization skills",
      "Improve written and verbal communication",
      "Learn basic productivity tools and software"
    ],
    timeline: [
      "10th/11th Grade: Focus on academic excellence and standardized test prep",
      "Summer before 12th: Finalize college list and work on personal statements",
      "Fall of 12th: Submit applications and complete financial aid forms",
      "Spring of 12th: Compare admission offers and make final decision"
    ],
    profileAnalysis: `Based on your interest in ${profile.intendedMajor}, you should focus on building relevant experiences and skills that showcase your passion and aptitude in this area.`
  };
  
  // Customize based on major interest
  if (major.includes("computer") || major.includes("tech") || major.includes("engineering") || major.includes("cs")) {
    recommendations.suggestedProjects.unshift(
      "Build a software application that solves a real-world problem",
      "Contribute to open-source projects on GitHub"
    );
    recommendations.suggestedCompetitions.unshift(
      "Participate in hackathons like HackMIT or local coding competitions",
      "Enter the Congressional App Challenge or Google Science Fair"
    );
    recommendations.suggestedSkills.unshift(
      "Learn programming languages relevant to your field (Python, Java, etc.)",
      "Develop foundational knowledge in data structures and algorithms"
    );
  }
  
  if (major.includes("business") || major.includes("economics") || major.includes("finance")) {
    recommendations.suggestedProjects.unshift(
      "Start a small business or entrepreneurial venture",
      "Create a detailed business plan for a hypothetical company"
    );
    recommendations.suggestedCompetitions.unshift(
      "Join DECA or Future Business Leaders of America competitions",
      "Participate in investment or stock market simulations"
    );
    recommendations.suggestedSkills.unshift(
      "Develop financial literacy and accounting basics",
      "Learn about business models and strategic planning"
    );
  }
  
  if (major.includes("science") || major.includes("biology") || major.includes("chemistry") || major.includes("physics")) {
    recommendations.suggestedProjects.unshift(
      "Conduct an independent research project with a teacher mentor",
      "Develop a science demonstration or exhibit for younger students"
    );
    recommendations.suggestedCompetitions.unshift(
      "Enter the International Science and Engineering Fair (ISEF)",
      "Participate in the Science Olympiad or specific subject olympiads"
    );
    recommendations.suggestedSkills.unshift(
      "Learn laboratory techniques and safety procedures",
      "Develop skills in scientific writing and research methods"
    );
  }
  
  // If they're interested in arts
  if (activities.includes("art") || activities.includes("music") || activities.includes("theater") || activities.includes("writing")) {
    recommendations.suggestedProjects.push(
      "Create a portfolio of your creative work",
      "Organize a student art exhibition or performance"
    );
    recommendations.suggestedCompetitions.push(
      "Submit work to student art competitions or literary magazines",
      "Audition for prestigious summer arts programs"
    );
  }
  
  // If they're interested in leadership
  if (activities.includes("leadership") || activities.includes("student government") || activities.includes("club president")) {
    recommendations.suggestedProjects.push(
      "Organize a community service initiative or awareness campaign",
      "Start a new club at your school around an unaddressed interest"
    );
    recommendations.suggestedSkills.push(
      "Develop project management and delegation skills",
      "Practice public speaking and presentation techniques"
    );
  }
  
  return recommendations;
} 