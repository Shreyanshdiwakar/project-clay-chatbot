/**
 * Simple Retrieval Service
 * 
 * This module provides a basic question answering system that uses
 * the vector store to find relevant documents and then uses the API
 * to generate an answer.
 */

import { env } from "../../config/env.js";
import { queryVectorStore } from "./vectorStore.js";
import { getModelResponse } from "../openai/service.js";

/**
 * API keys for different services
 */
export interface ApiKeys {
  /** OpenAI API key */
  openaiApiKey?: string;
  /** OpenRouter API key */
  openrouterApiKey?: string;
}

/**
 * Result from querying the vector store
 */
export interface QueryResult {
  /** Content of the document */
  text: string;
  /** Similarity score */
  score: number;
  /** Document metadata */
  metadata: Record<string, any>;
}

/**
 * Result from web search
 */
export interface WebSearchResult {
  /** Title of the search result */
  title: string;
  /** URL of the search result */
  url: string;
  /** Text snippet from the search result */
  snippet: string;
}

/**
 * Document source with content and metadata
 */
export interface DocumentSource {
  /** The content of the document */
  pageContent: string;
  /** Document metadata */
  metadata: Record<string, any>;
}

/**
 * Response from question answering
 */
export interface QuestionAnswerResult {
  /** Whether the query was successful */
  success: boolean;
  /** Error message if unsuccessful */
  error?: string;
  /** The answer text */
  answer?: string;
  /** Vector store source documents */
  sourceDocuments?: DocumentSource[] | undefined;
  /** Web search results */
  webSearchResults?: WebSearchResult[] | undefined;
}
/**
 * Ask a question using direct API call to generate an answer
 * @param question The question to ask
 * @param collectionName The vector store collection name
 * @param apiKeys API keys to use
 * @param modelName The model to use
 * @param enableWebSearch Whether to enable web search
 * @returns The question answer result
 */
export async function askQuestion(
  question: string,
  collectionName: string = "default", 
  apiKeys?: ApiKeys,
  modelName: string = "gpt-3.5-turbo",
  enableWebSearch: boolean = true
): Promise<QuestionAnswerResult> {
  try {
    // Set API key preference (passed in apiKeys object > env var)
    const openAiApiKey = 
      apiKeys?.openaiApiKey || 
      env.OPENAI_API_KEY;
    
    if (!openAiApiKey) {
      throw new Error("OpenAI API key is required for question answering");
    }
    
    // Check if web search is allowed
    const useWebSearch = enableWebSearch && env.WEB_SEARCH_ENABLED;
    
    // First, retrieve relevant documents from the vector store
    const retrievalResult = await queryVectorStore(question, collectionName);
    
    // If no results from vector store and web search is disabled, return error
    if ((!retrievalResult.success || !retrievalResult.results || !Array.isArray(retrievalResult.results) || retrievalResult.results.length === 0) && !useWebSearch) {
      return {
        success: false,
        error: retrievalResult.error || "No relevant documents found and web search is disabled",
      };
    }

    // If web search is enabled and there are no vector store results, we can proceed with just web search
    const hasVectorResults = retrievalResult.success && retrievalResult.results && Array.isArray(retrievalResult.results) && retrievalResult.results.length > 0;
    
    let documentContext = '';
    let prompt = '';
    let answer = '';
    let webSearchResults: WebSearchResult[] | undefined;
    
    // If we have vector store results, format them for the prompt
    if (hasVectorResults && retrievalResult.results) {
      documentContext = retrievalResult.results
        .map((result, index) => `Document ${index + 1}:\n${result.text}`)
        .join('\n\n');
      
      prompt = `
Answer the following question based on the provided documents. If the documents don't contain enough information to answer the question, ${useWebSearch ? 'you may search the web for current information.' : 'say so.'}

DOCUMENTS:
${documentContext}

QUESTION: ${question}

ANSWER:`;
    } else {
      // No vector store results, but web search is enabled
      prompt = `${question}`;
    }
    
    if (useWebSearch) {
      console.log(`Using enhanced web search capability for question: "${question}"`);
      
      // Use our enhanced OpenAI service with web search capability
      const modelResponse = await getModelResponse(prompt, null, null, true);
      
      if (!modelResponse.success) {
        throw new Error(modelResponse.error || "Failed to generate answer with web search");
      }
      
      answer = modelResponse.content || '';
      
      // Handle web search results with type safety
      if (modelResponse.webSearchResults) {
        webSearchResults = modelResponse.webSearchResults as WebSearchResult[];
      }
      
      console.log(`Web search completed: ${webSearchResults && webSearchResults.length ? webSearchResults.length : 0} results found`);
    } else {
      // Use traditional OpenAI API without web search
      console.log(`Using standard OpenAI API for question answering`);
      
      const response = await fetch(env.OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "user", content: prompt }
          ],
          max_tokens: 400,
          temperature: 0.2
        })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.choices || result.choices.length === 0) {
        throw new Error(result.error?.message || "Failed to generate answer");
      }
      
      answer = result.choices[0].message.content;
    }
    
    // Format the response with proper typing
    const response: QuestionAnswerResult = {
      success: true,
      answer: answer
      // Not explicitly setting sourceDocuments and webSearchResults to undefined
      // as they're already optional in the interface
    };
    
    // Add vector store results if available
    if (hasVectorResults && retrievalResult.results && Array.isArray(retrievalResult.results)) {
      response.sourceDocuments = retrievalResult.results.map(r => ({
        pageContent: r.text,
        metadata: r.metadata || {}
      }));
    }
    
    // Add web search results if available, with type safety
    if (webSearchResults && Array.isArray(webSearchResults) && webSearchResults.length > 0) {
      response.webSearchResults = webSearchResults;
    }
    
    return response;
  } catch (error) {
    console.error(`Error asking question: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
