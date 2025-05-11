/**
 * LangChain Service
 * 
 * This is the main entry point for the LangChain service.
 * It exports all components needed for using LangChain functionality.
 */

export * from './documentLoaders';
export * from './vectorStore';
export * from './embeddings';
export * from './retrievalChain';
export * from './types';

// Re-export the most commonly used functions
import { processDocument } from './documentLoaders';
import { createVectorStore, queryVectorStore } from './vectorStore';
import { getEmbeddings } from './embeddings';

export default {
  processDocument,
  createVectorStore,
  queryVectorStore,
  getEmbeddings,
}; 