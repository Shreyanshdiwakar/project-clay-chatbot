/**
 * Simple Vector Store Service
 * 
 * This module provides a simple in-memory vector store implementation.
 */

import { VectorStoreConfig, RetrievalResult, QueryResult } from "./types";
import { getEmbeddings } from "./embeddings";
import { Document } from "@langchain/core/documents";
import path from "path";

/**
 * Simple in-memory vector store implementation
 */
class SimpleVectorStore {
  private documents: Document[] = [];
  private embeddings: any;
  private collectionName: string;
  
  constructor(embeddings: any, collectionName: string) {
    this.embeddings = embeddings;
    this.collectionName = collectionName;
  }
  
  /**
   * Add documents to the vector store
   */
  async addDocuments(documents: Document[]): Promise<void> {
    this.documents.push(...documents);
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
      
      // Embed all documents if needed (in a real implementation, we'd store these)
      const docEmbeddings: number[][] = [];
      for (const doc of this.documents) {
        const embedding = await this.embeddings.embedQuery(doc.pageContent);
        docEmbeddings.push(embedding);
      }
      
      // Calculate similarities
      const similarities: [Document, number][] = this.documents.map((doc, i) => {
        const similarity = this.cosineSimilarity(queryEmbedding, docEmbeddings[i]);
        return [doc, similarity];
      });
      
      // Sort by similarity (highest first) and take top k
      return similarities
        .sort((a, b) => b[1] - a[1])
        .slice(0, k);
    } catch (error) {
      console.error(`Error in similaritySearchWithScore: ${error}`);
      return [];
    }
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
  
  // Get embeddings
  const embeddings = getEmbeddings(embeddingModelName);

  // Create a new simple vector store
  console.log(`Creating SimpleVectorStore for collection: ${collectionName}`);
  const vectorStore = new SimpleVectorStore(embeddings, collectionName);
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