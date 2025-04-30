/**
 * LangChain Embeddings Service
 * 
 * This module provides functions for generating embeddings using HuggingFace models.
 */

import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Embeddings } from "@langchain/core/embeddings";
import { env } from "@/config/env";

// Cache the embeddings instance to prevent creating multiple instances
let cachedEmbeddings: Embeddings | null = null;

/**
 * Get an embeddings instance for vector embeddings
 * Defaults to HuggingFaceInferenceEmbeddings with all-MPNet-base-v2
 */
export function getEmbeddings(modelName?: string): Embeddings {
  if (cachedEmbeddings) {
    return cachedEmbeddings;
  }

  // Default model if none specified
  const embeddingModel = modelName || "all-MPNet-base-v2";
  
  try {
    // Create HuggingFace embeddings
    cachedEmbeddings = new HuggingFaceInferenceEmbeddings({
      model: embeddingModel,
    });
    
    console.log(`Created embeddings using HuggingFace model: ${embeddingModel}`);
    return cachedEmbeddings;
  } catch (error) {
    console.error(`Error creating HuggingFace embeddings: ${error}`);
    
    // Fallback to OpenAI embeddings via OpenRouter if HuggingFace fails
    if (env.OPENROUTER_API_KEY) {
      console.log('Falling back to OpenAI embeddings via OpenRouter');
      
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
      
      return cachedEmbeddings;
    }
    
    throw new Error(`Failed to initialize embeddings: ${error}`);
  }
} 