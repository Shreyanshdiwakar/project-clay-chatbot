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

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Primary and fallback models
const PRIMARY_MODEL = 'deepseek/deepseek-chat';
const FALLBACK_MODEL = 'openai/gpt-3.5-turbo';

// Model info type
type ModelInfo = {
  name: string;
  description: string;
  features: string[];
  developer: string;
  parameters: string;
};

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

export async function POST(request: Request) {
  try {
    console.log('Received chat request');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { message } = body;

    if (!message) {
      console.error('Error: Message is required');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get API key and validate
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    console.log('API key present:', openrouterApiKey ? 'Yes' : 'No');
    
    if (!openrouterApiKey) {
      console.error('Error: OpenRouter API key is not configured');
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your .env.local file.' },
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
    const thinkingSteps = generateThinkingSteps(message);

    // Try with primary model first
    let botResponse = await tryWithModel(PRIMARY_MODEL, message, openrouterApiKey);
    let modelUsed = PRIMARY_MODEL;
    
    // If primary model fails, try with fallback model
    if (!botResponse.success && botResponse.error) {
      console.log(`Primary model (${PRIMARY_MODEL}) failed with error: ${botResponse.error}. Trying fallback model...`);
      botResponse = await tryWithModel(FALLBACK_MODEL, message, openrouterApiKey);
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
      message: botResponse.content,
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

// Generate simulated thinking steps based on the user's message
function generateThinkingSteps(message: string): string[] {
  const lowerCaseMessage = message.toLowerCase();
  let steps: string[] = [
    "Processing the user's question about extracurricular activities",
    "Accessing my knowledge about college applications and extracurricular activities",
    "Considering the most helpful and tailored response"
  ];

  // Add more specific thinking steps based on message content
  if (lowerCaseMessage.includes('sport') || lowerCaseMessage.includes('athletic')) {
    steps.push("Retrieving information about sports and athletic extracurricular activities");
    steps.push("Considering both team and individual sports options");
    steps.push("Evaluating how sports demonstrate leadership and teamwork skills to colleges");
  }

  if (lowerCaseMessage.includes('leadership') || lowerCaseMessage.includes('president') || lowerCaseMessage.includes('club')) {
    steps.push("Analyzing leadership opportunities in student organizations");
    steps.push("Evaluating how leadership positions demonstrate initiative and responsibility");
    steps.push("Considering both starting new clubs and joining existing organizations");
  }

  if (lowerCaseMessage.includes('volunteer') || lowerCaseMessage.includes('community') || lowerCaseMessage.includes('service')) {
    steps.push("Analyzing community service and volunteer opportunities");
    steps.push("Evaluating how volunteer work demonstrates social responsibility and empathy");
    steps.push("Considering both local and global volunteer opportunities");
  }

  if (lowerCaseMessage.includes('research') || lowerCaseMessage.includes('science') || lowerCaseMessage.includes('lab')) {
    steps.push("Evaluating research and academic opportunities outside the classroom");
    steps.push("Considering university programs, science competitions, and independent projects");
    steps.push("Analyzing how research experience demonstrates intellectual curiosity and initiative");
  }

  if (lowerCaseMessage.includes('art') || lowerCaseMessage.includes('music') || lowerCaseMessage.includes('creative')) {
    steps.push("Retrieving information about artistic and creative extracurricular activities");
    steps.push("Analyzing opportunities in visual arts, music, theater, writing, and other creative fields");
    steps.push("Evaluating how artistic pursuits demonstrate creativity and dedication");
  }

  if (lowerCaseMessage.includes('internship') || lowerCaseMessage.includes('job') || lowerCaseMessage.includes('work')) {
    steps.push("Considering work experience and internship opportunities");
    steps.push("Analyzing how work experience demonstrates responsibility and real-world skills");
    steps.push("Evaluating both paid and unpaid professional development opportunities");
  }

  // Add some final steps
  steps.push("Formulating a personalized response based on the student's interests");
  steps.push("Structuring my answer to be helpful, informative, and actionable");
  steps.push("Finalizing response with specific suggestions and follow-up questions");

  return steps;
}

async function tryWithModel(model: string, message: string, apiKey: string) {
  try {
    console.log(`Sending request to OpenRouter API using ${model}...`);
    
    // Log API key length and first/last 3 chars for debugging (safely)
    console.log(`API key length: ${apiKey.length}, prefix: ${apiKey.substring(0, 3)}, suffix: ${apiKey.substring(apiKey.length - 3)}`);
    
    const requestBody = {
      model: model,
      messages: [
        {
          role: 'system',
          content: `You are a friendly academic counselor helping high school students plan extracurricular activities to improve their college applications. Ask follow-up questions if needed.

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
3. Third step`
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
    console.log('OpenRouter request body:', JSON.stringify(requestBody));
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    console.log(`${model} API response status:`, response.status);
    console.log(`${model} API response headers:`, Object.fromEntries(response.headers.entries()));
    console.log(`${model} API full response:`, JSON.stringify(data));
    
    if (!response.ok) {
      console.error(`${model} API error:`, JSON.stringify(data));
      
      // Special case for authentication errors
      if (response.status === 401 || (data?.error?.code === 401)) {
        return { 
          success: false, 
          error: 'Authentication failed: Please check that your OpenRouter API key is valid and not expired.' 
        };
      }
      
      // Handle model not available error
      if (data?.error?.message?.includes('not available') || 
          data?.error?.message?.toLowerCase().includes('model')) {
        return {
          success: false,
          error: `Model ${model} is not available: ${data?.error?.message || 'Try using a different model'}`
        };
      }
      
      return { 
        success: false, 
        error: `${model} API error: ${JSON.stringify(data)}` 
      };
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error(`${model} unexpected response format:`, JSON.stringify(data));
      return { 
        success: false, 
        error: `${model} unexpected response format: ${JSON.stringify(data)}` 
      };
    }

    const content = data.choices[0].message.content || 'Sorry, I could not generate a response.';
    console.log(`${model} response:`, content.substring(0, 50) + '...');
    
    return { success: true, content };
  } catch (error) {
    console.error(`Error with ${model}:`, error);
    return { 
      success: false, 
      error: `Error with ${model}: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
} 