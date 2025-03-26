import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import PreviewGrid from '@/components/PreviewGrid';
import SettingsPanel from '@/components/SettingsPanel';
import { useFiles } from '@/context/FileContext';

const Index: React.FC = () => {
  const { stories, clearFiles } = useFiles(); // Added clearFiles
  const navigate = useNavigate();
  const [lastStoryCount, setLastStoryCount] = useState(stories.length);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load

  // Handle navigation to results only when new stories are added after initial load
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false); // Mark initial load as complete
      setLastStoryCount(stories.length); // Sync lastStoryCount on load
      return; // Skip navigation on initial load
    }

    if (stories.length > 0 && stories.length > lastStoryCount) {
      navigate('/results');
    }
    setLastStoryCount(stories.length);
  }, [stories, navigate, lastStoryCount, isInitialLoad]);

  // Optional: Clear stories when intentionally navigating to home
  useEffect(() => {
    const handleLoad = () => {
      if (window.location.pathname === '/') {
        clearFiles(); // Reset stories when loading home page
      }
    };
    handleLoad();
  }, [clearFiles]);

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
