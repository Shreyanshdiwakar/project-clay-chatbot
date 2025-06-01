import { env } from '@/config/env';
import { 
  ChatCompletionRequest, 
  ChatCompletionResponse, 
  ApiErrorResponse,
  ModelResponse,
} from './types';
import { WebSearchResult } from '../langchain/types';
import { EDUCATIONAL_CONSULTANT_PROMPT } from './system-prompt';
import fetch from 'node-fetch';

// Define Tool type for web browsing capabilities
type Tool = {
  type: string;  // Tool type (e.g., "retrieval", "function")
  function?: {   // Required for function tools
    name: string;
    description: string;
    parameters?: Record<string, any>;
  };
};

// Interface for ChatCompletionRequest with web search tools
interface ChatCompletionOptions extends ChatCompletionRequest {
  tools?: Tool[];  // Add tools parameter for web browsing capability
  tool_choice?: "auto" | "none";  // Control when tools are used
}

// Configuration for timeout and retry
const FETCH_TIMEOUT_MS = 60000; // 60 seconds timeout
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds

// Using OpenAI's built-in web browsing capability instead of external search API

export function createSystemPrompt(pdfContent?: string | null, profileContext?: string | null, webAccessEnabled?: boolean): string {
  // Use the educational consultant prompt as the base system prompt
  let systemPrompt = EDUCATIONAL_CONSULTANT_PROMPT;

  // If web access is enabled, add that to the system prompt
  if (webAccessEnabled) {
    systemPrompt += `\n\n**IMPORTANT - WEB SEARCH:**

You have the ability to search the web to find current and accurate information for this query.
Ensure you cite your sources and provide specific examples from current information.

Key points to address:
1. Use current information from reliable sources
2. Include specific examples and data points
3. Cite your sources with links where possible
4. Ensure the information is up-to-date

For competitions, scholarships and educational opportunities, include:
- Complete and accurate name of the opportunity
- Direct website links in markdown format: [Name](https://example.com)
- Eligibility requirements
- Upcoming deadlines where available
- Brief description of what makes this opportunity valuable`;
  }

  if (profileContext) {
    systemPrompt += `\n\n**IMPORTANT - STUDENT PROFILE FROM QUESTIONNAIRE:**
    
${profileContext}

Use the above student profile information to provide personalized advice specifically tailored to this student's background, interests, and academic goals. Reference specific details from their profile when relevant.`;
  }

  if (pdfContent) {
    const maxPdfLength = 12000;
    const truncatedPdf = pdfContent.length > maxPdfLength
      ? pdfContent.substring(0, maxPdfLength) + "... [PDF content truncated]"
      : pdfContent;
  
    systemPrompt += `\n\n**IMPORTANT - STUDENT PROFILE FROM DOCUMENT:**
    
${truncatedPdf}

Use the above document information to provide personalized advice specifically tailored to this student's background, interests, and accomplishments. Reference specific details from their profile when relevant.`;
  }

  return systemPrompt;
}

/**
 * Formats the model's response content to include proper citations from web search results
 * 
 * @param content The original content from the model
 * @param webSearchResults Array of web search results with URLs, titles, and snippets
 * @returns Formatted content with citations as footnotes
 */
function formatContentWithCitations(content: string, webSearchResults: WebSearchResult[]): string {
  if (!content || !webSearchResults || !Array.isArray(webSearchResults) || webSearchResults.length === 0) {
    return content || '';
  }

  // Create a mapping of domains to citation numbers
  const urlMap = new Map<string, number>();
  
  // Extract domains from URLs for simpler citation
  webSearchResults.forEach((result, index) => {
    try {
      const url = new URL(result.url);
      const domain = url.hostname.replace(/^www\./, '');
      if (!urlMap.has(domain)) {
        urlMap.set(domain, index + 1);
      }
    } catch (e) {
      console.warn(`Invalid URL in web search result: ${result.url}`);
    }
  });

  // Add footnotes section at the end of the content
  let formattedContent = content;

  // Only add the citations section if we have valid URLs
  if (urlMap.size > 0) {
    formattedContent += '\n\n---\n\n**Sources:**\n\n';
    
    webSearchResults.forEach((result, index) => {
      try {
        const url = new URL(result.url);
        const domain = url.hostname.replace(/^www\./, '');
        const citationNumber = urlMap.get(domain);
        
        if (citationNumber !== undefined) {
          formattedContent += `[${citationNumber}] ${result.title || domain} - ${result.url}\n`;
          
          // Remove this domain from the map so we don't list it again
          urlMap.delete(domain);
        }
      } catch (e) {
        // Skip invalid URLs
      }
    });
  }

  return formattedContent;
}

