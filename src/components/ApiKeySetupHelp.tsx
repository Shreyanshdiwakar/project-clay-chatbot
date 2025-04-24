import React from 'react';

interface ApiKeySetupHelpProps {
  error?: string;
}

export const ApiKeySetupHelp: React.FC<ApiKeySetupHelpProps> = ({ error }) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
        ⚠️ API Key Not Configured Correctly
      </h3>
      
      {error && (
        <div className="mb-3 text-red-700 dark:text-red-300 text-sm bg-red-100 dark:bg-red-900/30 p-2 rounded border border-red-200 dark:border-red-800/50 font-mono">
          {error}
        </div>
      )}
      
      <p className="text-red-700 dark:text-red-300 mb-3">
        To fix this issue, you need to set up your OpenRouter API key properly:
      </p>
      
      <ol className="list-decimal pl-5 mb-4 text-red-700 dark:text-red-300 space-y-2">
        <li>Sign up at <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline">OpenRouter.ai</a> if you haven't already</li>
        <li>Go to the <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">API Keys section</a> and create a new key</li>
        <li>Create or edit the <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">.env.local</code> file in the project root directory</li>
        <li>Add your API key in this format:
          <pre className="bg-red-100 dark:bg-red-900/50 p-2 rounded mt-1 font-mono text-sm">OPENROUTER_API_KEY=your_actual_api_key_here</pre>
        </li>
        <li>Restart the development server after saving the file</li>
      </ol>
      
      <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-md">
        <h4 className="font-semibold text-red-800 dark:text-red-400 mb-1">Common Issues:</h4>
        <ul className="list-disc pl-5 text-red-700 dark:text-red-300 text-sm space-y-1">
          <li>Make sure you replaced <code className="bg-red-200 dark:bg-red-900/60 px-1 rounded">your_actual_api_key_here</code> with your real API key</li>
          <li>Check that your API key hasn't expired</li>
          <li>Verify you have sufficient credits in your OpenRouter account</li>
          <li>Ensure there are no spaces or quotes around your API key</li>
        </ul>
      </div>
    </div>
  );
}; 