/**
 * Web Search Functionality Test
 * 
 * This script tests the web search functionality in the OpenAI service.
 * It sends a query that would benefit from web search and checks the response
 * for indications of successful web browsing and citations.
 */

import { getModelResponse } from '../services/openai/service';
import { env } from '../config/env';
import { ModelResponse } from '../services/openai/types';

/**
 * Test function for the web search functionality
 * Tests the OpenAI service's ability to perform web searches with proper configuration
 */
async function testWebSearch(): Promise<void> {
  console.log('='.repeat(80));
  console.log('STARTING WEB SEARCH FUNCTIONALITY TEST');
  console.log('='.repeat(80));
  
  // Log environment configuration
  console.log('\nEnvironment Configuration:');
  console.log('------------------------');
  console.log(`- NODE_ENV: ${env.NODE_ENV}`);
  console.log(`- Primary Model: ${env.PRIMARY_MODEL}`);
  console.log(`- Web Search Enabled: ${env.WEB_SEARCH_ENABLED ? 'Yes' : 'No'}`);
  console.log(`- OpenAI API Key configured: ${env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
  console.log(`- API URL: ${env.OPENAI_API_URL || 'Default'}`);
  console.log('------------------------\n');
  
  if (!env.OPENAI_API_KEY) {
    console.error('\nERROR: OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.');
    return;
  }
  
  if (!env.WEB_SEARCH_ENABLED) {
    console.warn('\nWARNING: Web search is disabled in environment settings. Enable WEB_SEARCH_ENABLED for this test.');
  }
  
  // A query that would benefit from web search
  const query = "What are the latest trends in college application essays for 2023-2024? Include some specific examples of successful essay topics.";
  
  console.log('\nSending test query that should trigger web search:');
  console.log(`"${query}"`);
  
  console.log('\nCalling getModelResponse with web search enabled...');
  const startTime = Date.now();
  
  try {
    const response: ModelResponse = await getModelResponse(
      query,
      null,  // no PDF content
      null,  // no profile context
      true   // enable web search
    );
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`\nResponse received in ${duration} seconds.`);
    console.log('\nResponse Details:');
    console.log('------------------------');
    console.log(`- Success: ${response.success}`);
    console.log(`- Web Search Attempted: ${response.webSearchAttempted ? 'Yes' : 'No'}`);
    console.log(`- Model Used: ${response.model || 'unknown'}`);
    console.log(`- Response Time: ${response.responseTime ? `${response.responseTime}ms` : duration + 's'}`);
    
    if (!response.success) {
      console.error('\nError Details:');
      console.error('------------------------');
      console.error(response.error);
      return;
    }
    
    // Check for signs of web search in the response
    const hasCitations = response.content.includes('Sources:') || 
                        response.content.includes('[1]') || 
                        response.content.includes('http');
    
    console.log(`- Response includes citations/sources: ${hasCitations ? 'Yes' : 'No'}`);
    
    console.log('\nResponse Content (first 500 chars):');
    console.log('-'.repeat(80));
    console.log(response.content.substring(0, 500) + (response.content.length > 500 ? '...' : ''));
    console.log('-'.repeat(80));
    
    // If response doesn't have citations but web search was attempted, this might indicate an issue
    if (!hasCitations && response.webSearchAttempted) {
      console.warn('\nWARNING: Web search was attempted but no citations were found in the response.');
      console.warn('This might indicate that the web search functionality is not working correctly.');
    }
    
    console.log('\nTEST COMPLETED SUCCESSFULLY');
  } catch (error) {
    console.error('\nTEST FAILED WITH ERROR:');
    console.error(error instanceof Error ? error.message : String(error));
    console.error('\nStack Trace:');
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }
}

// Execute the test and handle any unhandled promise rejections
testWebSearch()
  .then(() => {
    console.log('\nTest execution complete.');
  })
  .catch((error) => {
    console.error('\nUnhandled error during test execution:');
    console.error(error);
    process.exit(1);
  });
