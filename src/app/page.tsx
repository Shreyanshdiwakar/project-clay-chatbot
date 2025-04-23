'use client';

import { ChatInterface } from '@/components/ChatInterface';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-primary-gradient py-6 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-white">Academic Counselor AI</h1>
              <p className="text-blue-100 mt-1">
                Plan your extracurricular activities with personalized guidance
              </p>
            </div>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-200 text-blue-800">
                Beta
              </span>
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-800 text-white">
                AI-Powered
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-[calc(100vh-10rem)]">
          <ChatInterface />
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2023 Project Clay. All rights reserved.</p>
      </footer>

      <style jsx global>{`
        .bg-primary-gradient {
          background: linear-gradient(to right, var(--primary-dark), var(--primary));
        }
      `}</style>
    </div>
  );
}
