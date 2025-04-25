/**
 * PDF processing API endpoint
 * 
 * This endpoint receives PDF files and extracts text content
 * It uses the pdfreader library
 */

import { NextResponse } from 'next/server';
import { PdfReader } from 'pdfreader';

// Define types for pdfreader which lacks TypeScript definitions
type PdfItem = {
  page?: number;
  text?: string;
};

// Define custom type for the callback function
type ItemCallback = (err: Error | string | null, item: PdfItem | null) => void;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File;

    if (!pdfFile) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    // Log info about the PDF file for debugging
    console.log(`Processing PDF file: ${pdfFile.name}, size: ${pdfFile.size} bytes, type: ${pdfFile.type}`);

    // Process PDF file
    try {
      const pdfText = await extractTextFromPdf(pdfFile);
      
      // Log success and sample of extracted text
      console.log(`Successfully extracted text from PDF. Length: ${pdfText.length} chars`);
      console.log(`Sample text: ${pdfText.substring(0, 200)}...`);
      
      // Return the extracted text
      return NextResponse.json({
        success: true,
        text: pdfText,
      });
    } catch (pdfError) {
      console.error('PDF extraction error:', pdfError);
      return NextResponse.json(
        { error: `Failed to extract text from PDF: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: `Failed to process PDF: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// Extract text from PDF file
async function extractTextFromPdf(file: File): Promise<string> {
  try {
    // Convert the File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error("PDF file is empty");
    }
    
    // Add debug info
    console.log(`PDF ArrayBuffer size: ${arrayBuffer.byteLength} bytes`);
    
    // Check if it's actually a PDF (looks for PDF magic number)
    const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
    const header = String.fromCharCode.apply(null, Array.from(headerBytes));
    
    if (header !== "%PDF-") {
      console.error("File doesn't appear to be a valid PDF - header:", header);
      throw new Error("Invalid PDF file format. The file doesn't appear to be a valid PDF.");
    }
    
    // Use pdfreader to extract text
    return new Promise((resolve, reject) => {
      const pages: { [key: number]: string[] } = {};

      const reader = new PdfReader();
      // Fix TypeScript errors by explicitly typing parameters
      reader.parseBuffer(Buffer.from(arrayBuffer), ((err: Error | null, item: PdfItem | null) => {
        if (err) {
          console.error("PDF parsing error:", err);
          reject(err);
        } else if (!item) {
          // End of file, compile all pages
          let extractedText = "";
          Object.keys(pages).sort((a, b) => parseInt(a) - parseInt(b)).forEach((pageNum) => {
            extractedText += pages[parseInt(pageNum)].join(" ") + "\n\n";
          });
          resolve(extractedText.trim() || "No text content could be extracted from the PDF.");
        } else if (item.text) {
          // Track text by page
          const pageNum = item.page || 0;
          if (!pages[pageNum]) {
            pages[pageNum] = [];
          }
          pages[pageNum].push(item.text);
        }
      }) as any);
    });
  } catch (error) {
    console.error("PDF extraction failed:", error);
    throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : String(error)}`);
  }
} 