'use client';

export const LoadingSpinner = () => {
  return (
    <div className="flex items-start ml-10 my-4">
      <div className="bg-white dark:bg-zinc-700 p-3 rounded-lg card-shadow inline-flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}; 