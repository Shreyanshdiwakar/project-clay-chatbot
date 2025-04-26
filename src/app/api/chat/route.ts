/**
 * Chat API endpoint for ProjectClay chatbot
 * 
 * This endpoint uses DeepSeek r1 model from OpenRouter API
 * 
 * To use this endpoint, you need to set the OPENROUTER_API_KEY environment variable
 * Create a .env.local file in the root directory with:
 * 
 * ```
 * OPENROUTER_API_KEY=your_openrouter_api_key_here
 * ```
 * 
 * Sign up at https://openrouter.ai to get your API key
 */

import { NextResponse } from 'next/server';

const OPENROUTER_API_URL: string = 'https://openrouter.ai/api/v1/chat/completions';

// Primary and fallback models
const PRIMARY_MODEL: string = 'deepseek/deepseek-chat';
const FALLBACK_MODEL: string = 'openai/gpt-3.5-turbo';

// Model info type
type ModelInfo = {
  name: string;
  description: string;
  features: string[];
  developer: string;
  parameters: string;
};

// Request and response types
interface ChatRequest {
  message: string;
  pdfContent?: string | null;
}

interface ChatResponse {
  message: string;
  model: ModelInfo & { id: string };
  thinking: string[];
}

interface ModelResponse {
  success: boolean;
  content?: string;
  error?: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Model information for UI display
const MODEL_INFO: Record<string, ModelInfo> = {
  [PRIMARY_MODEL]: {
    name: 'DeepSeek Chat',
    description: 'A powerful large language model with strong reasoning capabilities',
    features: ['Reasoning', 'Planning', 'Advising', 'Problem-solving'],
    developer: 'DeepSeek',
    parameters: '7 billion'
  },
  [FALLBACK_MODEL]: {
    name: 'GPT-3.5 Turbo',
    description: 'A versatile language model with good general knowledge',
    features: ['Conversation', 'Content generation', 'Information retrieval'],
    developer: 'OpenAI',
    parameters: '13 billion'
  }
};

export async function POST(request: Request): Promise<NextResponse<ChatResponse | { error: string }>> {
  try {
    console.log('Received chat request');
    
    const body = await request.json() as ChatRequest;
    console.log('Request body:', body);
    
    const { message, pdfContent } = body;

    if (!message) {
      console.error('Error: Message is required');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get API key and validate - with better error handling for Vercel
    // We check multiple environment variables to ensure the API key is available 
    // in different environments (local development, production, Vercel)
    const openrouterApiKey = 
      process.env.OPENROUTER_API_KEY || 
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || 
      process.env.VERCEL_OPENROUTER_API_KEY;

    console.log('API key present:', openrouterApiKey ? 'Yes' : 'No');
    
    if (!openrouterApiKey) {
      console.error('Error: OpenRouter API key is not configured');
      return NextResponse.json(
        { 
          error: 'OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your environment variables.',
          environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
          deployed: !!process.env.VERCEL
        },
        { status: 500 }
      );
    }
    
    // Check if API key looks like a valid token (basic check)
    if (openrouterApiKey === 'your_openrouter_api_key_here' || openrouterApiKey.length < 10) {
      console.error('Error: OpenRouter API key appears to be invalid or placeholder');
      return NextResponse.json(
        { error: 'The OpenRouter API key appears to be invalid. Please replace the placeholder with your actual API key.' },
        { status: 500 }
      );
    }

    // Generate thinking steps for the response - these are simulated as the API doesn't provide them
    const thinkingSteps = generateThinkingSteps(message, pdfContent);

    // Try with primary model first
    let botResponse = await tryWithModel(PRIMARY_MODEL, message, openrouterApiKey, pdfContent);
    let modelUsed = PRIMARY_MODEL;
    
    // If primary model fails, try with fallback model
    if (!botResponse.success && botResponse.error) {
      console.log(`Primary model (${PRIMARY_MODEL}) failed with error: ${botResponse.error}. Trying fallback model...`);
      botResponse = await tryWithModel(FALLBACK_MODEL, message, openrouterApiKey, pdfContent);
      if (botResponse.success) {
        modelUsed = FALLBACK_MODEL;
      }
    }
    
    if (!botResponse.success) {
      console.error('Both primary and fallback models failed:', botResponse.error);
      return NextResponse.json(
        { error: botResponse.error || 'Failed to generate response with both models' },
        { status: 500 }
      );
    }
    
    // Return response with model information and thinking steps
    return NextResponse.json({
      message: botResponse.content!,
      model: {
        id: modelUsed,
        ...MODEL_INFO[modelUsed]
      },
      thinking: thinkingSteps
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// Generate simpler thinking steps based on the user's message
function generateThinkingSteps(message: string, pdfContent?: string | null): string[] {
  const lowerCaseMessage = message.toLowerCase();
  // Generate a smaller set of steps that appear quicker
  const steps: string[] = [
    "Processing your question..."
  ];

  // Add PDF-specific thinking steps - but keep it brief
  if (pdfContent) {
    steps.push("Analyzing your profile data");
  }

  // Add just one specific step based on message content
  if (lowerCaseMessage.includes('sport') || lowerCaseMessage.includes('athletic')) {
    steps.push("Finding sports and athletic activities");
  } else if (lowerCaseMessage.includes('leadership') || lowerCaseMessage.includes('president') || lowerCaseMessage.includes('club')) {
    steps.push("Identifying leadership opportunities");
  } else if (lowerCaseMessage.includes('volunteer') || lowerCaseMessage.includes('community') || lowerCaseMessage.includes('service')) {
    steps.push("Exploring community service options");
  } else if (lowerCaseMessage.includes('research') || lowerCaseMessage.includes('science') || lowerCaseMessage.includes('lab')) {
    steps.push("Exploring research opportunities");
  } else if (lowerCaseMessage.includes('art') || lowerCaseMessage.includes('music') || lowerCaseMessage.includes('creative')) {
    steps.push("Finding artistic and creative activities");
  } else if (lowerCaseMessage.includes('internship') || lowerCaseMessage.includes('job') || lowerCaseMessage.includes('work')) {
    steps.push("Researching internship opportunities");
  } else {
    steps.push("Preparing personalized recommendations");
  }

  // One final step
  steps.push("Generating your response");

  return steps;
}

async function tryWithModel(model: string, message: string, apiKey: string, pdfContent?: string | null): Promise<ModelResponse> {
  try {
    console.log(`Sending request to OpenRouter API using ${model}...`);
    
    // Log API key length and first/last 3 chars for debugging (safely)
    console.log(`API key length: ${apiKey.length}, prefix: ${apiKey.substring(0, 3)}, suffix: ${apiKey.substring(apiKey.length - 3)}`);
    
    // Create system prompt, adding PDF content if available
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

    const requestBody = {
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      // Add these extra parameters to ensure we get a good response
      max_tokens: 1000,
      temperature: 0.7
    };
    
    // Log the request headers and body
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://openrouter.ai/',  // Updated to official referrer
      'OpenRouter-Completions-Version': '2023-12-01'
    };
    
    console.log('OpenRouter request headers:', JSON.stringify({
      ...headers,
      'Authorization': 'Bearer ***' // Mask the actual token in logs
    }));
    console.log('OpenRouter request body:', JSON.stringify({
      ...requestBody,
      messages: [
        { role: 'system', content: '(system prompt, truncated for logs)' },
        { role: 'user', content: message.substring(0, 100) + (message.length > 100 ? '...' : '') }
      ]
    }, null, 2));
    
    // Make the API call to OpenRouter
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    
    // Process API response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error (${response.status}):`, errorText);
      return {
        success: false,
        error: `OpenRouter API returned status ${response.status}: ${errorText.substring(0, 200)}${errorText.length > 200 ? '...' : ''}`
      };
    }
    
    const responseData = await response.json() as OpenRouterResponse;
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