/**
 * LangChain Embeddings Service
 * 
 * This module provides functions for generating embeddings using HuggingFace models,
 * with fallbacks to OpenAI embeddings via OpenRouter, or local embeddings if no API keys are available.
 */

import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Embeddings } from "@langchain/core/embeddings";
import { env } from "@/config/env";

// Cache the embeddings instance to prevent creating multiple instances
let cachedEmbeddings: Embeddings | null = null;

// Get HuggingFace API key from environment variables
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || 
                           process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || 
                           process.env.VERCEL_HUGGINGFACE_API_KEY;

/**
 * Get an embeddings instance for vector embeddings
 * With fallback chain: HuggingFace API -> OpenRouter -> Local embeddings
 */
export function getEmbeddings(modelName?: string): Embeddings {
  if (cachedEmbeddings) {
    return cachedEmbeddings;
  }

  // Default model if none specified
  const embeddingModel = modelName || "all-MPNet-base-v2";
  
  try {
    // Attempt to use HuggingFace API with API key if available
    if (HUGGINGFACE_API_KEY) {
      try {
        // Create HuggingFace embeddings with API key
        cachedEmbeddings = new HuggingFaceInferenceEmbeddings({
          model: embeddingModel,
          apiKey: HUGGINGFACE_API_KEY,
        });
        
        console.log(`Created embeddings using HuggingFace model: ${embeddingModel} with API key`);
        return cachedEmbeddings;
      } catch (hfError) {
        console.warn(`Error with HuggingFace API embeddings: ${hfError}`);
        // Continue to fallbacks
      }
    } else {
      console.warn('No HuggingFace API key provided. Trying fallback options.');
    }
    
    // Fallback to OpenAI embeddings via OpenRouter if HuggingFace fails
    if (env.OPENROUTER_API_KEY) {
      try {
        console.log('Attempting to use OpenAI embeddings via OpenRouter');
        
        cachedEmbeddings = new OpenAIEmbeddings({
          openAIApiKey: env.OPENROUTER_API_KEY,
          configuration: {
            baseURL: "https://openrouter.ai/api/v1",
            defaultHeaders: {
              "HTTP-Referer": "https://openrouter.ai/",
              "X-Title": "Project Clay Chatbot"
            }
          }
        });
        
        console.log('Successfully created OpenAI embeddings via OpenRouter');
        return cachedEmbeddings;
      } catch (openAiError) {
        console.warn(`Error with OpenAI embeddings: ${openAiError}`);
        // Continue to local fallback
      }
    } else {
      console.warn('No OpenRouter API key provided. Trying local embeddings.');
    }
    
    // Final fallback - use simple local embeddings implementation
    // Replace the problematic chromadb-default-embed dependency with a simple implementation
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