// Mock response function for development when API key is missing
function getMockResponse(userMessage: string): ModelResponse {
  console.log('Using mock response for development');
  
  // Check if request is for project or competition details in JSON format
  if (userMessage.toLowerCase().includes('project') && 
      userMessage.toLowerCase().includes('json')) {
    
    console.log('Returning mock JSON project details');
    
    // Create a properly formatted JSON string for project details
    const mockProjectDetails = {
      title: "Environmental Monitoring System",
      description: "A comprehensive IoT-based system for monitoring environmental factors such as air quality, temperature, and humidity in urban areas.",
      difficultyLevel: "Intermediate",
      timeCommitment: "3-4 months",
      skillsRequired: ["Arduino programming", "Sensor integration", "Data analysis", "Cloud computing"],
      materialsCost: "$150-200",
      impactAreas: ["Environmental science", "Public health", "Urban planning"],
      learningOutcomes: ["Hardware-software integration", "Environmental data analysis", "IoT system design"],
      implementationSteps: [
        "Research and select appropriate environmental sensors",
        "Design and build the sensor housing and circuit",
        "Program the microcontroller for data collection",
        "Develop a web dashboard for data visualization",
        "Deploy multiple units across different locations"
      ],
      additionalResources: [
        {
          title: "Arduino Environmental Monitoring Guide",
          url: "https://example.com/arduino-guide"
        },
        {
          title: "IoT Cloud Platforms Comparison",
          url: "https://example.com/iot-cloud-comparison"
        }
      ]
    };
    
    return {
      success: true,
      content: JSON.stringify(mockProjectDetails),
      webSearchAttempted: false,
      model: "gpt-4.1-mini"
    };
  }
  
  // Check if request is for competition details in JSON format
  if (userMessage.toLowerCase().includes('competition') && 
      userMessage.toLowerCase().includes('json')) {
    
    console.log('Returning mock JSON competition details');
    
    // Create a properly formatted JSON string for competition details
    const mockCompetitionDetails = {
      name: "International Science and Engineering Fair (ISEF)",
      organizer: "Society for Science",
      website: "https://www.societyforscience.org/isef/",
      description: "The world's largest pre-college science competition that provides a platform for high school students to showcase their independent research.",
      eligibility: "High school students grades 9-12",
      deadline: "Varies by region, typically January-February for local fairs",
      prizes: ["Grand Award: $75,000", "Category Awards: $5,000-$50,000", "Special Awards from various organizations"],
      categories: ["Animal Sciences", "Behavioral Sciences", "Biochemistry", "Biomedical Engineering", "Cellular & Molecular Biology", "Chemistry", "Computational Biology", "Computer Science", "Earth & Environmental Sciences", "Engineering", "Materials Science", "Mathematics", "Microbiology", "Physics", "Plant Sciences", "Robotics"],
      applicationProcess: [
        "Participate in a local or regional science fair",
        "Win nomination to attend ISEF from your regional fair",
        "Complete the ISEF application forms",
        "Prepare your research paper and presentation materials"
      ],
      tips: [
        "Start your project early, ideally 6-12 months before the fair",
        "Find a mentor in your research area",
        "Document your process thoroughly in a research notebook",
        "Practice your presentation skills extensively"
      ]
    };
    
    return {
      success: true,
      content: JSON.stringify(mockCompetitionDetails),
      webSearchAttempted: false,
      model: "gpt-4.1-mini"
    };
  }
  
  const responses = [
    "**Excellent Question!**\n\nBased on your interest in college applications, here are some recommended extracurricular activities:\n\n- **Leadership Positions**: Seek roles in student government or club leadership\n- **Community Service**: Volunteer consistently with organizations aligned to your interests\n- **Academic Competitions**: Participate in subject-specific competitions relevant to your intended major\n- **Personal Projects**: Develop independent initiatives that showcase your passions\n\nRemember, colleges value depth over breadth. It's better to be deeply involved in a few activities than superficially involved in many.\n\nWhat specific field or major are you considering?",
    
    "**Great to hear from you!**\n\nHere's my advice for planning your extracurricular activities:\n\n**Focus on Quality, Not Quantity**\n- Commit deeply to 2-4 activities that genuinely interest you\n- Seek leadership roles or increasing responsibility over time\n- Maintain consistent involvement throughout high school\n\n**Align Activities with Your Interests**\n- If you love science, join science clubs, competitions, or research opportunities\n- For humanities, consider debate, writing clubs, or community service\n- For arts, develop your portfolio through continuous practice and exhibition\n\nWould you like more specific recommendations based on your particular interests?",
    
    "**Thanks for reaching out!**\n\nWhen planning extracurricular activities for college applications, consider these key strategies:\n\n1. **Demonstrate passion** through sustained commitment to activities related to your intended field of study\n2. **Show initiative** by creating new programs or expanding existing ones\n3. **Develop transferable skills** like leadership, teamwork, and problem-solving\n\n**Examples of Strong Activities:**\n- Starting a club related to your interests\n- Conducting an independent research project\n- Creating a community service initiative addressing a local need\n- Participating in selective summer programs in your field\n\nWhat grade are you in currently? This will help me provide more tailored advice."
  ];
  
  // Create a mock web search if the question seems to ask for competitions
  if (userMessage.toLowerCase().includes('competition') || 
      userMessage.toLowerCase().includes('olympiad') || 
      userMessage.toLowerCase().includes('contest')) {
    
    return {
      success: true,
      content: `Based on your interests, here are some academic competitions to consider:\n\n1. [International Science and Engineering Fair (ISEF)](https://www.societyforscience.org/isef/) - The world's largest pre-college science competition.\n\n2. [The Breakthrough Junior Challenge](https://breakthroughjuniorchallenge.org/) - A global competition for students to inspire creative thinking about science.\n\n3. [International Mathematical Olympiad (IMO)](https://www.imo-official.org/) - The world championship mathematics competition for high school students.\n\n4. [DECA International Career Development Conference](https://www.deca.org/) - Business-focused competition for emerging leaders and entrepreneurs.`,
      webSearchAttempted: true,
      webSearchResults: [
        {
          title: "International Science and Engineering Fair",
          url: "https://www.societyforscience.org/isef/",
          snippet: "The International Science and Engineering Fair (ISEF) is the world's largest international pre-college science competition."
        },
        {
          title: "The Breakthrough Junior Challenge",
          url: "https://breakthroughjuniorchallenge.org/",
          snippet: "An annual global competition for students to inspire creative thinking about science."
        }
      ],
      model: "gpt-4.1-mini"
    };
  }
  
  // Use the message content to pseudo-randomly select a response
  const messageHash = userMessage.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const responseIndex = messageHash % responses.length;
  
  return {
    success: true,
    content: responses[responseIndex],
    webSearchAttempted: false
  };
}

