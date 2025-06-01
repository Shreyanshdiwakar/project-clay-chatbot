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
import { toast } from 'sonner';

// Memory usage management
const activeSessions: Map<string, {
  lastActive: number;
  messagesCount: number;
}> = new Map();

// Clean up sessions older than 30 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const MAX_MESSAGES_PER_SESSION = 100;

// Memory cleanup function
function cleanupInactiveSessions() {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastActive > SESSION_TIMEOUT) {
      activeSessions.delete(sessionId);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} inactive chat sessions`);
  }
  
  // Schedule the next cleanup
  setTimeout(cleanupInactiveSessions, 5 * 60 * 1000); // Run every 5 minutes
}

// Start the cleanup process
cleanupInactiveSessions();

/**
 * POST handler for chat API
 */
export async function POST(request: Request): Promise<NextResponse<ChatResponse | ApiErrorResponse>> {
  const sessionId = Math.random().toString(36).substring(2, 15);
  const startTime = Date.now();
  
  try {
    console.log('Received chat request');
    
    // Parse and validate the request body
    const body = await request.json() as ChatRequest;
    console.log('Request body:', body);
    
    const { message, pdfContent, profileContext, isWebSearch } = body;

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
    
    // Track this session
    activeSessions.set(sessionId, {
      lastActive: Date.now(),
      messagesCount: 1
    });

    // Generate thinking steps for the response
    const thinkingSteps = generateThinkingSteps(message, pdfContent, profileContext);

    // Get model response with web search if requested
    const useWebSearch = isWebSearch === true;
    console.log(`Processing request with web search: ${useWebSearch ? 'enabled' : 'disabled'}`);
    
    // Define test query for web search verification
    const isTestMode = message === "TEST_WEB_SEARCH";
    let testQuery = null;
    
    if (isTestMode) {
      testQuery = "What are the current top universities for computer science in 2024?";
      console.log("=== RUNNING WEB SEARCH TEST ===");
      console.log(`Test query: "${testQuery}"`);
    }
    
    // Use test query if in test mode, otherwise use the user's message
    const queryToUse = isTestMode ? testQuery : message;
    
    // Add timeout for the API request
    let timeoutId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<ModelResponse>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Request timed out after 60 seconds. Your query may be too complex."));
      }, 60000); // 60 second timeout
    });
    
    // Create the actual model response promise
    const responsePromise = getModelResponse(queryToUse, pdfContent, profileContext, useWebSearch);
    
    // Race the timeout against the actual request
    const modelResponse = await Promise.race([responsePromise, timeoutPromise])
      .finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      });
    
    // Log detailed response for test mode
    if (isTestMode) {
      console.log('Web search test results:', {
        success: modelResponse.success,
        webSearchAttempted: modelResponse.webSearchAttempted,
        hasContent: !!modelResponse.content,
        contentLength: modelResponse.content?.length || 0,
        webSearchResults: modelResponse.webSearchResults?.length || 0,
        toolCallsMade: modelResponse.toolCallsMade,
        model: modelResponse.model
      });
      console.log("=== WEB SEARCH TEST COMPLETE ===");
    }
    
    // Handle unsuccessful response
    if (!modelResponse.success) {
      console.error('Model response failed:', modelResponse.error);
      
      // Check if it's a timeout error
      if (modelResponse.isTimeout) {
        return NextResponse.json(
          { 
            error: 'Your query timed out. Please try a simpler question or disable web search for faster responses.',
            isTimeout: true 
          },
          { status: 408 }
        );
      }
      
      return NextResponse.json(
        { error: modelResponse.error || 'Failed to generate response' },
        { status: 500 }
      );
    }
    
    // Determine which model was used
    // In a real implementation, this should come from the response
    const modelId = env.PRIMARY_MODEL;
    const modelInfo = MODEL_INFO[modelId];
    
    // Update the session's active status and message count
    const session = activeSessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      session.messagesCount++;
      
      // If this session has too many messages, log a warning
      if (session.messagesCount > MAX_MESSAGES_PER_SESSION) {
        console.warn(`Session ${sessionId} has exceeded ${MAX_MESSAGES_PER_SESSION} messages, consider cleanup`);
      }
    }
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    console.log(`Request completed in ${responseTime}ms`);
    
    // Return successful response
    // Prepare response object
    const response: ChatResponse = {
      message: modelResponse.content!,
      model: {
        ...modelInfo
      },
      thinking: thinkingSteps
    };
    
    // Add web search results if available
    if (useWebSearch) {
      response.webSearchAttempted = modelResponse.webSearchAttempted;
      if (modelResponse.webSearchResults && modelResponse.webSearchResults.length > 0) {
        response.webSearchResults = modelResponse.webSearchResults;
      }
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    
    // Remove this session from tracking on error
    activeSessions.delete(sessionId);
    
    // Determine if it's a timeout error
    const isTimeoutError = error instanceof Error && 
      (error.name === 'AbortError' || error.message.includes('timeout'));
    
    if (isTimeoutError) {
      return NextResponse.json(
        { 
          error: 'Request timed out. Please try a simpler question or disable web search for faster responses.',
          isTimeout: true 
        },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}