import { ChatInterface } from '@/components/ChatInterface';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold">Academic Counselor AI</h1>
          <p className="text-sm opacity-80">
            Plan your extracurricular activities with personalized guidance
          </p>
        </div>
      </header>

      <main className="py-6">
        <ChatInterface />
      </main>
    </div>
  );
}
