
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import StoryCard from '@/components/StoryCard';
import { Button } from '@/components/Button';
import { Home, ClipboardCopy, Check } from 'lucide-react';
import { toast } from "sonner";
import { UserStory } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

const ShareView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stories, setStories] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  
  useEffect(() => {
    const fetchSharedStories = async () => {
      if (!id) {
        toast.error("Invalid share link");
        navigate('/');
        return;
      }
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('shared_links')
          .select('stories, expires_at')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          toast.error("Shared link not found");
          navigate('/');
          return;
        }

        // Check if link has expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          toast.error("This share link has expired");
          navigate('/');
          return;
        }

        if (data.stories) {
          // Validate the stories data structure
          if (Array.isArray(data.stories)) {
            // Safely cast the JSON data to UserStory array
            const userStories = data.stories as unknown as UserStory[];
            
            // Additional validation to ensure properties exist
            const validStories = userStories.filter(story => 
              story && typeof story === 'object' && 
              'id' in story && 'title' in story && 
              'description' in story && 'criteria' in story
            );
            
            setStories(validStories);
          } else {
            console.error('Invalid stories data format:', data.stories);
            toast.error("Invalid stories data format");
          }
        } else {
          toast.error("No stories found in this share");
        }
      } catch (error) {
        console.error('Error fetching shared stories:', error);
        toast.error("Failed to load shared stories");
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSharedStories();
  }, [id, navigate]);
  
  const copyAllToClipboard = () => {
    if (stories.length === 0) return;
    
    let textToCopy = '';
    
    stories.forEach((story, i) => {
      textToCopy += `${story.title}\n${story.description}\n\nAcceptance Criteria:\n${
        story.criteria?.map((c, j) => `${j + 1}. ${c.description}`).join('\n') || 'No criteria'
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
          <Link to="/" replace>
            <Button variant="outline" className="group">
              <Home size={16} className="mr-2" />
              Go Home
            </Button>
          </Link>
          
          {stories.length > 0 && (
            <Button 
              variant="secondary" 
              onClick={copyAllToClipboard}
              disabled={stories.length === 0}
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
                <Button onClick={() => navigate('/', { replace: true })} className="mt-4">
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
