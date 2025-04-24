'use client';

import React from 'react';

export const ApiKeySetupHelp = () => {
  return (
    <div className="max-w-2xl mx-auto my-6 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        API Key Setup Required
      </h2>
      
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700/30 dark:text-yellow-300">
        <p className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          This chatbot needs an OpenRouter API key to function
        </p>
      </div>
      
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        Follow these steps to set up your API key:
      </p>
      
      <ol className="mb-6 pl-5 list-decimal space-y-3 text-gray-600 dark:text-gray-300">
        <li>
          <span className="font-semibold">Sign up for OpenRouter</span>: 
          Visit <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">openrouter.ai</a> and create an account if you don&apos;t have one.
        </li>
        <li>
          <span className="font-semibold">Get your API key</span>: 
          Once logged in, go to your account settings to find or create an API key.
        </li>
        <li>
          <span className="font-semibold">Create a .env.local file</span>: 
          In the root directory of this project, create a file named <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">.env.local</code>
        </li>
        <li>
          <span className="font-semibold">Add your API key</span>: 
          In the .env.local file, add this line: <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">OPENROUTER_API_KEY=your_api_key_here</code>
        </li>
        <li>
          <span className="font-semibold">Restart the development server</span>: 
          If you&apos;re running the server locally, restart it to apply the changes.
        </li>
      </ol>
      
      <div className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
        <p>
          Note: Never commit your API keys to version control. The .env.local file is automatically ignored by Git.
        </p>
      </div>
    </div>
  );
}; 