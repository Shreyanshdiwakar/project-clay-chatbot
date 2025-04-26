/**
 * OpenRouter API Service
 * 
 * Handles communication with the OpenRouter API
 */

import { env } from '@/config/env';
import { 
  ChatCompletionRequest, 
  ChatCompletionResponse, 
  ApiErrorResponse,
  ModelResponse
} from './types';

/**
 * Creates system prompt for the chat API
 */
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

  // If PDF content is available, add it to the system prompt
  if (pdfContent) {
    // Truncate PDF content if it's too long (to fit within token limits)
    const maxPdfLength = 12000; // Arbitrary limit to avoid token issues
    const truncatedPdf = pdfContent.length > maxPdfLength
      ? pdfContent.substring(0, maxPdfLength) + "... [PDF content truncated]"
      : pdfContent;
  
    systemPrompt += `\n\n**IMPORTANT - STUDENT PROFILE FROM COMMON APP PDF:**
    
${truncatedPdf}

Use the above Common App information to provide personalized advice specifically tailored to this student's background, interests, and accomplishments. Reference specific details from their profile when relevant.`;
  }

  return systemPrompt;
}

/**
 * Makes a request to the OpenRouter API
 */
export async function callOpenRouterAPI(
  model: string, 
  userMessage: string, 
  pdfContent?: string | null
): Promise<ModelResponse> {
  try {
    console.log(`Sending request to OpenRouter API using ${model}...`);
    
    const apiKey = env.OPENROUTER_API_KEY;
    // Safely log info about the API key without exposing it
    if (apiKey) {
      console.log(`API key length: ${apiKey.length}, prefix: ${apiKey.substring(0, 3)}, suffix: ${apiKey.substring(apiKey.length - 3)}`);
    } else {
      console.log('API key not configured');
      return {
        success: false,
        error: 'OpenRouter API key is not configured'
      };
    }
    
    // Create system prompt
    const systemPrompt = createSystemPrompt(pdfContent);

    // Create request body
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
    
    // Set up request headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://openrouter.ai/',
      'OpenRouter-Completions-Version': '2023-12-01'
    };
    
    // Log the request (with sensitive data redacted)
    console.log('OpenRouter request headers:', JSON.stringify({
      ...headers,
      'Authorization': 'Bearer ***' // Mask the actual token in logs
    }));
    
    console.log('OpenRouter request body:', JSON.stringify({
      ...requestBody,
      messages: [
        { role: 'system', content: '(system prompt, truncated for logs)' },
        { role: 'user', content: userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : '') }
      ]
    }, null, 2));
    
    // Make the API call
    const response = await fetch(env.OPENROUTER_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    
    // Handle HTTP errors
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
    
    // Parse successful response
    const responseData = await response.json() as ChatCompletionResponse;
    console.log('OpenRouter API response:', JSON.stringify(responseData, null, 2));
    
    // Validate response structure
    if (!responseData.choices || responseData.choices.length === 0 || !responseData.choices[0].message) {
      console.error('OpenRouter API returned an invalid response structure:', responseData);
      return {
        success: false,
        error: 'The API response format was invalid or empty.'
      };
    }
    
    // Extract content
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

/**
 * Try calling the API with a specific model, falling back if needed
 */
export async function getModelResponse(
  userMessage: string, 
  pdfContent?: string | null
): Promise<ModelResponse> {
  // Try with primary model first
  let response = await callOpenRouterAPI(env.PRIMARY_MODEL, userMessage, pdfContent);
  
  // If primary model fails, try with fallback model
  if (!response.success && response.error) {
    console.log(`Primary model (${env.PRIMARY_MODEL}) failed with error: ${response.error}. Trying fallback model...`);
    response = await callOpenRouterAPI(env.FALLBACK_MODEL, userMessage, pdfContent);
  }
  
  return response;
} 