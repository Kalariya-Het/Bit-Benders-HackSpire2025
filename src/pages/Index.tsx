
import React from 'react';
import VoiceInterface from '@/components/VoiceInterface';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-mosaic-100 to-calm-100 p-4">
      <header className="w-full max-w-lg mb-6">
        <h1 className="text-4xl font-bold text-center text-mosaic-900">
          Mike
          <span className="text-lg font-normal block mt-1 text-mosaic-600">Voice-First Emotional Check-In</span>
        </h1>
      </header>
      
      <main className="w-full flex-1 flex flex-col items-center justify-center">
        <VoiceInterface />
      </main>
      
      <footer className="mt-6 text-center text-sm text-mosaic-600">
        <p>Say "Hey Mike" to begin a conversation, or select a mode to get started</p>
        <p className="mt-2">© {new Date().getFullYear()} Mike - Multilingual Voice Assistant</p>
      </footer>
    </div>
  );
};

export default Index;
