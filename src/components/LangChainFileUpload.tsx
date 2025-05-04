'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, X, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';

interface LangChainFileUploadProps {
  onFileProcess: (result: any) => void;
  onError: (error: string) => void;
  isCompact?: boolean;
  disabled?: boolean;
  collection?: string;
  metadata?: Record<string, any>;
  acceptedFileTypes?: string;
}

export const LangChainFileUpload = ({ 
  onFileProcess, 
  onError, 
  isCompact = false, 
  disabled = false,
  collection = 'default',
  metadata = {},
  acceptedFileTypes = '.pdf,.csv,.docx,.txt'
}: LangChainFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      onError(`File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(10); // Start progress

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('collection', collection);
      
      // Add any additional metadata
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, value);
      });

      console.log(`Uploading file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      setUploadProgress(30); // Update progress

      const response = await fetch('/api/langchain/process-document', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(70); // Update progress

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response: ${contentType}`);
      }

      // Additional check for empty response
      if (!response.ok) {
        const statusText = response.statusText;
        throw new Error(`Server responded with ${response.status}: ${statusText}`);
      }

      setUploadProgress(90); // Almost done

      // Safely try to parse JSON
      let data;
      try {
        const text = await response.text();
        if (!text || text.trim() === '') {
          throw new Error('Empty response from server');
        }
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Invalid response format from server. Please try again.');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to process document');
      }

      console.log(`Document processed successfully. ID: ${data.documentId}, chunks: ${data.chunks}`);
      setUploadProgress(100); // Complete
      toast.success(`Document processed: ${data.chunks} chunks created`);
      onFileProcess(data);
    } catch (err) {
      console.error('Document processing error:', err);
      
      let errorMessage = err instanceof Error ? err.message : 'An error occurred processing the document';
      
      if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('<html>')) {
        errorMessage = 'The server returned an HTML error page instead of JSON. Please try again later.';
      } else if (errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Network error while uploading file. Please check your internet connection and try again.';
      } else if (errorMessage.includes('Invalid response format') || errorMessage.includes('Empty response')) {
        errorMessage = 'The API response format was invalid or empty. This may be due to missing API keys or configuration issues.';
      }
      
      toast.error(errorMessage);
      onError(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const renderProgressBar = () => {
    if (!isUploading || uploadProgress === 0) return null;
    
    return (
      <div className="w-full bg-zinc-700 rounded-full h-1.5 mt-2">
        <div 
          className="bg-green-500 h-1.5 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
    );
  };

  return (
    <div className={isCompact ? "" : "mb-4"}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="hidden"
      />
      <Button
        onClick={triggerFileUpload}
        disabled={isUploading || disabled}
        variant="outline"
        className={`${isCompact ? 'p-2' : ''} border-zinc-700 text-white hover:bg-zinc-700 hover:text-white`}
        type="button"
      >
        {isUploading ? (
          <Loader2 className={`${isCompact ? 'w-5 h-5' : 'w-5 h-5 mr-2'} animate-spin`} />
        ) : (
          <Upload className={`${isCompact ? 'w-5 h-5' : 'w-5 h-5 mr-2'}`} />
        )}
        {!isCompact && (
          <span>{isUploading ? 'Processing...' : 'Upload Document'}</span>
        )}
      </Button>
      {renderProgressBar()}
      {fileName && !isUploading && !isCompact && (
        <div className="mt-2 text-sm text-zinc-400 flex items-center">
          <Check className="w-4 h-4 mr-1 text-green-500" />
          {fileName} processed successfully
        </div>
      )}
    </div>
  );
}; 