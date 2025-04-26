/**
 * Chat API endpoint for ProjectClay chatbot
 * 
 * This endpoint uses the OpenRouter API to connect to language models.
 * 
 * It follows best practices for API route implementation:
 * - Proper TypeScript typing
 * - Error handling
 * - Input validation
 * - Separation of concerns with services
 */

import { NextResponse } from 'next/server';
import { ChatRequest, ChatResponse, ApiErrorResponse } from '@/types/api';
import { isApiKeyConfigured, getEnvDiagnostics, env } from '@/config/env';
import { getModelResponse, generateThinkingSteps, MODEL_INFO } from '@/services/openrouter';

/**
 * POST handler for chat API
 */
export async function POST(request: Request): Promise<NextResponse<ChatResponse | ApiErrorResponse>> {
  try {
    console.log('Received chat request');
    
    // Parse and validate the request body
    const body = await request.json() as ChatRequest;
    console.log('Request body:', body);
    
    const { message, pdfContent } = body;

    // Validate required fields
    if (!message) {
      console.error('Error: Message is required');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check API key configuration
    if (!isApiKeyConfigured()) {
      console.error('Error: OpenRouter API key is not configured');
      return NextResponse.json(
        { 
          error: 'OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your environment variables.',
          ...getEnvDiagnostics()
        },
        { status: 500 }
      );
    }

    // Generate thinking steps for the response
    const thinkingSteps = generateThinkingSteps(message, pdfContent);

    // Get model response
    const modelResponse = await getModelResponse(message, pdfContent);
    
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