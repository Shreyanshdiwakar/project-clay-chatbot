# Academic Counselor AI Chatbot

A full-stack AI chatbot built with Next.js and Tailwind CSS that helps high school students plan their extracurricular activities for college applications.

## Features

- Chat UI with message history (user and bot messages)
- Responsive design with Tailwind CSS
- Integration with OpenRouter API using DeepSeek Chat model
- Loading spinner during API responses
- Academic counselor persona to help students with extracurricular planning
- Thinking process visualization that shows the AI's reasoning in real-time
- Interactive model information display for AI responses
- Knowledge Base with LangChain integration for document processing and semantic search
- Vector store for storing and retrieving document information
- Support for PDF, CSV, DOCX, and TXT document uploads
- Semantic search across uploaded documents

## Tech Stack

- Next.js (React framework)
- TypeScript
- Tailwind CSS
- OpenRouter API with DeepSeek Chat model
- LangChain for document processing and retrieval
- Chroma Vector Database for semantic search
- HuggingFace embeddings for document vectorization

## Getting Started

### Prerequisites

- Node.js 18.18.0 or higher
- npm or yarn
- OpenRouter API key (see below)
- Tavily API key for web search (optional)

### Getting an OpenRouter API Key

1. Sign up at [OpenRouter.ai](https://openrouter.ai)
2. After signing up, go to the [API Keys section](https://openrouter.ai/keys)
3. Create a new API key
4. Copy the API key for use in the next steps

### Getting a Tavily API Key (Optional)

1. Sign up at [Tavily.com](https://tavily.com)
2. Get your API key from the dashboard
3. Add it to your .env.local file as `TAVILY_API_KEY=your_key_here`

### Installation

1. Clone this repository:
```bash
git clone https://github.com/Shreyanshdiwakar/project-clay-ai.git
cd project-clay-ai
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Set up your OpenRouter API key using one of these methods:

#### Method 1: Using the setup script (Recommended)
```bash
node setup-env.js YOUR_API_KEY
```
Replace `YOUR_API_KEY` with your actual OpenRouter API key.

#### Method 2: Manual setup
Create a `.env.local` file in the root directory with your OpenRouter API key:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here  # Optional
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. The chatbot will greet you as an academic counselor
2. Type your questions about extracurricular activities, college planning, etc.
3. The AI will respond with helpful guidance and ask follow-up questions
4. While the AI is thinking, you'll see a visualization of its reasoning process
5. Click on the AI's avatar icon to view details about the model that generated the response

### Knowledge Base

The chatbot includes a Knowledge Base feature that allows you to:

1. Upload documents (PDF, CSV, DOCX, TXT) that contain college requirements, extracurricular activity lists, or other reference materials
2. Search across your uploaded documents using natural language queries
3. Ask questions about your documents in regular chat, with the AI retrieving relevant information

To use the Knowledge Base:

1. Navigate to the "Knowledge Base" tab
2. Upload documents using the "Upload Documents" section
3. Use the search bar to find specific information in your documents
4. View a list of all uploaded documents and their status

The Knowledge Base uses LangChain and a vector database (Chroma) to process documents, extract their content, and create embeddings for semantic search. This allows the chatbot to provide more accurate answers based on your specific documents.

## Thinking Process Visualization

The chatbot includes a feature that visualizes the "thinking process" of the AI as it generates a response. This provides users with insight into how the AI is processing their question and formulating an answer. The visualization includes:

- A typing animation showing the current thinking step
- A progress bar indicating how far along the thinking process is
- A neural network activity visualization

This makes the interaction more engaging and provides transparency into the AI's reasoning process.

## Troubleshooting

If you encounter the "No auth credentials found" error:

1. Check that your `.env.local` file exists and contains your OpenRouter API key
2. Make sure the API key is valid and formatted correctly (no quotes or spaces)
3. Ensure you've restarted the development server after adding the API key
4. Verify that your OpenRouter API key is valid and has sufficient credits

The application includes a built-in API key setup guide that will appear in the chat interface if authentication issues are detected.

### How to Fix API Key Issues

If you see authentication errors:

1. Verify your API key on the [OpenRouter dashboard](https://openrouter.ai/keys)
2. Run the setup script with your valid API key:
   ```bash
   node setup-env.js YOUR_VALID_API_KEY
   ```
3. Restart the development server
4. Clear your browser cache or try in an incognito window

## Model Information

This project uses the DeepSeek Chat model from OpenRouter API. DeepSeek Chat is a powerful large language model designed to provide human-like responses with strong reasoning capabilities.

If DeepSeek Chat is unavailable, the application will automatically fall back to using GPT-3.5-Turbo.

To use a different model from OpenRouter, you can modify the `PRIMARY_MODEL` constant in the environment configuration.

## Directory Structure

Key directories and files for the LangChain integration:

- `src/services/langchain/` - Core LangChain service files
  - `documentLoaders.ts` - Handles loading and processing documents
  - `embeddings.ts` - Manages embedding generation
  - `vectorStore.ts` - Interfaces with the Chroma vector database
  - `retrievalChain.ts` - Implements question answering functionality
  
- `src/app/api/langchain/` - API endpoints for LangChain functionality
  - `process-document/route.ts` - Handles document uploads and processing
  - `query/route.ts` - Handles vector store queries
  - `ask/route.ts` - Handles question answering

- `src/components/` - React components for LangChain UI
  - `LangChainFileUpload.tsx` - Component for uploading documents
  - `LangChainQuery.tsx` - Component for querying the vector store

## License

MIT
