
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import StoryCard from '@/components/StoryCard';
import { Button } from '@/components/Button';
import { ChevronLeft } from 'lucide-react';
import { useFiles } from '@/context/FileContext';
import { supabase } from '@/integrations/supabase/client';
import { UserStory } from '@/lib/types';
import { toast } from 'sonner';

const HistoryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, setStories } = useFiles();
  const [isLoading, setIsLoading] = useState(true);
  const [historyItem, setHistoryItem] = useState<{
    stories: UserStory[];
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchHistoryItem = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('history')
          .select('created_at, stories')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setHistoryItem({
            stories: data.stories as unknown as UserStory[],
            timestamp: data.created_at
          });
          
          // Also set as current stories
          setStories(data.stories as unknown as UserStory[]);
        }
      } catch (error) {
        console.error('Error fetching history item:', error);
        toast.error('Failed to load story history');
        navigate('/profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistoryItem();
  }, [id, user, navigate, setStories]);
  
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
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading stories...</p>
          </div>
        ) : historyItem && historyItem.stories.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {historyItem.stories.map((story, i) => (
                <StoryCard key={`${story.id}-${i}`} story={story} index={i} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No stories found in this history item.</p>
            <Button onClick={() => navigate('/profile')} className="mt-4">
              Back to Profile
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default HistoryView;
