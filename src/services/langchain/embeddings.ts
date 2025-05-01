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
import "@langchain/community/embeddings/chromadb";

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
    
    // Final fallback - use local embeddings
    try {
      console.log('Fallback to local embeddings');
      
      // Import ChromaDBDefaultEmbeddings from the local package
      const { DefaultEmbeddings } = require("chromadb-default-embed");
      
      // Create a wrapper class that implements the Embeddings interface
      class LocalEmbeddings implements Embeddings {
        private embedder: any;

        constructor() {
          this.embedder = new DefaultEmbeddings();
        }

        async embedDocuments(documents: string[]): Promise<number[][]> {
          try {
            const embeddings = await Promise.all(
              documents.map(doc => this.embedder.embed(doc))
            );
            return embeddings;
          } catch (error) {
            console.error("Error embedding documents:", error);
            throw new Error(`Failed to embed documents: ${error}`);
          }
        }

        async embedQuery(query: string): Promise<number[]> {
          try {
            return await this.embedder.embed(query);
          } catch (error) {
            console.error("Error embedding query:", error);
            throw new Error(`Failed to embed query: ${error}`);
          }
        }
      }

      cachedEmbeddings = new LocalEmbeddings();
      console.log('Successfully created local embeddings');
      return cachedEmbeddings;
    } catch (localError) {
      console.error(`Local embeddings error:`, localError);
      throw new Error(`All embedding methods failed. Local embeddings error: ${localError}`);
    }
  } catch (error) {
    console.error(`Critical error initializing any embeddings: ${error}`);
    throw new Error(`Failed to initialize any embeddings: ${error}`);
  }
}
