import React from 'react';
import { Button } from '@/components/Button';
import StoryCard from '@/components/StoryCard';
import { UserStory } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useFiles } from '@/context/FileContext';
import { toast } from 'sonner';

interface StoriesListProps {
  stories: UserStory[];
  loading?: boolean;
  error?: string | null;
}

const StoriesList: React.FC<StoriesListProps> = ({ 
  stories, 
  loading = false, 
  error = null 
}) => {
  const navigate = useNavigate();
  const { isGenerating } = useFiles();

  if (loading || isGenerating) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">
          No stories generated yet. Upload design files and generate stories.
        </p>
        <Button 
          onClick={() => navigate('/', { replace: true })}
          className="mt-4"
        >
          Go to Upload
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {stories.map((story) => (
        <StoryCard 
          key={story.id} 
          story={story} 
          index={stories.indexOf(story)}
        />
      ))}
    </div>
  );
};

export default StoriesList;
