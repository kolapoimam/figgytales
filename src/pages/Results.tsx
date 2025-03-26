import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import StoryCard from '@/components/StoryCard';
import { Button } from '@/components/Button';
import { useFiles } from '@/context/FileContext';
import { ChevronLeft, ClipboardCopy, Download, Check, Share2 } from 'lucide-react';
import { toast } from "sonner";
import HistoryList from '@/components/HistoryList';
import LoginButton from '@/components/LoginButton';

interface Story {
  id: string;
  title: string;
  description: string;
  criteria: { description: string }[];
}

const Results: React.FC = () => {
  const { 
    stories, 
    clearFiles, 
    createShareLink, 
    user 
  } = useFiles();
  
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [localStories, setLocalStories] = useState<Story[]>([]);

  // Initialization logic
  useEffect(() => {
    // Prioritize context stories, then localStorage
    const savedStoriesJson = localStorage.getItem('figgytales_stories');
    
    if (stories && stories.length > 0) {
      setLocalStories(stories);
      localStorage.setItem('figgytales_stories', JSON.stringify(stories));
    } else if (savedStoriesJson) {
      try {
        const savedStories = JSON.parse(savedStoriesJson);
        if (Array.isArray(savedStories) && savedStories.length > 0) {
          setLocalStories(savedStories);
        }
      } catch (error) {
        console.error('Failed to parse saved stories:', error);
      }
    }
  }, [stories]);

  // Persistence mechanism
  useEffect(() => {
    if (localStories.length > 0) {
      localStorage.setItem('figgytales_stories', JSON.stringify(localStories));
    }
  }, [localStories]);

  const startOver = () => {
    // Clear local storage and context
    localStorage.removeItem('figgytales_stories');
    clearFiles();
    
    // Navigate to home page
    navigate('/');
  };

  // Rest of the component remains the same as previous implementation
  // (copyAllToClipboard, downloadAsCsv, etc. methods)

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20">
        {/* Previous implementation remains the same */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-fade-in">
          <Button 
            variant="outline" 
            onClick={startOver}
            className="group"
          >
            <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Start Over
          </Button>
          
          {/* Rest of the component remains the same */}
        </div>
      </div>
    </main>
  );
};

export default Results;
