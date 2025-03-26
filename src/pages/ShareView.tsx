// pages/ShareView.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSharedStories } from '@/services/fileService';
import StoryCard from '@/components/StoryCard';
import Header from '@/components/Header';
import { toast } from "sonner";

interface Story {
  id: string;
  title: string;
  description: string;
  criteria: { description: string }[];
}

const ShareView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSharedStories = async () => {
      if (!id) {
        toast.error("Invalid share link");
        setLoading(false);
        return;
      }

      try {
        const sharedStories = await fetchSharedStories(id);
        setStories(sharedStories);
      } catch (error) {
        console.error('Error loading shared stories:', error);
        toast.error("Failed to load shared stories", {
          description: "The share link may be invalid or the stories may have been deleted."
        });
      } finally {
        setLoading(false);
      }
    };

    loadSharedStories();
  }, [id]);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20">
        <h1 className="text-2xl font-bold mb-6">Shared Stories</h1>
        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading shared stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No stories found for this share link.</p>
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
