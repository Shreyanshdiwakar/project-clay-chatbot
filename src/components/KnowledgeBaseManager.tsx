'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { LangChainFileUpload } from '@/components/LangChainFileUpload';
import { LangChainQuery } from '@/components/LangChainQuery';
import { Trash2, RefreshCw, Database, FileText, UploadCloud, Search, BarChart } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KnowledgeBaseDocument {
  documentId: string;
  metadata: {
    filename: string;
    filePath: string;
    collectionName: string;
  };
  chunks: number;
}

interface KnowledgeBaseManagerProps {
  defaultCollection?: string;
}

export function KnowledgeBaseManager({ defaultCollection = 'default' }: KnowledgeBaseManagerProps) {
  const [documents, setDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [collection, setCollection] = useState(defaultCollection);
  const [error, setError] = useState<string | null>(null);
  const [queryText, setQueryText] = useState('');

  const handleFileProcess = (result: any) => {
    setDocuments(prev => {
      // Check if document with same ID already exists
      const exists = prev.some(doc => doc.documentId === result.documentId);
      if (exists) {
        return prev.map(doc => doc.documentId === result.documentId ? result : doc);
      }
      return [...prev, result];
    });
    toast.success(`Document processed: ${result.chunks} chunks created`);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    toast.error(errorMessage);
  };

  const clearCollection = async () => {
    if (!confirm(`Are you sure you want to clear the "${collection}" collection? This will delete all documents and cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/langchain/delete-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionName: collection }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to clear collection');
      }

      setDocuments([]);
      toast.success(`Collection "${collection}" cleared successfully`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      handleError(`Error clearing collection: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-zinc-400 mt-1">
            Upload documents and ask questions about your collection.
          </p>
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={clearCollection} 
          disabled={isLoading || documents.length === 0}
          className="shrink-0"
        >
          {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
          Clear Collection
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-lg">Upload Document</CardTitle>
              </div>
              <CardDescription>
                Add documents to your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LangChainFileUpload 
                onFileProcess={handleFileProcess} 
                onError={handleError} 
                collection={collection}
              />
            </CardContent>
          </Card>

          {documents.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-emerald-400" />
                  <CardTitle className="text-lg">Collection Stats</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-800 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{documents.length}</div>
                    <div className="text-xs text-zinc-400 mt-1">Documents</div>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">
                      {documents.reduce((total, doc) => total + doc.chunks, 0)}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">Total Chunks</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Search & Documents */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-lg">Ask Questions</CardTitle>
              </div>
              <CardDescription>
                Search your documents for specific information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LangChainQuery 
                collection={collection} 
                onError={handleError}
              />
            </CardContent>
          </Card>

          {documents.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-400" />
                  <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {documents.map(doc => (
                    <div 
                      key={doc.documentId} 
                      className="flex items-center justify-between text-sm bg-zinc-800 rounded-lg p-3 hover:bg-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                          <Database className="h-4 w-4 text-zinc-300" />
                        </div>
                        <div className="truncate">
                          <div className="font-medium truncate">{doc.metadata.filename}</div>
                          <div className="text-xs text-zinc-400">ID: {doc.documentId.substring(0, 8)}...</div>
                        </div>
                      </div>
                      <div className="bg-zinc-700 px-2 py-1 rounded text-xs font-medium text-zinc-300 shrink-0">
                        {doc.chunks} chunks
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
} 