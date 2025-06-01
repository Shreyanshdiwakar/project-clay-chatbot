/**
 * Simple Vector Store Service
 * 
 * This module provides a simple file-persistent vector store implementation.
 */

import { VectorStoreConfig, RetrievalResult, QueryResult } from "./types";
import { getEmbeddings } from "./embeddings";
import { Document } from "@langchain/core/documents";
import path from "path";
import fs from "fs";

// Maximum batch size for embedding operations
const MAX_BATCH_SIZE = 100;

// Relevance threshold for filtering results (0.0 to 1.0)
const DEFAULT_RELEVANCE_THRESHOLD = 0.6;

// Default pagination parameters
const DEFAULT_PAGE_SIZE = 10;

// Ensure the vectorstore directory exists
const ensureVectorStoreDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Simple file-persistent vector store implementation
 */
class SimpleVectorStore {
  private documents: Document[] = [];
  private embeddings: any;
  private collectionName: string;
  private persistDirectory: string;
  private embedCache: Map<string, number[]> = new Map();
  
  constructor(embeddings: any, collectionName: string, persistDirectory: string) {
    this.embeddings = embeddings;
    this.collectionName = collectionName;
    this.persistDirectory = persistDirectory;
    
    // Ensure directory exists
    ensureVectorStoreDir(this.persistDirectory);
    
    // Try to load existing data
    this.loadFromDisk();
  }
  
  /**
   * Save vector store data to disk
   */
  private saveToDisk(): void {
    try {
      const storePath = path.join(this.persistDirectory, `${this.collectionName}.json`);
      
      // Prepare data for storage - extract embeddings from cache
      const dataToSave = {
        documents: this.documents,
        embeddings: Array.from(this.embedCache.entries())
      };
      
      fs.writeFileSync(storePath, JSON.stringify(dataToSave, null, 2));
      console.log(`Saved vector store data to ${storePath}`);
    } catch (error) {
      console.error(`Error saving vector store data: ${error}`);
    }
  }
  
  /**
   * Load vector store data from disk
   */
  private loadFromDisk(): void {
    try {
      const storePath = path.join(this.persistDirectory, `${this.collectionName}.json`);
      
      if (fs.existsSync(storePath)) {
        const rawData = fs.readFileSync(storePath, 'utf-8');
        const data = JSON.parse(rawData);
        
        if (data.documents) {
          this.documents = data.documents;
        }
        
        if (data.embeddings && Array.isArray(data.embeddings)) {
          this.embedCache = new Map(data.embeddings);
        }
        
        console.log(`Loaded ${this.documents.length} documents from ${storePath}`);
      }
    } catch (error) {
      console.error(`Error loading vector store data: ${error}`);
      // Continue with empty store on error
    }
  }
  
  /**
   * Process documents in batches to avoid memory issues
   */
  private async processBatchedDocuments(documents: Document[]): Promise<void> {
    // Process documents in batches to avoid memory issues
    const batches = [];
    for (let i = 0; i < documents.length; i += MAX_BATCH_SIZE) {
      batches.push(documents.slice(i, i + MAX_BATCH_SIZE));
    }
    
    console.log(`Processing ${documents.length} documents in ${batches.length} batches`);
    
    let processedCount = 0;
    for (const batch of batches) {
      // Pre-compute and cache embeddings for the batch
      for (const doc of batch) {
        if (doc.pageContent && !this.embedCache.has(doc.pageContent)) {
          try {
            const embedding = await this.embeddings.embedQuery(doc.pageContent);
            this.embedCache.set(doc.pageContent, embedding);
            processedCount++;
            
            // Log progress for large batches
            if (processedCount % 20 === 0) {
              console.log(`Processed ${processedCount}/${documents.length} documents...`);
            }
          } catch (error) {
            console.error(`Error computing embedding: ${error}`);
          }
        }
      }
      
      // Add the batch to our documents array
      this.documents.push(...batch);
    }
    
    console.log(`Completed processing ${processedCount} new documents`);
  }
  
  /**
   * Add documents to the vector store
   */
  async addDocuments(documents: Document[]): Promise<void> {
    if (!documents || documents.length === 0) {
      return;
    }
    
    // Process documents in batches
    await this.processBatchedDocuments(documents);
    
    // Save to disk after adding documents
    this.saveToDisk();
    
    console.log(`Added ${documents.length} documents to SimpleVectorStore collection ${this.collectionName}`);
  }
  
  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  /**
   * Search for similar documents based on a query with pagination
   */
  async similaritySearchWithScore(
    query: string, 
    k = 5,
    threshold = DEFAULT_RELEVANCE_THRESHOLD,
    page = 1
  ): Promise<[Document, number][]> {
    if (this.documents.length === 0) {
      return [];
    }
    
    const pageSize = k > 0 ? k : DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * pageSize;
    
    try {
      console.log(`Running similarity search with threshold: ${threshold}, page: ${page}, pageSize: ${pageSize}`);
      
      // Embed the query
      const queryEmbedding = await this.embeddings.embedQuery(query);
      
      // Calculate similarities using cached embeddings where possible
      const similarities: [Document, number][] = [];
      
      for (const doc of this.documents) {
        if (!doc.pageContent) continue;
        
        let docEmbedding: number[];
        
        // Use cached embedding if available
        if (this.embedCache.has(doc.pageContent)) {
          docEmbedding = this.embedCache.get(doc.pageContent)!;
        } else {
          // Compute embedding if not cached
          try {
            docEmbedding = await this.embeddings.embedQuery(doc.pageContent);
            this.embedCache.set(doc.pageContent, docEmbedding);
          } catch (error) {
            console.error(`Error embedding document: ${error}`);
            continue; // Skip this document on error
          }
        }
        
        const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
        
        // Only add documents that meet the threshold
        if (similarity >= threshold) {
          similarities.push([doc, similarity]);
        }
      }
      
      // Sort by similarity (highest first)
      const sortedResults = similarities.sort((a, b) => b[1] - a[1]);
      
      // Apply pagination
      const paginatedResults = sortedResults.slice(skip, skip + pageSize);
      
      console.log(`Found ${sortedResults.length} results above threshold ${threshold}, returning ${paginatedResults.length} results for page ${page}`);
      
      return paginatedResults;
    } catch (error) {
      console.error(`Error in similaritySearchWithScore: ${error}`);
      return [];
    }
  }
  
