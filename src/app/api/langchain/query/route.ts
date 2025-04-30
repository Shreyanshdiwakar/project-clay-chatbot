/**
 * LangChain Query API
 * 
 * This endpoint handles semantic search queries against the vector store.
 * It accepts a query parameter and returns semantically similar documents.
 */

import { NextResponse } from 'next/server';
import { queryVectorStore } from '@/services/langchain/vectorStore';
import { RetrievalResult } from '@/services/langchain/types';

export async function GET(request: Request): Promise<NextResponse<RetrievalResult>> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const collection = searchParams.get('collection') || 'default';
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }
    
    console.log(`Processing vector store query: "${query}" in collection: ${collection}`);
    
    const results = await queryVectorStore(query, collection, undefined, limit);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse<RetrievalResult>> {
  try {
    const contentType = request.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Request must be application/json' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { query, collection = 'default', limit = 5 } = body;
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required in request body' },
        { status: 400 }
      );
    }
    
    console.log(`Processing vector store query: "${query}" in collection: ${collection}`);
    
    const results = await queryVectorStore(query, collection, undefined, limit);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 