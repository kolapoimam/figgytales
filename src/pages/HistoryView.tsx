import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import StoryCard from '@/components/StoryCard';
import { Button } from '@/components/Button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useFiles } from '@/context/FileContext';
import { supabase } from '@/integrations/supabase/client';
import { UserStory, GenerationHistory } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

const HistoryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, setStories } = useFiles();
  const [isLoading, setIsLoading] = useState(true);
  const [historyItem, setHistoryItem] = useState<GenerationHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchHistoryItem = async () => {
      if (!id) {
        setError('Invalid history ID');
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: supabaseError } = await supabase
          .from('history')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        
        if (supabaseError) throw supabaseError;
        
        if (!data) {
          setError('History item not found');
          navigate('/profile');
          return;
        }

        // Validate and transform the data
        const validatedItem: GenerationHistory = {
          id: data.id,
          timestamp: new Date(data.created_at),
          stories: Array.isArray(data.stories) ? data.stories : [],
          settings: data.settings || {
            storyCount: 0,
            criteriaCount: 0,
            userType: 'User'
          }
        };

        setHistoryItem(validatedItem);
        setStories(validatedItem.stories);
        
      } catch (error) {
        console.error('Error fetching history item:', error);
        setError(error instanceof Error ? error.message : 'Failed to load history');
        toast.error('Failed to load story history');
        navigate('/profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistoryItem();
  }, [id, user, navigate, setStories]);

  if (!user) {
    return null; // Already redirecting to auth
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20">
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <Button 
            variant="outline" 
            onClick={() => navigate('/profile')}
            className="group"
          >
            <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </Button>
          
          {historyItem && (
            <div className="text-sm text-muted-foreground">
              Generated on {format(historyItem.timestamp, 'PPPp')}
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-4 text-muted-foreground">Loading stories...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => navigate('/profile')}>
              Back to Profile
            </Button>
          </div>
        ) : historyItem && historyItem.stories?.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {historyItem.stories.map((story) => (
                <StoryCard 
                  key={story.id} 
                  story={story} 
                  index={historyItem.stories.indexOf(story)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No stories found in this history item.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Generate New Stories
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default HistoryView;
