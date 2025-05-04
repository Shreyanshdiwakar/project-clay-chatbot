/**
 * API route for deleting a vector store collection
 */

import { NextResponse } from 'next/server';
import { createVectorStore } from '@/services/langchain/vectorStore';
import path from 'path';

/**
 * Delete a collection from the vector store
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Parse request
    const data = await request.json();
    const { collectionName } = data;
    
    if (!collectionName) {
      return NextResponse.json(
        { success: false, error: 'Collection name is required' },
        { status: 400 }
      );
    }
    
    console.log(`Attempting to delete collection: ${collectionName}`);
    
    // Default vector store directory
    const persistDirectory = path.join(process.cwd(), "data", "vectorstore");
    
    // Get vector store
    const vectorStore = await createVectorStore({ 
      collectionName,
      persistDirectory
    });
    
    // Clear the collection
    await vectorStore.clearCollection();
    
    return NextResponse.json({ 
      success: true, 
      message: `Collection ${collectionName} deleted successfully` 
    });
  } catch (error) {
    console.error(`Error deleting collection: ${error}`);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 