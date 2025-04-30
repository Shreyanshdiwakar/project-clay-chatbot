/**
 * LangChain Vector Store Service
 * 
 * This module provides functions for working with Chroma vector database.
 */

import { Chroma } from "@langchain/community/vectorstores/chroma";
import { VectorStoreConfig, RetrievalResult, QueryResult } from "./types";
import { getEmbeddings } from "./embeddings";
import path from "path";

// Cache vector stores by collection name to prevent duplicate instances
const vectorStoreCache = new Map<string, Chroma>();

/**
 * Create or get a vector store for a specific collection
 */
export async function createVectorStore({
  collectionName,
  persistDirectory,
  embeddingModelName
}: VectorStoreConfig): Promise<Chroma> {
  // Check if we have this store cached
  const cacheKey = `${collectionName}:${persistDirectory}`;
  if (vectorStoreCache.has(cacheKey)) {
    return vectorStoreCache.get(cacheKey)!;
  }
  
  // Get embeddings
  const embeddings = getEmbeddings(embeddingModelName);
  
  // Create new Chroma client with persistence
  try {
    const vectorStore = await Chroma.fromExistingCollection(
      embeddings,
      { collectionName }
    );
    
    console.log(`Connected to existing Chroma collection: ${collectionName}`);
    vectorStoreCache.set(cacheKey, vectorStore);
    return vectorStore;
  } catch (error) {
    console.log(`Creating new Chroma collection: ${collectionName}`);
    
    // Create a new collection if one doesn't exist
    const vectorStore = await Chroma.fromDocuments(
      [], // Start with empty documents
      embeddings,
      {
        collectionName,
        url: process.env.CHROMA_URL || undefined,
        collectionMetadata: {
          "hnsw:space": "cosine"
        }
      }
    );
    
    vectorStoreCache.set(cacheKey, vectorStore);
    return vectorStore;
  }
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