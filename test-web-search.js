// Simple script to test web search functionality

const fetch = require('node-fetch');

async function testWebSearch() {
  console.log('Starting web search test...');
  
  try {
    // Send test request to trigger web search test mode
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'TEST_WEB_SEARCH',  // This will trigger our test query
        pdfContent: null,
        profileContext: null,
        isWebSearch: true  // Enable web search
      }),
    });
    
    // Check if the response is successful
    if (!response.ok) {
      console.error(`Error: HTTP status ${response.status}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      console.log('Web search test failed!');
      return;
    }
    
    // Parse the response
    const result = await response.json();
    
    console.log('\n=== WEB SEARCH TEST RESULTS ===');
    
    // Validate web search was attempted
    console.log(`Web search attempted: ${result.webSearchAttempted ? 'YES' : 'NO'}`);
    
    // Validate response has content
    console.log(`Has content: ${result.message ? 'YES' : 'NO'}`);
    console.log(`Content length: ${result.message?.length || 0} characters`);
    
    // Validate web search results
    console.log(`Web search results included: ${result.webSearchResults?.length ? 'YES' : 'NO'}`);
    console.log(`Number of search results: ${result.webSearchResults?.length || 0}`);
    
    // Log a sample of the content
    if (result.message) {
      console.log('\nContent sample:');
      console.log(result.message.substring(0, 200) + '...');
    }
    
    // Log a sample of web search results if available
    if (result.webSearchResults?.length) {
      console.log('\nSearch results sample:');
      console.log(JSON.stringify(result.webSearchResults[0], null, 2));
    }
    
    console.log('\nWeb search test completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
    console.log('Web search test failed!');
  }
}

// Run the test
testWebSearch();

