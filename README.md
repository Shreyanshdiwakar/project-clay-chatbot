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

## Tech Stack

- Next.js (React framework)
- TypeScript
- Tailwind CSS
- OpenRouter API with DeepSeek Chat model

## Getting Started

### Prerequisites

- Node.js 18.18.0 or higher
- npm or yarn
- OpenRouter API key (see below)

### Getting an OpenRouter API Key

1. Sign up at [OpenRouter.ai](https://openrouter.ai)
2. After signing up, go to the [API Keys section](https://openrouter.ai/keys)
3. Create a new API key
4. Copy the API key for use in the next steps

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

To use a different model from OpenRouter, you can modify the `PRIMARY_MODEL` constant in `src/app/api/chat/route.ts`.

## License

MIT