  /**
   * Clear the vector store collection
   */
  async clearCollection(): Promise<void> {
    this.documents = [];
    this.embedCache.clear();
    this.saveToDisk();
    console.log(`Cleared collection ${this.collectionName}`);
  }
  
  /**
   * Get the number of documents in the collection
   */
  getDocumentCount(): number {
    return this.documents.length;
  }
  
  /**
   * Get memory usage statistics
   */
  getMemoryStats(): { documentsCount: number; cacheSize: number; estimatedMemoryUsageMB: number } {
    // Estimate memory usage (very rough approximation)
    const cacheSize = this.embedCache.size;
    const avgEmbeddingSize = 384 * 4; // 384 dimensions * 4 bytes per float
    const estimatedMemoryBytes = 
      (this.documents.reduce((sum, doc) => sum + (doc.pageContent?.length || 0), 0) * 2) + // Text content (2 bytes per char)
      (cacheSize * avgEmbeddingSize) + // Embeddings cache
      (JSON.stringify(this.documents.map(d => d.metadata)).length * 2); // Metadata (2 bytes per char)
    
    return {
      documentsCount: this.documents.length,
      cacheSize,
      estimatedMemoryUsageMB: Math.round(estimatedMemoryBytes / (1024 * 1024) * 100) / 100
    };
  }
}

// Cache vector stores by collection name to prevent duplicate instances
const vectorStoreCache = new Map<string, SimpleVectorStore>();

/**
 * Create or get a vector store for a specific collection
 */
export async function createVectorStore({
  collectionName,
  persistDirectory,
  embeddingModelName
}: VectorStoreConfig): Promise<SimpleVectorStore> {
  // Check if we have this store cached
  const cacheKey = `${collectionName}:${persistDirectory}`;
  if (vectorStoreCache.has(cacheKey)) {
    return vectorStoreCache.get(cacheKey)!;
  }
  
  // Use provided directory or default
  const dirPath = persistDirectory || path.join(process.cwd(), "data", "vectorstore");
  
  // Get embeddings
  const embeddings = getEmbeddings(embeddingModelName);

  // Create a new simple vector store with persistence
  console.log(`Creating SimpleVectorStore for collection: ${collectionName}`);
  const vectorStore = new SimpleVectorStore(embeddings, collectionName, dirPath);
  vectorStoreCache.set(cacheKey, vectorStore);
  return vectorStore;
}

/**
 * Query the vector store for semantically similar documents with pagination and threshold
 */
export async function queryVectorStore(
  query: string,
  collectionName = "default",
  persistDirectory?: string,
  limit = 5,
  threshold = DEFAULT_RELEVANCE_THRESHOLD,
  page = 1
): Promise<RetrievalResult> {
  try {
    const dirPath = persistDirectory || path.join(process.cwd(), "data", "vectorstore");
    
    // Get the vector store
    const vectorStore = await createVectorStore({
      collectionName,
      persistDirectory: dirPath,
    });
    
    // Log memory stats before query
    const memoryStats = vectorStore.getMemoryStats();
    console.log(`Vector store stats before query - Documents: ${memoryStats.documentsCount}, Cache size: ${memoryStats.cacheSize}, Estimated memory: ${memoryStats.estimatedMemoryUsageMB}MB`);
    
    // If store is empty, return early
    if (vectorStore.getDocumentCount() === 0) {
      return {
        success: true,
        results: []
      };
    }
    
    console.log(`Querying vector store with: "${query}", limit: ${limit}, threshold: ${threshold}, page: ${page}`);
    
    // Perform similarity search with threshold and pagination
    const results = await vectorStore.similaritySearchWithScore(query, limit, threshold, page);
    
    // Format results
    const formattedResults: QueryResult[] = results.map(([doc, score]) => ({
      text: doc.pageContent,
      score: score,
      metadata: doc.metadata
    }));
    
    return {
      success: true,
      results: formattedResults,
      pagination: {
        page,
        pageSize: limit,
        totalResults: results.length
      }
    };
  } catch (error) {
    console.error(`Error querying vector store: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}