'use client';

import React from 'react';

interface ApiKeySetupHelpProps {
  error?: string;
}

export const ApiKeySetupHelp = ({ error }: ApiKeySetupHelpProps) => {
  return (
    <div className="max-w-2xl mx-auto my-6 p-6 bg-zinc-50 border border-zinc-200 rounded-lg shadow-sm dark:bg-zinc-800 dark:border-zinc-700">
      <h2 className="text-2xl font-bold mb-4 text-zinc-800 dark:text-zinc-200">
        API Key Setup Required
      </h2>
      
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700/30 dark:text-yellow-300">
        <p className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          This chatbot needs an OpenAI API key to function
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 dark:bg-red-900/20 dark:border-red-700/30 dark:text-red-300">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Error: {error}
          </p>
        </div>
      )}
      
      <p className="mb-4 text-zinc-600 dark:text-zinc-300">
        Follow these steps to set up your API key:
      </p>
      
      <ol className="mb-6 pl-5 list-decimal space-y-3 text-zinc-600 dark:text-zinc-300">
        <li>
          <span className="font-semibold">Sign up for OpenAI</span>: 
          Visit <a href="https://platform.openai.com/signup" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">platform.openai.com</a> and create an account if you don&apos;t have one.
        </li>
        <li>
          <span className="font-semibold">Get your API key</span>: 
          Once logged in, go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">API keys</a> section to create a new secret key.
        </li>
        <li>
          <span className="font-semibold">Create a .env.local file</span>: 
          In the root directory of this project, create a file named <code className="bg-zinc-100 dark:bg-zinc-700 px-1 py-0.5 rounded text-sm">.env.local</code>
        </li>
        <li>
          <span className="font-semibold">Add your API key</span>: 
          In the .env.local file, add this line: <code className="bg-zinc-100 dark:bg-zinc-700 px-1 py-0.5 rounded text-sm">OPENAI_API_KEY=your_api_key_here</code>
        </li>
        <li>
          <span className="font-semibold">Restart the development server</span>: 
          If you&apos;re running the server locally, restart it to apply the changes.
        </li>
      </ol>
      
      <div className="text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-700 pt-4">
        <p>
          Note: Never commit your API keys to version control. The .env.local file is automatically ignored by Git.
        </p>
      </div>
    </div>
  );
}; 