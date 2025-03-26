import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import StoryCard from '@/components/StoryCard';
import { Button } from '@/components/Button';
import { Home, ClipboardCopy, Check } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

// Ensure type safety
interface UserStory {
  id: string;
  title: string;
  description: string;
  criteria?: { description: string }[];
}

const ShareView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stories, setStories] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSharedStories = async () => {
      if (!id) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('shared_links')
          .select('stories, expires_at')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          setError("Shared link not found");
          setIsLoading(false);
          return;
        }

        // Check expiration
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError("This share link has expired");
          setIsLoading(false);
          return;
        }

        // Validate stories
        if (data.stories && Array.isArray(data.stories)) {
          setStories(data.stories);
        } else {
          setError("Invalid stories data format");
        }
      } catch (err) {
        console.error('Error fetching shared stories:', err);
        setError("Failed to load shared stories");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSharedStories();
  }, [id]);
  
  const copyAllToClipboard = () => {
    if (stories.length === 0) return;
    
    let textToCopy = stories.map((story, i) => 
      `${story.title}\n${story.description}\n\nAcceptance Criteria:\n${
        story.criteria?.map((c, j) => `${j + 1}. ${c.description}`).join('\n') || 'No criteria'
      }${i < stories.length - 1 ? '\n\n' + '-'.repeat(40) + '\n\n' : ''}`
    ).join('');
    
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
  
  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </main>
    );
  }

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
          
          {stories.length > 0 && (
            <Button 
              variant="secondary" 
              onClick={copyAllToClipboard}
            >
              {isCopied ? <Check size={16} className="mr-2" /> : <ClipboardCopy size={16} className="mr-2" />}
              {isCopied ? 'Copied' : 'Copy All'}
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading shared stories...</p>
          </div>
        ) : (
          <>
            {stories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No stories found in this share.</p>
                <Button onClick={() => navigate('/')} className="mt-4">
                  Go Home
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stories.map((story, i) => (
                  <StoryCard 
                    key={`${story.id}-${i}`} 
                    story={story} 
                    index={i} 
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default ShareView;
