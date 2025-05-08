/**
 * Chat API endpoint for ProjectClay chatbot
 * 
 * This endpoint uses the OpenAI API to connect to language models.
 * 
 * It follows best practices for API route implementation:
 * - Proper TypeScript typing
 * - Error handling
 * - Input validation
 * - Separation of concerns with services
 */

// Updated for Next.js 15+
import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { ChatRequest, ChatResponse, ApiErrorResponse } from '@/types/api';
import { isApiKeyConfigured, getEnvDiagnostics, env } from '@/config/env';
import { getModelResponse, generateThinkingSteps, MODEL_INFO } from '@/services/openai';

/**
 * POST handler for chat API
 */
export async function POST(request: Request): Promise<NextResponse<ChatResponse | ApiErrorResponse>> {
  try {
    console.log('Received chat request');
    
    // Parse and validate the request body
    const body = await request.json() as ChatRequest;
    console.log('Request body:', body);
    
    const { message, pdfContent, profileContext } = body;

    // Validate required fields
    if (!message) {
      console.error('Error: Message is required');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check API key configuration - in development mode, we'll continue even without an API key
    if (!isApiKeyConfigured() && env.NODE_ENV !== 'development') {
      console.error('Error: OpenAI API key is not configured');
      return NextResponse.json(
        { 
          error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.',
          ...getEnvDiagnostics()
        },
        { status: 500 }
      );
    }

    // Generate thinking steps for the response
    const thinkingSteps = generateThinkingSteps(message, pdfContent, profileContext);

    // Get model response
    const modelResponse = await getModelResponse(message, pdfContent, profileContext);
    
    // Handle unsuccessful response
    if (!modelResponse.success) {
      console.error('Model response failed:', modelResponse.error);
      return NextResponse.json(
        { error: modelResponse.error || 'Failed to generate response' },
        { status: 500 }
      );
    }
    
    // Determine which model was used
    // In a real implementation, this should come from the response
    const modelId = env.PRIMARY_MODEL;
    const modelInfo = MODEL_INFO[modelId];
    
    // Return successful response
    return NextResponse.json({
      message: modelResponse.content!,
      model: {
        ...modelInfo
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