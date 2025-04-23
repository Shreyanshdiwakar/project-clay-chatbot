# Academic Counselor AI Chatbot

A full-stack AI chatbot built with Next.js and Tailwind CSS that helps high school students plan their extracurricular activities for college applications.

## Features

- Chat UI with message history (user and bot messages)
- Responsive design with Tailwind CSS
- Integration with OpenRouter API using the openchat/openchat-3.5 model
- Loading spinner during API responses
- Academic counselor persona to help students with extracurricular planning

## Getting Started

### Prerequisites

- Node.js 18.18.0 or higher
- npm or yarn

### Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd projectclay-chatbot
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Create a `.env.local` file in the root directory with your OpenRouter API key:
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

## Tech Stack

- Next.js (React framework)
- TypeScript
- Tailwind CSS
- OpenRouter API with the openchat/openchat-3.5 model

## License

MIT
