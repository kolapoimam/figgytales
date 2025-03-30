
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import PreviewGrid from '@/components/PreviewGrid';
import SettingsPanel from '@/components/SettingsPanel';
import RoadmapSection from '@/components/RoadmapSection';
import BackButton from '@/components/BackButton';
import { useFiles } from '@/context/FileContext';

const Index: React.FC = () => {
  const { clearFiles } = useFiles();
  
  // Clear any existing stories when component mounts
  useEffect(() => {
    clearFiles();
  }, [clearFiles]);
  
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20">
        <div className="my-10 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text">
            Welcome to Figgy Tales
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your design mockups into user stories with our AI-powered tool. Upload your screens and let our AI generate comprehensive user stories and acceptance criteria.
          </p>
        </div>
        
        <div className="bg-secondary/30 p-8 rounded-xl mb-10">
          <h2 className="text-2xl font-semibold mb-6 text-center">Get Started</h2>
          <FileUploader />
          <PreviewGrid />
          <SettingsPanel />
        </div>
        
        <RoadmapSection />
      </div>
    </main>
  );
};

export default Index;
