/**
 * LangChain Ask API
 * 
 * This endpoint handles question answering using the LangChain retrieval chain.
 * It accepts a question and returns an answer based on the documents in the vector store.
 */

import { NextResponse } from 'next/server';
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
      modelName = env.PRIMARY_MODEL || 'deepseek-ai/deepseek-llm-v3-32k',
      tavily_api_key
    } = body;
    
    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question is required in request body' },
        { status: 400 }
      );
    }
    
    console.log(`Processing question: "${question}" using collection: ${collection}`);
    
    const apiKeys = {
      openrouterApiKey: env.OPENROUTER_API_KEY,
      tavilyApiKey: tavily_api_key
    };
    
    const response = await askQuestion(question, collection, apiKeys, modelName);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Question answering error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 