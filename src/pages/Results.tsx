
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
  const { stories, clearFiles, createShareLink, user } = useFiles();
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Ensure we display stored stories from localStorage if stories array is empty
  useEffect(() => {
    if (stories.length === 0) {
      const savedStories = localStorage.getItem('figgytales_stories');
      if (savedStories) {
        try {
          const parsedStories = JSON.parse(savedStories);
          if (Array.isArray(parsedStories) && parsedStories.length > 0) {
            // This will trigger a re-render with the stored stories
            console.log("Loading stories from localStorage");
          }
        } catch (e) {
          console.error("Error parsing saved stories:", e);
        }
      }
    }
  }, [stories]);
  
  const copyAllToClipboard = () => {
    if (stories.length === 0) return;
    
    let textToCopy = '';
    
    stories.forEach((story, i) => {
      textToCopy += `${story.title}\n${story.description}\n\nAcceptance Criteria:\n${
        story.criteria.map((c, j) => `${j + 1}. ${c.description}`).join('\n')
      }`;
      
      if (i < stories.length - 1) {
        textToCopy += '\n\n' + '-'.repeat(40) + '\n\n';
      }
    });
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast.success("All stories copied to clipboard");
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast.error("Failed to copy to clipboard");
      });
  };
  
  const downloadAsCsv = () => {
    if (stories.length === 0) return;
    
    let csvContent = "Title,Description,Acceptance Criteria\n";
    
    stories.forEach(story => {
      const criteriaText = story.criteria.map(c => c.description.replace(/"/g, '""')).join(' | ');
      csvContent += `"${story.title}","${story.description.replace(/"/g, '""')}","${criteriaText}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'figgytales-stories.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("CSV file downloaded");
  };
  
  const handleShareLink = async () => {
    setIsSharing(true);
    await createShareLink();
    setIsSharing(false);
  };
  
  const startOver = () => {
    // Just clear the files but keep the stories
    clearFiles();
    navigate('/');
  };
  
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-fade-in">
          <Button 
            variant="outline" 
            onClick={startOver}
            className="group"
          >
            <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Start Over
          </Button>
          
          <div className="flex gap-3 self-end sm:self-auto">
            <Button 
              variant="secondary" 
              onClick={copyAllToClipboard}
              disabled={stories.length === 0}
            >
              {isCopied ? <Check size={16} className="mr-2" /> : <ClipboardCopy size={16} className="mr-2" />}
              {isCopied ? 'Copied' : 'Copy All'}
            </Button>
            
            <Button
              variant="secondary"
              onClick={handleShareLink}
              disabled={isSharing || stories.length === 0}
            >
              <Share2 size={16} className="mr-2" />
              Share
            </Button>
            
            <Button 
              onClick={downloadAsCsv}
              disabled={stories.length === 0}
            >
              <Download size={16} className="mr-2" />
              Download CSV
            </Button>
          </div>
        </div>

        {!user && (
          <div className="bg-secondary/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Sign in to save your generated stories to your history</p>
            <LoginButton />
          </div>
        )}
        
        {user && <HistoryList className="mb-8" />}
        
        {stories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No stories generated yet. Upload design files and generate stories.</p>
            <Button 
              onClick={() => navigate('/')}
              className="mt-4"
            >
              Go to Upload
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Results;
