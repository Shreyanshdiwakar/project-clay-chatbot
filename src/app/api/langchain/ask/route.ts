/**
 * LangChain Ask API
 * 
 * This endpoint handles question answering using the LangChain retrieval chain.
 * It accepts a question and returns an answer based on the documents in the vector store.
 * It can also optionally search the web for information not found in the vector store.
 */

// Updated for Next.js 15+
import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { askQuestion } from '@/services/langchain/retrievalChain';
import { env } from '@/config/env';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Request must be application/json' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { 
      question, 
      collection = 'default', 
      modelName = env.PRIMARY_MODEL || 'gpt-3.5-turbo',
      tavily_api_key,
      web_search = true
    } = body;
    
    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question is required in request body' },
        { status: 400 }
      );
    }
    
    console.log(`Processing question: "${question}" using collection: ${collection}, web search: ${web_search}`);
    
    const apiKeys = {
      openaiApiKey: env.OPENAI_API_KEY,
      tavilyApiKey: tavily_api_key
    };
    
    try {
      // First attempt with web search if enabled
      const response = await askQuestion(question, collection, apiKeys, modelName, web_search);
      
      // If successful or if web_search was disabled, return the response
      return NextResponse.json(response);
    } catch (error) {
      // If the error is related to web search, try again without web search
      if (web_search && error instanceof Error && error.message.includes("web search")) {
        console.log("Web search failed, retrying without web search...");
        try {
          const fallbackResponse = await askQuestion(question, collection, apiKeys, modelName, false);
          return NextResponse.json({
            ...fallbackResponse,
            note: "Web search was attempted but failed. Falling back to local knowledge base only."
          });
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      
      // If not a web search error or fallback also failed, rethrow
      throw error;
    }
  } catch (error) {
    console.error('Question answering error:', error);
    
    // Determine error type for better error messaging
    let statusCode = 500;
    let errorMessage = error instanceof Error ? error.message : String(error);
    
    // Handle specific error cases
    if (errorMessage.includes("API key")) {
      statusCode = 401;
    } else if (errorMessage.includes("web search") || errorMessage.includes("browsing")) {
      statusCode = 503; // Service unavailable for web search issues
      errorMessage = `Web search capability issue: ${errorMessage}`;
    } else if (errorMessage.includes("No relevant documents found")) {
      statusCode = 404;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: statusCode }
    );
  }
} 