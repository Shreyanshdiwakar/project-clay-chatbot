/**
 * LangChain Retrieval Chain
 * 
 * This module provides a retrieval-based QA chain that combines
 * document retrieval with LLM-based question answering.
 */

import { OpenAI } from "@langchain/openai";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { env } from "@/config/env";
import { createVectorStore } from "./vectorStore";
import { ApiKeys } from "./types";

/**
 * Create a QA chain that uses OpenRouter API models
 */
export async function createRetrievalChain(
  collectionName = "default",
  apiKeys?: ApiKeys,
  modelName = "deepseek-ai/deepseek-llm-v3-32k"
) {
  // Get the vector store for the collection
  const vectorStore = await createVectorStore({
    collectionName,
    persistDirectory: process.cwd() + "/data/vectorstore",
  });
  
  // Create the retriever
  const retriever = vectorStore.asRetriever({
    k: 5, // Number of documents to retrieve
    searchType: "similarity",
  });
  
  // Set API key preference (passed in apiKeys object > env var)
  const openRouterApiKey = 
    apiKeys?.openrouterApiKey || 
    env.OPENROUTER_API_KEY;
  
  if (!openRouterApiKey) {
    throw new Error("OpenRouter API key is required for the retrieval chain");
  }
  
  // Create an OpenAI LLM instance pointed at OpenRouter
  const llm = new OpenAI({
    modelName,
    temperature: 0.2,
    openAIApiKey: openRouterApiKey,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://openrouter.ai/", 
        "X-Title": "Project Clay Chatbot"
      }
    }
  });
  
  // Create a QA chain with the retriever
  const chain = RetrievalQAChain.fromLLM(
    llm,
    retriever,
    {
      returnSourceDocuments: true,
      verbose: process.env.NODE_ENV === "development",
    }
  );
  
  return chain;
}

/**
 * Ask a question using the retrieval chain
 */
export async function askQuestion(
  question: string,
  collectionName = "default", 
  apiKeys?: ApiKeys,
  modelName?: string
) {
  try {
    // Create the chain
    const chain = await createRetrievalChain(collectionName, apiKeys, modelName);
    
    // Run the chain
    const response = await chain.call({
      query: question,
    });
    
    // Format the response
    return {
      success: true,
      answer: response.text,
      sourceDocuments: response.sourceDocuments,
    };
  } catch (error) {
    console.error(`Error asking question: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
} 