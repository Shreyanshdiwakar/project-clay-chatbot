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
   * Add documents to the vector store
   */
  async addDocuments(documents: Document[]): Promise<void> {
    if (!documents || documents.length === 0) {
      return;
    }
    
    this.documents.push(...documents);
    
    // Pre-compute and cache embeddings for all documents
    for (const doc of documents) {
      if (doc.pageContent) {
        try {
          const embedding = await this.embeddings.embedQuery(doc.pageContent);
          this.embedCache.set(doc.pageContent, embedding);
        } catch (error) {
          console.error(`Error computing embedding: ${error}`);
        }
      }
    }
    
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
   * Search for similar documents based on a query
   */
  async similaritySearchWithScore(
    query: string, 
    k = 5
  ): Promise<[Document, number][]> {
    if (this.documents.length === 0) {
      return [];
    }
    
    try {
      // Embed the query
      const queryEmbedding = await this.embeddings.embedQuery(query);
      
      // Calculate similarities using cached embeddings where possible
      const similarities: [Document, number][] = [];
      
      for (const doc of this.documents) {
        let docEmbedding: number[];
        
        // Use cached embedding if available
        if (this.embedCache.has(doc.pageContent)) {
          docEmbedding = this.embedCache.get(doc.pageContent)!;
        } else {
          // Compute embedding if not cached
          docEmbedding = await this.embeddings.embedQuery(doc.pageContent);
          this.embedCache.set(doc.pageContent, docEmbedding);
        }
        
        const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
        similarities.push([doc, similarity]);
      }
      
      // Sort by similarity (highest first) and take top k
      return similarities
        .sort((a, b) => b[1] - a[1])
        .slice(0, k);
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
 * Query the vector store for semantically similar documents
 */
export async function queryVectorStore(
  query: string,
  collectionName = "default",
  persistDirectory?: string,
  limit = 5
): Promise<RetrievalResult> {
  try {
    const dirPath = persistDirectory || path.join(process.cwd(), "data", "vectorstore");
    
    // Get the vector store
    const vectorStore = await createVectorStore({
      collectionName,
      persistDirectory: dirPath,
    });
    
    // Perform similarity search
    const results = await vectorStore.similaritySearchWithScore(query, limit);
    
    // Format results
    const formattedResults: QueryResult[] = results.map(([doc, score]) => ({
      text: doc.pageContent,
      score: score,
      metadata: doc.metadata
    }));
    
    return {
      success: true,
      results: formattedResults
    };
  } catch (error) {
    console.error(`Error querying vector store: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 