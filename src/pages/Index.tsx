
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20 stagger-children">
        <div className="flex justify-start my-4">
          <BackButton />
        </div>
        
        <div className="animate-slide-down">
          <FileUploader />
          <PreviewGrid />
        </div>
        
        <SettingsPanel />
        
        <RoadmapSection />
      </div>
    </main>
  );
};

export default Index;
