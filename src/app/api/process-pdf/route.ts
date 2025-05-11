/**
 * PDF Processing API
 * 
 * This endpoint handles PDF uploads and extracts text content from them.
 * It uses multipart form data to receive the PDF file.
 */

import { NextResponse } from 'next/server';
import { PdfReader } from 'pdfreader';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Response type for the PDF processing API
 */
interface PdfProcessResponse {
  text: string;
  pageCount: number;
}

/**
 * Error response type
 */
interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * POST handler for PDF processing
 */
export async function POST(request: Request): Promise<NextResponse<PdfProcessResponse | ErrorResponse>> {
  try {
    console.log('Received PDF processing request');
    
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }
    
    // Parse the form data
    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File | null;
    
    // Validate file
    if (!pdfFile) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }
    
    // Check file type
    if (pdfFile.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }
    
    // Check file size
    if (pdfFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File size too large',
          details: `Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
        },
        { status: 400 }
      );
    }
    
    console.log(`Processing PDF: ${pdfFile.name}, size: ${pdfFile.size} bytes`);
    
    // Check if it's a valid PDF (basic header check)
    const headerBytes = new Uint8Array(await pdfFile.slice(0, 5).arrayBuffer());
    const header = String.fromCharCode.apply(null, Array.from(headerBytes));
    
    if (header !== "%PDF-") {
      console.error("File doesn't appear to be a valid PDF - header:", header);
      return NextResponse.json(
        { error: "Invalid PDF file format. The file doesn't appear to be a valid PDF." },
        { status: 400 }
      );
    }
    
    // Extract text from PDF
    const pdfText = await extractTextFromPdf(pdfFile);
    
    return NextResponse.json({
      text: pdfText.text,
      pageCount: pdfText.pageCount
    });
  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: `PDF processing failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// Interface for a text item with position
interface TextItem {
  text: string;
  x: number;
  y: number;
}

// Define types to match pdfreader's ItemHandler interface
type PdfItem = {
  page?: number;
  text?: string;
  x?: number;
  y?: number;
} | null;

/**
 * Extract text from a PDF file
 */
async function extractTextFromPdf(file: File): Promise<{ text: string, pageCount: number }> {
  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return new Promise((resolve, reject) => {
    // Track pages and text items with their positions
    const pageTexts: Record<number, TextItem[]> = {};
    let currentPage = 0;
    
    new PdfReader().parseBuffer(buffer, (err: Error | string | null, item: PdfItem) => {
      if (err) {
        console.error('PDF parsing error:', err);
        reject(err);
        return;
      }
      
      // End of file
      if (!item) {
        // Process text items by page, sorted by position
        const allText = Object.keys(pageTexts)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(pageNum => {
            const pageItems = pageTexts[parseInt(pageNum)];
            
            // Sort items by y position (rows) and then x position (columns)
            pageItems.sort((a, b) => {
              // Group items into rows based on y position (small tolerance for alignment)
              const yDiff = Math.abs(a.y - b.y);
              if (yDiff < 0.3) { // Items on same line
                return a.x - b.x; // Sort by x position
              }
              return a.y - b.y; // Sort by y position
            });
            
            // Group items by rows (similar y positions)
            const rows: TextItem[][] = [];
            let currentRow: TextItem[] = [];
            let prevY: number | null = null;
            
            pageItems.forEach(item => {
              if (prevY === null || Math.abs(item.y - prevY) < 0.3) {
                // Same row
                currentRow.push(item);
              } else {
                // New row
                rows.push([...currentRow]);
                currentRow = [item];
              }
              prevY = item.y;
            });
            
            // Add the last row
            if (currentRow.length > 0) {
              rows.push(currentRow);
            }
            
            // Convert rows to text with proper spacing
            const pageText = rows.map(row => {
              // Process each row to maintain word spacing
              let rowText = '';
              let prevItem: TextItem | null = null;
              
              row.forEach(item => {
                if (prevItem) {
                  // Calculate appropriate spacing between words
                  const gap = item.x - (prevItem.x + prevItem.text.length * 0.5);
                  
                  // Add space if there should be a gap between words
                  if (gap > 0.5) {
                    rowText += ' ';
                  }
                }
                
                rowText += item.text;
                prevItem = item;
              });
              
              return rowText;
            }).join('\n');
            
            return `[Page ${pageNum}]\n${pageText}\n`;
          })
          .join('\n');
        
        resolve({
          text: allText.trim() || "No text content could be extracted from the PDF.",
          pageCount: Object.keys(pageTexts).length
        });
        return;
      }
      
      // New page
      if (item.page) {
        currentPage = item.page;
        pageTexts[currentPage] = pageTexts[currentPage] || [];
      }
      
      // Text content
      if (item.text && item.x !== undefined && item.y !== undefined) {
        pageTexts[currentPage] = pageTexts[currentPage] || [];
        pageTexts[currentPage].push({
          text: item.text,
          x: item.x,
          y: item.y
        });
      }
    });
  });
} 