/**
 * Performs a web search based on tool call arguments and returns the results
 */
async function performWebSearch(query: string): Promise<WebSearchResult[]> {
  // In a real implementation, this would connect to a search API like Google, Bing, or a specialized service
  // For now, we'll return some mock results
  console.log(`Performing mock web search for: ${query}`);
  
  // Check if the query contains certain keywords to return more specific mock results
  if (query.toLowerCase().includes('college') || query.toLowerCase().includes('university')) {
    return [
      {
        title: "QS World University Rankings 2025: Top Global Universities",
        url: "https://www.topuniversities.com/university-rankings/world-university-rankings/2025",
        snippet: "The latest QS World University Rankings 2025 feature over 1,500 universities from around the world. MIT, Stanford, and Oxford lead the rankings."
      },
      {
        title: "The World's Top 100 Universities | US News Best Global Universities",
        url: "https://www.usnews.com/education/best-global-universities/rankings",
        snippet: "Find the world's top universities ranked by academic reputation, employer reputation, and research impact. Harvard, MIT, and Stanford are consistently ranked highly."
      },
      {
        title: "Times Higher Education World University Rankings 2025",
        url: "https://www.timeshighereducation.com/world-university-rankings/2025",
        snippet: "The Times Higher Education World University Rankings 2025 include over 1,900 universities across 108 countries, making them the largest international university rankings."
      }
    ];
  } else if (query.toLowerCase().includes('competition') || 
             query.toLowerCase().includes('scholarship')) {
    return [
      {
        title: "Top Academic Competitions for High School Students 2025",
        url: "https://www.collegeconfidential.com/academic-competitions",
        snippet: "Comprehensive guide to prestigious academic competitions including Regeneron Science Talent Search, International Mathematical Olympiad, and National Speech & Debate Tournament."
      },
      {
        title: "Merit Scholarships at Top Universities - Class of 2025",
        url: "https://www.collegetransitions.com/scholarships/merit-scholarships",
        snippet: "Guide to finding and applying for merit-based scholarships at prestigious universities for the class of 2025."
      }
    ];
  }
  
  // Default generic results
  return [
    {
      title: "Search Result 1",
      url: "https://example.com/result1",
      snippet: "This is the first search result snippet with relevant information."
    },
    {
      title: "Search Result 2",
      url: "https://example.com/result2",
      snippet: "This is the second search result snippet with more information."
    }
  ];
}

