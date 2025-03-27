import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import PreviewGrid from '@/components/PreviewGrid';
import SettingsPanel from '@/components/SettingsPanel';
import { useFiles } from '@/context/FileContext';

const Index: React.FC = () => {
  const { stories, clearFiles } = useFiles();
  const navigate = useNavigate();
  
  // Clear any existing stories when component mounts
  useEffect(() => {
    clearFiles();
    localStorage.removeItem('figgytales_stories');
  }, [clearFiles]);

  // Navigate to results page only if we have stories and came from generation
  useEffect(() => {
    if (stories.length > 0) {
      navigate('/results', { replace: true });
    }
  }, [stories, navigate]);
  
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20 stagger-children">
        <div className="animate-slide-down">
          <FileUploader />
          <PreviewGrid />
        </div>
        
        <SettingsPanel />
      </div>
    </main>
  );
};

export default Index;
