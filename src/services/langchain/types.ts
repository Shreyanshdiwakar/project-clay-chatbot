/**
 * LangChain Service Types
 */

export enum DocumentType {
  PDF = 'application/pdf',
  CSV = 'text/csv',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  TEXT = 'text/plain',
}

export interface DocumentProcessResult {
  success: boolean;
  documentId?: string;
  text?: string;
  chunks?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface VectorStoreConfig {
  collectionName: string;
  persistDirectory: string;
  embeddingModelName?: string; // Defaults to "all-MPNet-base-v2"
}

export interface QueryResult {
  text: string;
  score: number;
  metadata: Record<string, any>;
  sourceDocuments?: Array<{
    pageContent: string;
    metadata: Record<string, any>;
  }>;
}

export interface RetrievalResult {
  success: boolean;
  results?: QueryResult[];
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    totalResults: number;
  };
}

export interface WebSearchResult {
  url: string;
  title: string;
  snippet: string;
}

export interface QuestionAnswerResult {
  success: boolean;
  answer?: string;
  sourceDocuments?: Array<{
    pageContent: string;
    metadata: Record<string, any>;
  }>;
  webSearchResults?: WebSearchResult[];
  error?: string;
}

export interface ApiKeys {
  tavilyApiKey?: string;
  openaiApiKey?: string;
}