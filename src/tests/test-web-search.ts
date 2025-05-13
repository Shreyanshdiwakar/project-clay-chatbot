import { getModelResponse } from '../services/openai/service';
import { env } from '../config/env';

// Ensure environment is properly loaded
console.log('Running web search test...');
console.log(`OpenAI API Key configured: ${!!env.OPENAI_API_KEY && env.OPENAI_API_KEY.length > 10}`);
console.log(`Web search enabled: ${env.WEB_SEARCH_ENABLED}`);
console.log(`Primary model: ${env.PRIMARY_MODEL}`);
console.log(`OpenAI API URL: ${env.OPENAI_API_URL}`);

// Test query that requires current information
const testQuery = "What are the most recent trends in college admissions for STEM students in 2023-2024? Include specific examples from top universities.";

async function runTest() {
  try {
    console.log('Sending query:', testQuery);
    console.log('Web search enabled: true');
    
    // Call the model with web search enabled
    const response = await getModelResponse(
      testQuery,
      null, // No PDF content
      null, // No profile context
      true  // Enable web search
    );
    
    if (response.success) {
      console.log('\n===== SUCCESSFUL RESPONSE =====');
      console.log(`Model used: ${response.model || 'unknown'}`);
      console.log(`Web search attempted: ${response.webSearchAttempted ? 'YES' : 'NO'}`);
      console.log('\n===== CONTENT =====\n');
      console.log(response.content);
    } else {
      console.error('\n===== ERROR =====');
      console.error('Error:', response.error);
      console.error(`Web search attempted: ${response.webSearchAttempted ? 'YES' : 'NO'}`);
    }
    
    // Compare with a non-web search call
    console.log('\n\n===== TESTING WITHOUT WEB SEARCH =====');
    const nonWebResponse = await getModelResponse(
      testQuery,
      null,
      null,
      false // Disable web search
    );
    
    if (nonWebResponse.success) {
      console.log('\n===== NON-WEB SEARCH RESPONSE =====');
      console.log(`Model used: ${nonWebResponse.model || 'unknown'}`);
      console.log('\n===== CONTENT =====\n');
      console.log(nonWebResponse.content);
    } else {
      console.error('\n===== ERROR =====');
      console.error('Error:', nonWebResponse.error);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
runTest().catch(console.error);

/**
 * Web Search Test Script
 * 
 * This script tests the web search integration by asking questions
 * that likely require both vector store and web search to answer properly.
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// ES Module imports
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the output directory for test results
const outputDir = path.join(process.cwd(), 'test-results');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Import project modules
import { askQuestion } from '../services/langchain/retrievalChain.js';
import { env } from '../config/env.js';

// TypeScript interfaces
interface Metadata {
  filename?: string;
  [key: string]: string | number | boolean | undefined;
}

interface DocumentSource {
  pageContent: string;
  metadata: Metadata;
}

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface QuestionAnswerResult {
  success: boolean;
  error?: string;
  answer?: string;
  sourceDocuments?: DocumentSource[];
  webSearchResults?: WebSearchResult[];
}

/**
 * Format the test results for better readability
 * @param results - The results to format
 * @returns Formatted results text
 */
function formatResults(results: QuestionAnswerResult): string {
  let output = '';
  
  // Add the answer
  output += `ANSWER:\n${results.answer}\n\n`;
  
  // Add vector store sources if available
  if (results.sourceDocuments && results.sourceDocuments.length > 0) {
    output += `VECTOR STORE SOURCES (${results.sourceDocuments.length}):\n`;
    results.sourceDocuments.forEach((doc, index) => {
      output += `[${index + 1}] ${doc.metadata.filename || 'Document'}\n`;
      output += `Content: ${doc.pageContent.substring(0, 150)}...\n\n`;
    });
  } else {
    output += 'NO VECTOR STORE SOURCES FOUND\n\n';
  }
  
  // Add web search results if available
  if (results.webSearchResults && results.webSearchResults.length > 0) {
    output += `WEB SEARCH RESULTS (${results.webSearchResults.length}):\n`;
    results.webSearchResults.forEach((result, index) => {
      output += `[${index + 1}] ${result.title}\n`;
      output += `URL: ${result.url}\n`;
      output += `Snippet: ${result.snippet.substring(0, 150)}...\n\n`;
    });
  } else {
    output += 'NO WEB SEARCH RESULTS FOUND\n\n';
  }
  
  return output;
}

/**
 * Save test results to a file
 * @param testName - Name of the test
 * @param results - Results to save
 */
function saveResults(testName: string, results: string): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${testName}-${timestamp}.txt`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, results);
  console.log(`Results saved to: ${filepath}`);
}

/**
 * Run a test query and process the results
 * @param testName - Name of the test
 * @param query - The query to ask
 * @param enableWebSearch - Whether to enable web search
 * @returns Promise resolving when test is complete
 */
async function runTest(
  testName: string, 
  query: string, 
  enableWebSearch = true
): Promise<void> {
  console.log(`Running test: ${testName}`);
  console.log(`Query: ${query}`);
  console.log(`Web search enabled: ${enableWebSearch}`);
  console.log('----------------------------------------');
  
  try {
    // Make sure we have the API key configured
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured in .env file');
    }
    
    // Execute the question
    const results = await askQuestion(
      query,
      'default', // collection name
      undefined, // using environment API keys
      'gpt-3.5-turbo', // model name
      enableWebSearch // enable web search
    );
    
    if (!results.success) {
      throw new Error(results.error || 'Unknown error occurred');
    }
    
    // Format and save the results
    const formattedResults = formatResults(results);
    console.log(formattedResults);
    saveResults(testName, formattedResults);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Execute test with a query that would benefit from web search
/**
 * Execute test with queries that would benefit from web search
 * @returns Promise resolving when all tests are complete
 */
async function main(): Promise<void> {
  // Test 1: Current events query (likely to need web search)
  await runTest(
    'current-events', 
    'What are the most significant technological advancements in AI in the past year?',
    true
  );
  
  // Test 2: Compare with web search disabled
  await runTest(
    'current-events-no-web', 
    'What are the most significant technological advancements in AI in the past year?',
    false
  );
  
  // Test 3: Query with specific cited facts
  await runTest(
    'specific-facts-query',
    'Who won the most recent Olympics and when was it held? Include specific medal counts.',
    true
  );
}

// In ESM, we can use top-level await
try {
  console.log('Starting web search tests...');
  console.log('Environment web search enabled:', env.WEB_SEARCH_ENABLED ? 'Yes' : 'No');
  
  await main();
  
  console.log('All tests completed');
  process.exit(0);
} catch (error) {
  console.error('Error in test execution:', error);
  process.exit(1);
}
