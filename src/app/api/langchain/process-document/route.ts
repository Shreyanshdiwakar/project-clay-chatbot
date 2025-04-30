/**
 * Document Processing API for LangChain
 * 
 * This endpoint handles document uploads and processes them with LangChain.
 * It uses multipart form data to receive files and adds them to the vector store.
 */

import { NextResponse } from 'next/server';
import { processDocument } from '@/services/langchain/documentLoaders';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Response type for the document processing API
 */
interface ProcessResponse {
  success: boolean;
  documentId?: string;
  text?: string;
  chunks?: number;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * POST handler for document processing
 */
export async function POST(request: Request): Promise<NextResponse<ProcessResponse>> {
  try {
    console.log('Received document processing request for LangChain');
    
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }
    
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const collectionName = formData.get('collection') as string || 'default';
    
    // Get metadata from form data
    const metadata: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'file' && key !== 'collection') {
        metadata[key] = value;
      }
    }
    
    // Validate file
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false,
          error: `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        },
        { status: 400 }
      );
    }
    
    console.log(`Processing document: ${file.name}, size: ${file.size} bytes, type: ${file.type}, collection: ${collectionName}`);
    
    // Process the document with LangChain
    const result = await processDocument(file, collectionName, metadata);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    
    console.log(`Document processed successfully. ID: ${result.documentId}, chunks: ${result.chunks}`);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Document processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 