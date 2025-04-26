'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
  onFileProcess: (pdfText: string) => void;
  onError: (error: string) => void;
  isCompact?: boolean;
}

export const FileUpload = ({ onFileProcess, onError, isCompact = false }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      onError('Please upload a PDF file');
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      onError(`File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      console.log(`Uploading file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response: ${contentType}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process PDF');
      }

      if (!data.text) {
        throw new Error('No text was extracted from the PDF');
      }

      console.log(`PDF processed successfully. Extracted ${data.text.length} characters of text.`);
      onFileProcess(data.text);
    } catch (err) {
      console.error('PDF processing error:', err);
      
      let errorMessage = err instanceof Error ? err.message : 'An error occurred processing the PDF';
      
      if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('<html>')) {
        errorMessage = 'The server returned an HTML error page instead of JSON. Please try again later.';
      } else if (errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Network error while uploading PDF. Please check your internet connection and try again.';
      }
      
      onError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={isCompact ? "" : "mb-4"}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />
      <button
        onClick={triggerFileUpload}
        disabled={isUploading}
        className={`flex items-center ${isCompact ? 'space-x-0' : 'space-x-2'} bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg ${isCompact ? 'px-3 py-2' : 'px-4 py-2'} text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors`}
        type="button"
        aria-label="Upload Common App PDF"
        title="Upload Common App PDF"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={1.5} 
          stroke="currentColor" 
          className={`${isCompact ? 'w-6 h-6' : 'w-5 h-5'}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        {!isCompact && (
          <span>{isUploading ? 'Processing...' : 'Upload Common App PDF'}</span>
        )}
      </button>
      {fileName && !isUploading && !isCompact && (
        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-4 h-4 mr-1 text-green-500"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {fileName} processed successfully
        </div>
      )}
    </div>
  );
}; 