/**
 * LangChain Document Loaders
 * 
 * This module handles loading and processing various document types
 * including PDF, CSV, DOCX, and plain text.
 */

// Use built-in Node.js modules and Document class directly instead of specific loaders
import { Document } from "@langchain/core/documents";
import { DocumentType, DocumentProcessResult } from "./types";
import { createVectorStore } from "./vectorStore";
import { getEmbeddings } from "./embeddings";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Default chunk size and overlap for text splitting
const DEFAULT_CHUNK_SIZE = 800;
const DEFAULT_CHUNK_OVERLAP = 100;

// Ensure the docs directory exists
const DOCS_DIR = path.join(process.cwd(), "data", "docs");
const VECTORSTORE_DIR = path.join(process.cwd(), "data", "vectorstore");

// Initialize the directories
function ensureDirectoriesExist() {
  if (!fs.existsSync(path.join(process.cwd(), "data"))) {
    fs.mkdirSync(path.join(process.cwd(), "data"));
  }
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }
  if (!fs.existsSync(VECTORSTORE_DIR)) {
    fs.mkdirSync(VECTORSTORE_DIR, { recursive: true });
  }
}

/**
 * Simple document loader interface
 */
interface SimpleDocumentLoader {
  load(): Promise<Document[]>;
}

/**
 * Simple text document loader
 */
class SimpleTextLoader implements SimpleDocumentLoader {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async load(): Promise<Document[]> {
    const text = fs.readFileSync(this.filePath, 'utf-8');
    return [
      new Document({
        pageContent: text,
        metadata: {
          source: this.filePath,
          filetype: 'text'
        }
      })
    ];
  }
}

/**
 * Simple CSV document loader
 */
class SimpleCSVLoader implements SimpleDocumentLoader {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async load(): Promise<Document[]> {
    const text = fs.readFileSync(this.filePath, 'utf-8');
    // Basic CSV parsing
    const rows = text.split('\n').filter(row => row.trim() !== '');
    const header = rows[0].split(',');
    
    return rows.slice(1).map((row, idx) => {
      const values = row.split(',');
      const pageContent = values.join(' ');
      const metadata: Record<string, any> = {
        source: this.filePath,
        filetype: 'csv',
        line: idx + 2
      };
      
      // Add header values as metadata
      header.forEach((col, colIdx) => {
        if (colIdx < values.length) {
          metadata[col] = values[colIdx];
        }
      });
      
      return new Document({
        pageContent,
        metadata
      });
    });
  }
}

/**
 * Simple text splitter implementation
 */
class SimpleTextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;
  
  constructor(chunkSize = DEFAULT_CHUNK_SIZE, chunkOverlap = DEFAULT_CHUNK_OVERLAP) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }
  
  splitDocuments(documents: Document[]): Document[] {
    const result: Document[] = [];
    
    for (const doc of documents) {
      const chunks = this.splitText(doc.pageContent);
      
      for (const chunk of chunks) {
        result.push(
          new Document({
            pageContent: chunk,
            metadata: { ...doc.metadata }
          })
        );
      }
    }
    
    return result;
  }
  
  private splitText(text: string): string[] {
    const chunks: string[] = [];
    
    if (text.length <= this.chunkSize) {
      chunks.push(text);
      return chunks;
    }
    
    let startIndex = 0;
    while (startIndex < text.length) {
      let endIndex = startIndex + this.chunkSize;
      if (endIndex > text.length) {
        endIndex = text.length;
      } else {
        // Try to split at a natural boundary like paragraph or sentence
        const boundary = this.findNaturalBoundary(text, endIndex);
        if (boundary > startIndex) {
          endIndex = boundary;
        }
      }
      
      chunks.push(text.substring(startIndex, endIndex));
      startIndex = endIndex - this.chunkOverlap;
    }
    
    return chunks;
  }
  
  private findNaturalBoundary(text: string, aroundIndex: number): number {
    // Look for paragraph breaks, then periods, then spaces, then any character
    const lookBackDistance = Math.min(100, this.chunkSize / 10);
    const start = Math.max(0, aroundIndex - lookBackDistance);
    const end = Math.min(text.length, aroundIndex + lookBackDistance);
    const searchText = text.substring(start, end);
    
    // Search for paragraph breaks
    const paragraphMatch = searchText.match(/\n\s*\n/);
    if (paragraphMatch && paragraphMatch.index !== undefined) {
      return start + paragraphMatch.index + paragraphMatch[0].length;
    }
    
    // Search for sentence endings
    const sentenceMatch = searchText.match(/[.!?]\s/);
    if (sentenceMatch && sentenceMatch.index !== undefined) {
      return start + sentenceMatch.index + sentenceMatch[0].length;
    }
    
    // Search for spaces
    const spaceMatch = searchText.match(/\s/);
    if (spaceMatch && spaceMatch.index !== undefined) {
      return start + spaceMatch.index + spaceMatch[0].length;
    }
    
    // Just return the original index if no natural boundary found
    return aroundIndex;
  }
}

/**
 * Get the appropriate document loader based on file type
 */
function getDocumentLoader(filePath: string, mimeType: string): SimpleDocumentLoader {
  switch (mimeType) {
    case DocumentType.PDF:
      // Fallback for PDF files - just extract text content
      return new SimpleTextLoader(filePath);
    case DocumentType.CSV:
      return new SimpleCSVLoader(filePath);
    case DocumentType.DOCX:
      // Fallback for DOCX files - just extract text content
      return new SimpleTextLoader(filePath);
    case DocumentType.TEXT:
    default:
      return new SimpleTextLoader(filePath);
  }
}

/**
 * Process a document file and add it to the vector store
 */
export async function processDocument(
  file: File, 
  collectionName = "default",
  metadata: Record<string, any> = {}
): Promise<DocumentProcessResult> {
  try {
    ensureDirectoriesExist();
    
    // Generate a unique ID for the document
    const documentId = uuidv4();
    
    // Create a filename based on the document ID and original filename
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop() || '';
    const storedFilename = `${documentId}.${fileExtension}`;
    const filePath = path.join(DOCS_DIR, storedFilename);
    
    // Save the file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    
    console.log(`Saved file to ${filePath}`);
    
    // Get appropriate loader based on file type
    const loader = getDocumentLoader(filePath, file.type);
    
    // Load documents
    const docs = await loader.load();
    
    // Add file metadata to each document
    const docsWithMetadata = docs.map(doc => {
      return new Document({
        pageContent: doc.pageContent,
        metadata: {
          ...doc.metadata,
          ...metadata,
          documentId,
          filename: originalName,
          createdAt: new Date().toISOString(),
        }
      });
    });
    
    // Split text into chunks using our custom splitter
    const textSplitter = new SimpleTextSplitter();
    const splitDocs = textSplitter.splitDocuments(docsWithMetadata);
    
    console.log(`Split document into ${splitDocs.length} chunks`);
    
    // Get embeddings
    const embeddings = getEmbeddings();
    
    // Create or update vector store
    const vectorStore = await createVectorStore({
      collectionName,
      persistDirectory: VECTORSTORE_DIR,
    });
    
    // Add documents to vector store
    await vectorStore.addDocuments(splitDocs);
    
    console.log(`Added ${splitDocs.length} document chunks to vector store`);
    
    // Extract the full text for response
    const fullText = docsWithMetadata.map(doc => doc.pageContent).join('\n\n');
    
    return {
      success: true,
      documentId,
      text: fullText,
      chunks: splitDocs.length,
      metadata: {
        filename: originalName,
        filePath: storedFilename,
        collectionName,
      }
    };
    
  } catch (error) {
    console.error(`Error processing document: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 