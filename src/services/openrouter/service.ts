import { env } from '@/config/env';
import { 
  ChatCompletionRequest, 
  ChatCompletionResponse, 
  ApiErrorResponse,
  ModelResponse
} from './types';

export function createSystemPrompt(pdfContent?: string | null): string {
  let systemPrompt = `You are a friendly academic counselor helping high school students plan extracurricular activities to improve their college applications. Ask follow-up questions if needed.

Format your responses with clean, readable Markdown:
- Use **bold text** for section headings and important points
- Use proper bullet points with - for lists
- Use numbered lists with 1. 2. 3. for sequential steps
- Structure your response with clear sections and spacing
- Do not use hashtags or markdown headers with # symbols
- Keep your formatting consistent and professional

Example formatting structure:
**Section Title**
- First bullet point
- Second bullet point with **emphasized** text
- Third bullet point

**Another Section**
1. First step
2. Second step
3. Third step`;

  if (pdfContent) {
    const maxPdfLength = 12000;
    const truncatedPdf = pdfContent.length > maxPdfLength
      ? pdfContent.substring(0, maxPdfLength) + "... [PDF content truncated]"
      : pdfContent;
  
    systemPrompt += `\n\n**IMPORTANT - STUDENT PROFILE FROM COMMON APP PDF:**
    
${truncatedPdf}

Use the above Common App information to provide personalized advice specifically tailored to this student's background, interests, and accomplishments. Reference specific details from their profile when relevant.`;
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

export async function callOpenRouterAPI(
  model: string, 
  userMessage: string, 
  pdfContent?: string | null
): Promise<ModelResponse> {
  try {
    console.log(`Sending request to OpenRouter API using ${model}...`);
    
    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      console.log('API key not configured - using mock response for development');
      return getMockResponse(userMessage);
    }
    
    console.log(`API key length: ${apiKey.length}, prefix: ${apiKey.substring(0, 3)}, suffix: ${apiKey.substring(apiKey.length - 3)}`);
    
    const systemPrompt = createSystemPrompt(pdfContent);

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
      max_tokens: 1000,
      temperature: 0.7
    };
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://openrouter.ai/',
      'OpenRouter-Completions-Version': '2023-12-01'
    };
    
    console.log('OpenRouter request headers:', JSON.stringify({
      ...headers,
      'Authorization': 'Bearer ***'
    }));
    
    console.log('OpenRouter request body:', JSON.stringify({
      ...requestBody,
      messages: [
        { role: 'system', content: '(system prompt, truncated for logs)' },
        { role: 'user', content: userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : '') }
      ]
    }, null, 2));
    
    const response = await fetch(env.OPENROUTER_API_URL, {
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
      
      console.error(`OpenRouter API error (${response.status}):`, errorText);
      return {
        success: false,
        error: `OpenRouter API returned status ${response.status}: ${errorText.substring(0, 200)}${errorText.length > 200 ? '...' : ''}`
      };
    }
    
    const responseData = await response.json() as ChatCompletionResponse;
    console.log('OpenRouter API response:', JSON.stringify(responseData, null, 2));
    
    if (!responseData.choices || responseData.choices.length === 0 || !responseData.choices[0].message) {
      console.error('OpenRouter API returned an invalid response structure:', responseData);
      return {
        success: false,
        error: 'The API response format was invalid or empty.'
      };
    }
    
    const content = responseData.choices[0].message.content.trim();
    
    if (!content) {
      console.error('OpenRouter API returned an empty message content');
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
  pdfContent?: string | null
): Promise<ModelResponse> {
  // For development without API key, use mock response
  if (process.env.NODE_ENV === 'development' && (!env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY.length < 10)) {
    return getMockResponse(userMessage);
  }

  let response = await callOpenRouterAPI(env.PRIMARY_MODEL, userMessage, pdfContent);
  
  if (!response.success && response.error) {
    console.log(`Primary model (${env.PRIMARY_MODEL}) failed with error: ${response.error}. Trying fallback model...`);
    response = await callOpenRouterAPI(env.FALLBACK_MODEL, userMessage, pdfContent);
  }
  
  return response;
}