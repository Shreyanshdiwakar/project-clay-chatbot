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
  
  const responses = [
    "**Excellent Question!**\n\nBased on your interest in college applications, here are some recommended extracurricular activities:\n\n- **Leadership Positions**: Seek roles in student government or club leadership\n- **Community Service**: Volunteer consistently with organizations aligned to your interests\n- **Academic Competitions**: Participate in subject-specific competitions relevant to your intended major\n- **Personal Projects**: Develop independent initiatives that showcase your passions\n\nRemember, colleges value depth over breadth. It's better to be deeply involved in a few activities than superficially involved in many.\n\nWhat specific field or major are you considering?",
    
    "**Great to hear from you!**\n\nHere's my advice for planning your extracurricular activities:\n\n**Focus on Quality, Not Quantity**\n- Commit deeply to 2-4 activities that genuinely interest you\n- Seek leadership roles or increasing responsibility over time\n- Maintain consistent involvement throughout high school\n\n**Align Activities with Your Interests**\n- If you love science, join science clubs, competitions, or research opportunities\n- For humanities, consider debate, writing clubs, or community service\n- For arts, develop your portfolio through continuous practice and exhibition\n\nWould you like more specific recommendations based on your particular interests?",
    
    "**Thanks for reaching out!**\n\nWhen planning extracurricular activities for college applications, consider these key strategies:\n\n1. **Demonstrate passion** through sustained commitment to activities related to your intended field of study\n2. **Show initiative** by creating new programs or expanding existing ones\n3. **Develop transferable skills** like leadership, teamwork, and problem-solving\n\n**Examples of Strong Activities:**\n- Starting a club related to your interests\n- Conducting an independent research project\n- Creating a community service initiative addressing a local need\n- Participating in selective summer programs in your field\n\nWhat grade are you in currently? This will help me provide more tailored advice."
  ];
  
  // Use the message content to pseudo-randomly select a response
  const messageHash = userMessage.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const responseIndex = messageHash % responses.length;
  
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
  
  return {
    success: true,
    content: responses[responseIndex],
    webSearchAttempted: false
  };
}

/**
 * With dataSources API, OpenAI handles web search information internally
 * No need to extract it from messages
 */
function extractWebSearchInfo(messages: any[]): WebSearchResult[] {
  // With web search capability, we don't need to extract web search info
  // OpenAI handles this internally
  return [];
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
        requestBody.tools = [{ 
          type: "web_search",
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
    
    // Send the initial request
    let response = await fetch(env.OPENAI_API_URL, {
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
    
    if (!responseData.choices || responseData.choices.length === 0 || !responseData.choices[0].message) {
      console.error('OpenAI API returned an invalid response structure:', responseData);
      return {
        success: false,
        error: 'The API response format was invalid or empty.'
      };
    }
    
    const message = responseData.choices[0].message;
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
    return {
      success: false,
      error: `API call failed: ${error instanceof Error ? error.message : String(error)}`,
      webSearchAttempted: enableWebSearch
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