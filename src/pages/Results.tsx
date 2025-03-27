
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BackButton from '@/components/BackButton';
import { useFiles } from '@/context/FileContext';
import LoginButton from '@/components/LoginButton';
import ResultsActions from '@/components/ResultsActions';
import StoriesList from '@/components/StoriesList';
import ShareDialog from '@/components/ShareDialog';

const Results: React.FC = () => {
  const { 
    stories, 
    clearFiles, 
    createShareLink, 
    user,
    setStories
  } = useFiles();
  
  const navigate = useNavigate();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Load stories from localStorage if context is empty
  useEffect(() => {
    if (stories.length === 0) {
      const savedStories = localStorage.getItem('figgytales_stories');
      if (savedStories) {
        try {
          const parsedStories = JSON.parse(savedStories);
          if (Array.isArray(parsedStories) && parsedStories.length > 0) {
            setStories(parsedStories);
          }
        } catch (e) {
          console.error("Error parsing saved stories:", e);
        }
      }
    }
  }, [stories.length, setStories]);

  // Persist stories to localStorage when they change
  useEffect(() => {
    if (stories.length > 0) {
      localStorage.setItem('figgytales_stories', JSON.stringify(stories));
    } else {
      localStorage.removeItem('figgytales_stories');
    }
  }, [stories]);

  const handleShareLink = async () => {
    try {
      const url = await createShareLink();
      setShareUrl(url);
      setShareDialogOpen(true);
    } catch (error) {
      console.error('Error creating share link:', error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-fade-in">
          <div>
            <BackButton showConfirm={true} />
          </div>
          
          <ResultsActions 
            stories={stories}
            onShareClick={handleShareLink}
            onGenerateMore={() => navigate('/', { replace: true })}
            onStartOver={() => {
              clearFiles();
              localStorage.removeItem('figgytales_stories');
              navigate('/', { replace: true });
            }}
          />
        </div>

        {!user && (
          <div className="bg-secondary/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Sign in to save your generated stories to your history</p>
            <LoginButton />
          </div>
        )}
        
        <StoriesList stories={stories} />
      </div>
      
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        shareUrl={shareUrl}
      />
    </main>
  );
};

export default Results;
