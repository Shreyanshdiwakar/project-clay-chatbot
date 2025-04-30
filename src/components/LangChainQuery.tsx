'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QueryResult } from '@/services/langchain/types';

interface LangChainQueryProps {
  collection?: string;
  onError?: (error: string) => void;
}

export const LangChainQuery = ({ collection = 'default', onError }: LangChainQueryProps) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<QueryResult[] | null>(null);

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setResults(null);
    
    try {
      const response = await fetch(`/api/langchain/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          collection,
          limit: 5,
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error searching the knowledge base');
      }
      
      setResults(data.results || []);
    } catch (error) {
      console.error('Error querying vector store:', error);
      const message = error instanceof Error ? error.message : String(error);
      if (onError) {
        onError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleQuery();
    }
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search your knowledge base..."
          className="flex-1 p-2 border border-zinc-700 bg-zinc-900 rounded-l text-white"
          disabled={isLoading}
        />
        <Button
          onClick={handleQuery}
          disabled={isLoading || !query.trim()}
          className="rounded-l-none"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      
      {results && results.length > 0 ? (
        <div className="space-y-3">
          {results.map((result, index) => (
            <Card key={index} className="bg-zinc-800 border-zinc-700">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium flex justify-between">
                  <span>{result.metadata.filename || 'Document'}</span>
                  <span className="text-zinc-400 text-xs">
                    Score: {Math.round(result.score * 100)}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-zinc-300">{result.text}</p>
                {result.metadata && Object.keys(result.metadata).length > 0 && (
                  <div className="mt-2 text-xs text-zinc-400">
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(result.metadata)
                        .filter(([key]) => !['filename', 'documentId'].includes(key))
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <div key={key} className="flex">
                            <span className="font-semibold">{key}:</span>
                            <span className="ml-1 truncate">{String(value)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : results && results.length === 0 ? (
        <div className="text-center p-6 bg-zinc-800 rounded border border-zinc-700">
          <p className="text-zinc-300">No results found for your query.</p>
        </div>
      ) : null}
    </div>
  );
}; 