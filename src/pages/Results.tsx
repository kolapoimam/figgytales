import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import StoryCard from '@/components/StoryCard';
import { Button } from '@/components/Button';
import { useFiles } from '@/context/FileContext';
import { ChevronLeft, ClipboardCopy, Download, Check, Share2 } from 'lucide-react';
import { toast } from "sonner";
import HistoryList from '@/components/HistoryList';
import LoginButton from '@/components/LoginButton';

const Results: React.FC = () => {
  const { stories, clearFiles, createShareLink, user, setStories } = useFiles();
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const resetApplication = () => {
    // Clear all state and storage
    clearFiles();
    setStories([]);
    localStorage.removeItem('figgytales_stories');
    localStorage.removeItem('figgytales_files');
    localStorage.removeItem('figgytales_settings');
    
    // Force reload to ensure clean state
    window.location.href = '/';
  };

  const startOver = () => {
    resetApplication();
  };

  const generateMoreStories = () => {
    resetApplication();
  };

  const handleTitleClick = () => {
    resetApplication();
  };

  // ... rest of your component code ...

  return (
    <main className="min-h-screen flex flex-col">
      <Header onTitleClick={handleTitleClick} />
      
      {/* ... rest of your JSX ... */}
      
      {stories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No stories generated yet. Upload design files and generate stories.</p>
          <Button 
            onClick={resetApplication}
            className="mt-4"
          >
            Go to Upload
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Button 
              onClick={generateMoreStories}
              className="w-full sm:w-auto"
            >
              Generate More Stories
            </Button>
          </div>
        </>
      )}
    </main>
  );
};

export default Results;
