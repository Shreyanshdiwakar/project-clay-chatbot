/**
 * Simple Retrieval Service
 * 
 * This module provides a basic question answering system that uses
 * the vector store to find relevant documents and then uses the API
 * to generate an answer.
 */

import { env } from "@/config/env";
import { queryVectorStore } from "./vectorStore";
import { ApiKeys } from "./types";

/**
 * Ask a question using direct API call to generate an answer
 */
export async function askQuestion(
  question: string,
  collectionName = "default", 
  apiKeys?: ApiKeys,
  modelName = "gpt-3.5-turbo"
) {
  try {
    // Set API key preference (passed in apiKeys object > env var)
    const openAiApiKey = 
      apiKeys?.openaiApiKey || 
      env.OPENAI_API_KEY;
    
    if (!openAiApiKey) {
      throw new Error("OpenAI API key is required for question answering");
    }
    
    // First, retrieve relevant documents from the vector store
    const retrievalResult = await queryVectorStore(question, collectionName);
    
    if (!retrievalResult.success || !retrievalResult.results || retrievalResult.results.length === 0) {
      return {
        success: false,
        error: retrievalResult.error || "No relevant documents found",
      };
    }
    
    // Format the retrieved documents for the prompt
    const documentContext = retrievalResult.results
      .map((result, index) => `Document ${index + 1}:\n${result.text}`)
      .join('\n\n');
    
    // Create a prompt with the retrieved documents and the question
    const prompt = `
Answer the following question based on the provided documents. If the documents don't contain enough information to answer the question, say so.

DOCUMENTS:
${documentContext}

QUESTION: ${question}

ANSWER:`;
    
    // Call the OpenAI API directly
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
    
    const answer = result.choices[0].message.content;
    
    // Format the response
    return {
      success: true,
      answer: answer,
      sourceDocuments: retrievalResult.results.map(r => ({
        pageContent: r.text,
        metadata: r.metadata
      })),
    };
  } catch (error) {
    console.error(`Error asking question: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
} 