/**
 * Fetch with timeout and retry logic
 * @param url The URL to fetch
 * @param options Fetch options
 * @param timeoutMs Timeout in milliseconds
 * @param retryCount Current retry count
 * @returns The fetch response
 */
async function fetchWithRetry(
  url: string, 
  options: any, 
  timeoutMs = FETCH_TIMEOUT_MS, 
  retryCount = 0
): Promise<Response> {
  // Create an AbortController to handle timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Add the signal to the options
    const fetchOptions = {
      ...options,
      signal: controller.signal
    };

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    // If we get a rate limit or server error, retry with exponential backoff
    if (
      (response.status === 429 || response.status >= 500) && 
      retryCount < MAX_RETRIES
    ) {
      const delay = Math.min(
        INITIAL_RETRY_DELAY * Math.pow(2, retryCount),
        MAX_RETRY_DELAY
      );
      
      console.log(`Request failed with status ${response.status}. Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, timeoutMs, retryCount + 1);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // If we got an abort error due to timeout
    if (error.name === 'AbortError') {
      if (retryCount < MAX_RETRIES) {
        const delay = Math.min(
          INITIAL_RETRY_DELAY * Math.pow(2, retryCount),
          MAX_RETRY_DELAY
        );
        
        console.log(`Request timed out after ${timeoutMs}ms. Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, timeoutMs, retryCount + 1);
      } else {
        throw new Error(`Request timed out after ${retryCount + 1} attempts`);
      }
    }
    
    // For other errors
    throw error;
  }
}

// Helper function to handle OpenAI function calls
async function handleFunctionCalls(toolCalls: any[]): Promise<{name: string; content: string;}[]> {
  const results: {name: string; content: string;}[] = [];
  const webSearchResults: WebSearchResult[] = [];
  
  for (const toolCall of toolCalls) {
    if (toolCall.type !== 'function') continue;
    
    const functionName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments || '{}');
    
    if (functionName === 'web_search') {
      console.log(`Processing web_search function call with arguments:`, args);
      // Default query to empty string if not provided
      const query = args.query || '';
      const searchResults = await performWebSearch(query);
      
      // Store search results for later use
      webSearchResults.push(...searchResults);
      
      // Format results as JSON string
      const resultContent = JSON.stringify(searchResults);
      
      results.push({
        name: functionName,
        content: resultContent
      });
    }
  }
  
  return results;
}

