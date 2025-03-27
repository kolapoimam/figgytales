
import React from 'react';
import { Button } from '@/components/Button';
import StoryCard from '@/components/StoryCard';
import { UserStory } from '@/lib/types';
import { useNavigate } from 'react-router-dom';

interface StoriesListProps {
  stories: UserStory[];
}

const StoriesList: React.FC<StoriesListProps> = ({ stories }) => {
  const navigate = useNavigate();
  
  if (stories.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No stories generated yet. Upload design files and generate stories.</p>
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
      {stories.map((story, i) => (
        <StoryCard key={`${story.id}-${i}`} story={story} index={i} />
      ))}
    </div>
  );
};

export default StoriesList;
