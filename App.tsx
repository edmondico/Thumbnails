import React from 'react';
import ContentEngine from './components/ContentEngine';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            YouTube Viral Content Engine
          </h1>
          <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
            Analyze your idea, then generate titles, thumbnails, and a full video script.
          </p>
        </header>

        <main className="w-full">
          <ContentEngine />
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Powered by Gemini API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;