export async function callOpenAIAPI(
  model: string, 
  userMessage: string, 
  pdfContent?: string | null,
  profileContext?: string | null,
  enableWebSearch?: boolean
): Promise<ModelResponse> {
  try {
    console.log(`Sending request to OpenAI API using ${model}...`);
    
    const apiKey = env.OPENAI_API_KEY;
    
    // Check if we have a valid API key (should start with 'sk-')
    if (!apiKey || !apiKey.startsWith('sk-') || apiKey === 'invalid-key-use-mock-responses') {
      console.log('Valid API key not configured - using mock response for development');
      return getMockResponse(userMessage);
    }
    
    console.log(`API key configured: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // Check if web search is enabled both via parameter and environment setting
    const useWebSearch = enableWebSearch && env.WEB_SEARCH_ENABLED;
    
    // If web search is enabled, ensure we're using a model that supports browsing
    if (useWebSearch) {
      // Use the configured browsing model from environment
      model = env.WEB_BROWSING_MODEL;
      console.log(`Web search enabled, using model with browsing support: ${model}`);
      
      // Ensure we're using GPT-4.1 Mini for web search
      if (model !== 'gpt-4.1-mini') {
        console.log(`Using GPT-4.1 Mini for web search`);
        model = 'gpt-4.1-mini';
      }
    }
    
    const systemPrompt = createSystemPrompt(pdfContent, profileContext, useWebSearch);

    // Prepare user message - only add search instruction if web search is enabled
    let enhancedUserMessage = userMessage;
    if (useWebSearch) {
      const searchInstruction = "Please search the web for current information before answering to ensure your response is accurate and up-to-date. For competitions, scholarships, or educational opportunities, include specific details and direct website links in markdown format.";
      enhancedUserMessage = `${searchInstruction}\n\n${userMessage}`;
    }
    
    // Create base request body with simple text response format
    const requestBody: ChatCompletionOptions = {
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: enhancedUserMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };
    
    // Only add tools configuration when web search is enabled
    if (useWebSearch) {
      console.log('Web search enabled, configuring tools for API request');
      
      try {
        // Fixed: Changed "web_search" to "function" for the type
        requestBody.tools = [{ 
          type: "function",
          function: {
            name: "web_search",
            description: "Search the web for current information"
          }
        }];
        requestBody.tool_choice = "auto";
        console.log('Using web_search tool configuration');
      } catch (toolError) {
        console.warn('Error configuring web search tools:', toolError);
        // Continue without tools on error to ensure the request still works
        delete requestBody.tools;
        delete requestBody.tool_choice;
      }
    }
    // When web search is disabled, we don't need to add any tools configuration
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v1'  // Add this header for all requests to ensure latest API features
    };
    
    console.log('OpenAI request headers:', JSON.stringify({
      'Content-Type': headers['Content-Type'],
      'Authorization': 'Bearer ***',
      'OpenAI-Beta': headers['OpenAI-Beta']
    }));
    
    // Log the request body with special handling for tools to ensure they're properly serialized
    const logRequestBody = {
      ...requestBody,
      messages: [
        { role: 'system', content: '(system prompt, truncated for logs)' },
        { role: 'user', content: userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : '') }
      ]
    };
    
    console.log('OpenAI request body:', JSON.stringify(logRequestBody, null, 2));
    
    // Final stringified request body for debugging
    const requestJson = JSON.stringify(requestBody);
    console.log('Final request JSON length:', requestJson.length);
    
    // Send the initial request with timeout and retry logic
    let response = await fetchWithRetry(env.OPENAI_API_URL, {
      method: 'POST',
      headers,
      body: requestJson,
    });
    
    if (!response.ok) {
      let errorText: string;
      let errorData: any = null;
      
      try {
        // Try to get detailed error information
        const errorResponse = await response.text();
        try {
          // Try to parse as JSON first
          errorData = JSON.parse(errorResponse);
          errorText = errorData.error?.message || `Error ${response.status}: ${response.statusText}`;
          
          // Log any general API errors
          if (useWebSearch) {
            console.error('Web search-related error detected:', errorText);
          }
        } catch (jsonError) {
          // If JSON parsing fails, use the raw text
          errorText = errorResponse;
          console.error('Non-JSON error response:', 
            errorText.substring(0, 200) + (errorText.length > 200 ? '...' : ''));
        }
      } catch (textError) {
        // If we can't even get text, fall back to status only
        errorText = `Error ${response.status}: ${response.statusText}`;
      }
      
      // Log more detailed error information
      if (useWebSearch) {
        console.error(`OpenAI API web search error (${response.status}):`, errorText.substring(0, 500));
        console.error('Web search request details:', {
          model
        });
      }
      
      console.error(`OpenAI API error (${response.status}):`, errorText.substring(0, 500));
      
      // If this is an unauthorized error (401), provide more guidance
      if (response.status === 401) {
        return {
          success: false,
          error: `Authentication error: ${errorText.substring(0, 200)}. Please check your OpenAI API key and ensure it has proper permissions.`,
          webSearchAttempted: useWebSearch
        };
      }
      
      return {
        success: false,
        error: `OpenAI API returned status ${response.status}: ${errorText.substring(0, 200)}${errorText.length > 200 ? '...' : ''}`,
        webSearchAttempted: useWebSearch
      };
    }
    
    let responseData = await response.json() as ChatCompletionResponse;
    console.log('Initial OpenAI API response:', JSON.stringify(responseData, null, 2));
    
    if (!responseData.choices || responseData.choices.length === 0) {
      console.error('OpenAI API returned an invalid response structure:', responseData);
      return {
        success: false,
        error: 'The API response format was invalid or empty.'
      };
    }
    
    const message = responseData.choices[0].message;
    
    // Handle tool calls (e.g., web search)
    if (message.tool_calls && message.tool_calls.length > 0) {
      console.log('Tool calls detected in the response. Handling tool calls...');
      
      // Process tool calls (e.g., web search)
      const toolResults = await handleFunctionCalls(message.tool_calls);
      
      // Prepare messages for the follow-up request
      const followUpMessages = [
        ...requestBody.messages,
        {
          role: 'assistant',
          content: null,
          tool_calls: message.tool_calls
        }
      ];
      
      // Add tool results as messages
      for (const tool of toolResults) {
        followUpMessages.push({
          role: 'tool',
          content: tool.content,
          name: tool.name
        });
      }
      
      // Create the follow-up request
      console.log('Sending follow-up request with tool results...');
      
      // Log the follow-up messages (truncated for clarity)
      const logFollowUpMessages = followUpMessages.map(m => {
        if (m.role === 'tool') {
          return {
            ...m,
            content: m.content.substring(0, 100) + (m.content.length > 100 ? '...' : '')
          };
        }
        if (m.role === 'system') {
          return {
            ...m,
            content: '(system prompt, truncated for logs)'
          };
        }
        return m;
      });
      console.log('Follow-up messages:', JSON.stringify(logFollowUpMessages, null, 2));
      
      // Remove tools configuration for follow-up request
      // We don't want to trigger tools again in the final answer
      const followUpRequest = {
        model: model,
        messages: followUpMessages,
        temperature: 0.7,
        max_tokens: 1000
      };
      
      // Send the follow-up request with retry logic
      const followUpResponse = await fetchWithRetry(env.OPENAI_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(followUpRequest),
      });
      
      if (!followUpResponse.ok) {
        console.error('Follow-up request failed:', followUpResponse.status, followUpResponse.statusText);
        return {
          success: false,
          error: `Follow-up request failed: ${followUpResponse.status} ${followUpResponse.statusText}`,
          webSearchAttempted: true
        };
      }
      
      const followUpData = await followUpResponse.json();
      console.log('Follow-up response:', JSON.stringify(followUpData, null, 2));
      
      if (!followUpData.choices || followUpData.choices.length === 0 || !followUpData.choices[0].message) {
        console.error('Invalid follow-up response format:', followUpData);
        return {
          success: false,
          error: 'Invalid follow-up response format',
          webSearchAttempted: true
        };
      }
      
      const finalContent = followUpData.choices[0].message.content?.trim() || '';
      
      // Extract web search results from tool results
      const webSearchResults: WebSearchResult[] = [];
      for (const tool of toolResults) {
        if (tool.name === 'web_search') {
          try {
            const results = JSON.parse(tool.content);
            if (Array.isArray(results)) {
              webSearchResults.push(...results);
            }
          } catch (e) {
            console.warn('Error parsing web search results:', e);
          }
        }
      }
      
      // Return the final response with web search results
      return {
        success: true,
        content: finalContent,
        webSearchAttempted: true,
        webSearchResults: webSearchResults.length > 0 ? webSearchResults : undefined,
        model: followUpData.model || model,
        toolCallsMade: message.tool_calls?.length || 0,
        responseTime: Date.now() - new Date(responseData.created * 1000).getTime()
      };
    }
    
    const content = message.content?.trim() || '';
    
    // Special handling for empty content
    if (!content) {
      console.error('OpenAI API returned an empty message content');
      return {
        success: false,
        error: 'The API returned an empty message with no content.',
        webSearchAttempted: useWebSearch
      };
    }
    
    // Return the final response with additional metadata
    return {
      success: true,
      content,
      webSearchAttempted: useWebSearch,
      model: responseData.model || model,
      // Include response metadata to help with debugging
      responseTime: Date.now() - new Date(responseData.created * 1000).getTime()
    };
  } catch (error) {
    console.error(`Error while using model ${model}:`, error);
    
    // Determine if it's a timeout error
    const isTimeoutError = error.name === 'AbortError' || error.message?.includes('timeout');
    const errorMessage = isTimeoutError
      ? `Request timed out after multiple attempts. This might be due to the complexity of your query or server load.`
      : `API call failed: ${error instanceof Error ? error.message : String(error)}`;
    
    return {
      success: false,
      error: errorMessage,
      webSearchAttempted: enableWebSearch,
      isTimeout: isTimeoutError
    };
  }
}

export async function getModelResponse(
  userMessage: string, 
  pdfContent?: string | null,
  profileContext?: string | null,
  webSearch: boolean = true
): Promise<ModelResponse> {
  // For development without API key, use mock response
  if (!env.OPENAI_API_KEY || !env.OPENAI_API_KEY.startsWith('sk-') || env.OPENAI_API_KEY === 'invalid-key-use-mock-responses') {
    console.log('Valid API key not configured - using mock response for development');
    return getMockResponse(userMessage);
  }

  // Check if web search is enabled in the environment
  let enableWebSearch = webSearch && env.WEB_SEARCH_ENABLED;
  
  // Select the appropriate model - always use GPT-4.1 Mini
  const selectedModel = 'gpt-4.1-mini';
  
  console.log(`Using ${selectedModel} with web search ${enableWebSearch ? 'enabled' : 'disabled'}`);
  let response = await callOpenAIAPI(selectedModel, userMessage, pdfContent, profileContext, enableWebSearch);
  
  // Only attempt fallback if web search was enabled and failed
  if (!response.success && enableWebSearch) {
    const errorMessage = response.error || "No content was returned";
    console.log(`Web search attempt failed with error: ${errorMessage}. Trying without web search...`);
    
    // Add warning about web search failure to the next attempt
    const modifiedMessage = `${userMessage}\n\nNote: I attempted to search the web for more information but encountered a technical issue. This response is based on my training knowledge.`;
    
    console.log(`Fallback: Using ${env.PRIMARY_MODEL} with web search disabled`);
    response = await callOpenAIAPI(env.PRIMARY_MODEL, modifiedMessage, pdfContent, profileContext, false);
  } else if (!response.success) {
    console.log(`API request failed: ${response.error}`);
  }
  
  return response;
}