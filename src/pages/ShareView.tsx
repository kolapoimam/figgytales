
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import StoryCard from '@/components/StoryCard';
import { Button } from '@/components/Button';
import { Home, ClipboardCopy, Check } from 'lucide-react';
import { toast } from "sonner";
import { UserStory } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const ShareView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [stories, setStories] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  
  useEffect(() => {
    // In a real app, this would fetch the shared stories by ID from a database
    // For now, we'll create mock stories
    const fetchSharedStories = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockStories: UserStory[] = Array.from({ length: 3 }, (_, i) => ({
          id: uuidv4(),
          title: `Shared Story ${i + 1}`,
          description: `This is a shared user story description for story ${i + 1}.`,
          criteria: Array.from({ length: 3 }, (_, j) => ({
            id: uuidv4(),
            description: `Acceptance criterion ${j + 1} for shared story ${i + 1}`
          }))
        }));
        
        setStories(mockStories);
      } catch (error) {
        console.error('Error fetching shared stories:', error);
        toast.error("Failed to load shared stories");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSharedStories();
  }, [id]);
  
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
  
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20">
        <div className="flex justify-between items-center mb-8">
          <Link to="/">
            <Button variant="outline" className="group">
              <Home size={16} className="mr-2" />
              Go Home
            </Button>
          </Link>
          
          <Button 
            variant="secondary" 
            onClick={copyAllToClipboard}
          >
            {isCopied ? <Check size={16} className="mr-2" /> : <ClipboardCopy size={16} className="mr-2" />}
            {isCopied ? 'Copied' : 'Copy All'}
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading shared stories...</p>
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

export default ShareView;
