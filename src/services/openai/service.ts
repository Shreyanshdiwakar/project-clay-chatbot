import { env } from '@/config/env';
import { 
  ChatCompletionRequest, 
  ChatCompletionResponse, 
  ApiErrorResponse,
  ModelResponse
} from './types';
import { EDUCATIONAL_CONSULTANT_PROMPT } from './system-prompt';

export function createSystemPrompt(pdfContent?: string | null, profileContext?: string | null): string {
  // Use the educational consultant prompt as the base system prompt
  let systemPrompt = EDUCATIONAL_CONSULTANT_PROMPT;

  if (profileContext) {
    systemPrompt += `\n\n**IMPORTANT - STUDENT PROFILE FROM QUESTIONNAIRE:**
    
${profileContext}

Use the above student profile information to provide personalized advice specifically tailored to this student's background, interests, and academic goals. Reference specific details from their profile when relevant.`;
  }

  if (pdfContent) {
    const maxPdfLength = 12000;
    const truncatedPdf = pdfContent.length > maxPdfLength
      ? pdfContent.substring(0, maxPdfLength) + "... [PDF content truncated]"
      : pdfContent;
  
    systemPrompt += `\n\n**IMPORTANT - STUDENT PROFILE FROM DOCUMENT:**
    
${truncatedPdf}

Use the above document information to provide personalized advice specifically tailored to this student's background, interests, and accomplishments. Reference specific details from their profile when relevant.`;
  }

  return systemPrompt;
}

// Mock response function for development when API key is missing
function getMockResponse(userMessage: string): ModelResponse {
  console.log('Using mock response for development');
  
  const responses = [
    "**Excellent Question!**\n\nBased on your interest in college applications, here are some recommended extracurricular activities:\n\n- **Leadership Positions**: Seek roles in student government or club leadership\n- **Community Service**: Volunteer consistently with organizations aligned to your interests\n- **Academic Competitions**: Participate in subject-specific competitions relevant to your intended major\n- **Personal Projects**: Develop independent initiatives that showcase your passions\n\nRemember, colleges value depth over breadth. It's better to be deeply involved in a few activities than superficially involved in many.\n\nWhat specific field or major are you considering?",
    
    "**Great to hear from you!**\n\nHere's my advice for planning your extracurricular activities:\n\n**Focus on Quality, Not Quantity**\n- Commit deeply to 2-4 activities that genuinely interest you\n- Seek leadership roles or increasing responsibility over time\n- Maintain consistent involvement throughout high school\n\n**Align Activities with Your Interests**\n- If you love science, join science clubs, competitions, or research opportunities\n- For humanities, consider debate, writing clubs, or community service\n- For arts, develop your portfolio through continuous practice and exhibition\n\nWould you like more specific recommendations based on your particular interests?",
    
    "**Thanks for reaching out!**\n\nWhen planning extracurricular activities for college applications, consider these key strategies:\n\n1. **Demonstrate passion** through sustained commitment to activities related to your intended field of study\n2. **Show initiative** by creating new programs or expanding existing ones\n3. **Develop transferable skills** like leadership, teamwork, and problem-solving\n\n**Examples of Strong Activities:**\n- Starting a club related to your interests\n- Conducting an independent research project\n- Creating a community service initiative addressing a local need\n- Participating in selective summer programs in your field\n\nWhat grade are you in currently? This will help me provide more tailored advice."
  ];
  
  // Use the message content to pseudo-randomly select a response
  const messageHash = userMessage.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const responseIndex = messageHash % responses.length;
  
  return {
    success: true,
    content: responses[responseIndex]
  };
}

export async function callOpenAIAPI(
  model: string, 
  userMessage: string, 
  pdfContent?: string | null,
  profileContext?: string | null
): Promise<ModelResponse> {
  try {
    console.log(`Sending request to OpenAI API using ${model}...`);
    
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      console.log('API key not configured - using mock response for development');
      return getMockResponse(userMessage);
    }
    
    console.log(`API key length: ${apiKey.length}, prefix: ${apiKey.substring(0, 3)}, suffix: ${apiKey.substring(apiKey.length - 3)}`);
    
    const systemPrompt = createSystemPrompt(pdfContent, profileContext);

    const requestBody: ChatCompletionRequest = {
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.7
    };
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    
    console.log('OpenAI request headers:', JSON.stringify({
      ...headers,
      'Authorization': 'Bearer ***'
    }));
    
    console.log('OpenAI request body:', JSON.stringify({
      ...requestBody,
      messages: [
        { role: 'system', content: '(system prompt, truncated for logs)' },
        { role: 'user', content: userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : '') }
      ]
    }, null, 2));
    
    const response = await fetch(env.OPENAI_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      let errorText: string;
      try {
        const errorJson = await response.json() as ApiErrorResponse;
        errorText = errorJson.error?.message || `Error ${response.status}: ${response.statusText}`;
      } catch {
        errorText = await response.text();
      }
      
      console.error(`OpenAI API error (${response.status}):`, errorText);
      return {
        success: false,
        error: `OpenAI API returned status ${response.status}: ${errorText.substring(0, 200)}${errorText.length > 200 ? '...' : ''}`
      };
    }
    
    const responseData = await response.json() as ChatCompletionResponse;
    console.log('OpenAI API response:', JSON.stringify(responseData, null, 2));
    
    if (!responseData.choices || responseData.choices.length === 0 || !responseData.choices[0].message) {
      console.error('OpenAI API returned an invalid response structure:', responseData);
      return {
        success: false,
        error: 'The API response format was invalid or empty.'
      };
    }
    
    const content = responseData.choices[0].message.content.trim();
    
    if (!content) {
      console.error('OpenAI API returned an empty message content');
      return {
        success: false,
        error: 'The API returned an empty message.'
      };
    }
    
    return {
      success: true,
      content
    };
  } catch (error) {
    console.error(`Error while using model ${model}:`, error);
    return {
      success: false,
      error: `API call failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export async function getModelResponse(
  userMessage: string, 
  pdfContent?: string | null,
  profileContext?: string | null
): Promise<ModelResponse> {
  // For development without API key, use mock response
  if (env.NODE_ENV === 'development' && (!env.OPENAI_API_KEY || env.OPENAI_API_KEY.length < 10)) {
    return getMockResponse(userMessage);
  }

  let response = await callOpenAIAPI(env.PRIMARY_MODEL, userMessage, pdfContent, profileContext);
  
  if (!response.success && response.error) {
    console.log(`Primary model (${env.PRIMARY_MODEL}) failed with error: ${response.error}. Trying fallback model...`);
    response = await callOpenAIAPI(env.FALLBACK_MODEL, userMessage, pdfContent, profileContext);
  }
  
  return response;
} 