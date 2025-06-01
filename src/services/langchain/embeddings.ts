/**
 * LangChain Embeddings Service
 * 
 * This module provides functions for generating embeddings using OpenAI models,
 * with fallbacks to local embeddings if no API keys are available.
 */

import { OpenAIEmbeddings } from "@langchain/openai";
import { Embeddings } from "@langchain/core/embeddings";
import { env } from "@/config/env";

// Cache the embeddings instance to prevent creating multiple instances
let cachedEmbeddings: Embeddings | null = null;

/**
 * Get an embeddings instance for vector embeddings
 * Using OpenAI embeddings with fallback to local embeddings
 */
export function getEmbeddings(modelName?: string): Embeddings {
  if (cachedEmbeddings) {
    return cachedEmbeddings;
  }

  try {
    // Attempt to use OpenAI embeddings if API key is available
    if (env.OPENAI_API_KEY) {
      try {
        console.log('Creating embeddings using OpenAI');
        
        cachedEmbeddings = new OpenAIEmbeddings({
          openAIApiKey: env.OPENAI_API_KEY,
          modelName: "text-embedding-ada-002" // OpenAI embedding model
        });
        
        console.log('Successfully created OpenAI embeddings');
        return cachedEmbeddings;
      } catch (openAiError) {
        console.warn(`Error with OpenAI embeddings: ${openAiError}`);
        // Continue to local fallback
      }
    } else {
      console.warn('No OpenAI API key provided. Using local embeddings fallback.');
    }
    
    // Final fallback - use simple local embeddings implementation
    console.log('Using simple local embeddings fallback');
    
    // Create a simple embeddings implementation using the OpenAIEmbeddings
    // but with a dummy embedding function for local use
    cachedEmbeddings = new class extends OpenAIEmbeddings {
      private dimension: number;

      constructor() {
        super({ openAIApiKey: "dummy-key" });
        this.dimension = 384;
      }

      // Simple function to generate a deterministic embedding based on text content
      private simpleHash(text: string): number[] {
        const embedding = new Array(this.dimension).fill(0);
        
        // Ensure text is a string to avoid type issues
        const safeText = text ? String(text) : "";
        
        // Create a simple hash-based embedding (not for production use)
        for (let i = 0; i < safeText.length; i++) {
          const charCode = safeText.charCodeAt(i);
          embedding[i % this.dimension] += charCode / 255;
        }
        
        // Normalize the embedding
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
      }

      override async embedDocuments(documents: string[]): Promise<number[][]> {
        // Defensive check for null/undefined documents
        if (!documents || !Array.isArray(documents)) {
          console.warn('Invalid documents array provided to embedDocuments');
          return [];
        }
        
        // Filter out null/undefined values and ensure strings
        const safeDocuments = documents
          .filter(doc => doc !== null && doc !== undefined)
          .map(doc => String(doc));
        
        return safeDocuments.map(doc => this.simpleHash(doc));
      }

      override async embedQuery(query: string): Promise<number[]> {
        // Ensure query is a string
        const safeQuery = query ? String(query) : "";
        return this.simpleHash(safeQuery);
      }
    }();
    
    console.log('Created simple local embeddings fallback');
    return cachedEmbeddings;
  } catch (error) {
    console.error(`Critical error initializing any embeddings: ${error}`);
    throw new Error(`Failed to initialize any embeddings: ${error}`);
  }
}