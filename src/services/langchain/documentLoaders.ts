/**
 * LangChain Document Loaders
 * 
 * This module handles loading and processing various document types
 * including PDF, CSV, DOCX, and plain text.
 */

import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
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
 * Get the appropriate document loader based on file type
 */
function getDocumentLoader(filePath: string, mimeType: string) {
  switch (mimeType) {
    case DocumentType.PDF:
      return new PDFLoader(filePath);
    case DocumentType.CSV:
      return new CSVLoader(filePath);
    case DocumentType.DOCX:
      return new DocxLoader(filePath);
    case DocumentType.TEXT:
    default:
      return new TextLoader(filePath);
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
    
    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: DEFAULT_CHUNK_SIZE,
      chunkOverlap: DEFAULT_CHUNK_OVERLAP,
    });
    
    const splitDocs = await textSplitter.splitDocuments(docsWithMetadata);
    
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