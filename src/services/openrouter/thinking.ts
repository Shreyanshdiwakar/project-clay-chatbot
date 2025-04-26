/**
 * Thinking Steps Generator
 * 
 * Generates thinking steps for the chatbot to display while waiting for API response.
 * Uses a mapping approach instead of if/else chains for better performance and maintainability.
 */

// Map of keywords to thinking steps
const THINKING_STEP_MAP: Record<string, string> = {
  // Sports and athletics
  'sport': 'Finding sports and athletic activities',
  'athletic': 'Finding sports and athletic activities',
  'team': 'Identifying team-based opportunities',
  
  // Leadership
  'leadership': 'Identifying leadership opportunities',
  'president': 'Identifying leadership opportunities',
  'club': 'Identifying leadership opportunities',
  'lead': 'Exploring leadership pathways',
  
  // Community service
  'volunteer': 'Exploring community service options',
  'community': 'Exploring community service options',
  'service': 'Exploring community service options',
  'help': 'Finding ways to contribute to communities',
  
  // Research and academics
  'research': 'Exploring research opportunities',
  'science': 'Exploring research opportunities',
  'lab': 'Exploring research opportunities',
  'study': 'Finding academic enrichment opportunities',
  'academic': 'Finding academic enrichment opportunities',
  
  // Arts and creativity
  'art': 'Finding artistic and creative activities',
  'music': 'Finding artistic and creative activities',
  'creative': 'Finding artistic and creative activities',
  'perform': 'Exploring performing arts opportunities',
  'design': 'Finding design-related activities',
  
  // Career and internships
  'internship': 'Researching internship opportunities',
  'job': 'Researching internship opportunities',
  'work': 'Researching internship opportunities',
  'career': 'Exploring career preparation activities',
  'professional': 'Finding professional development opportunities',
  
  // College-specific
  'college': 'Analyzing college requirements',
  'admission': 'Reviewing admission strategies',
  'application': 'Optimizing application strategy',
  'essay': 'Finding experiences for compelling essays',
};

/**
 * Generate thinking steps based on message content
 */
export function generateThinkingSteps(message: string, pdfContent?: string | null): string[] {
  // Convert message to lowercase for case-insensitive matching
  const lowerCaseMessage = message.toLowerCase();
  
  // Start with a default initial step
  const steps: string[] = [
    "Processing your question..."
  ];

  // Add PDF-specific step if PDF content is provided
  if (pdfContent) {
    steps.push("Analyzing your profile data");
  }

  // Check for keyword matches in the message
  const matchedKeywords = Object.keys(THINKING_STEP_MAP).filter(keyword => 
    lowerCaseMessage.includes(keyword)
  );

  // If we have keyword matches, add the corresponding step (without duplicates)
  if (matchedKeywords.length > 0) {
    const uniqueSteps = new Set<string>();
    
    matchedKeywords.forEach(keyword => {
      uniqueSteps.add(THINKING_STEP_MAP[keyword]);
    });
    
    // Add unique steps to our steps array
    steps.push(...uniqueSteps);
  } else {
    // Default step if no keywords match
    steps.push("Preparing personalized recommendations");
  }

  // Always end with a final step
  steps.push("Generating your response");

  return steps;
} 