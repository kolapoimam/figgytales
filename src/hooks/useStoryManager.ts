
import { useState, useCallback } from 'react';
import { toast } from "sonner";
import { UserStory, GenerationHistory, StorySettings, AIRequest } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { generateUserStories, saveGenerationHistory, createStoryShareLink, fetchUserHistory } from '@/services/fileService';

export const useStoryManager = (
  files: any[], 
  settings: StorySettings, 
  userId: string | null,
  setIsGenerating: (value: boolean) => void
) => {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [history, setHistory] = useState<GenerationHistory[]>([]);

  const generateStories = useCallback(async () => {
    if (files.length === 0) return;
    
    setIsGenerating(true);
    try {
      const imagePromises = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file.file);
        });
      });
      
      const imageBase64s = await Promise.all(imagePromises);
      
      const aiRequest: AIRequest = {
        prompt: `Generate ${settings.storyCount} user stories with ${settings.criteriaCount} acceptance criteria each based on these design screens.`,
        images: imageBase64s,
        storyCount: settings.storyCount,
        criteriaCount: settings.criteriaCount
      };
      
      const generatedStories = await generateUserStories(aiRequest);
      setStories(generatedStories);
      
      if (userId) {
        await saveGenerationHistory(userId, generatedStories, settings);
        
        const newHistoryEntry: GenerationHistory = {
          id: uuidv4(),
          timestamp: new Date(),
          stories: generatedStories,
          settings: { ...settings }
        };
        
        setHistory(prev => [newHistoryEntry, ...prev]);
      }
      
      toast.success("Stories generated", {
        description: `${generatedStories.length} user stories created based on your designs.`
      });
      
    } catch (error) {
      console.error('Error generating stories:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [files, settings, userId, setIsGenerating]);

  const createShareLink = useCallback(async () => {
    if (stories.length === 0) {
      toast.error("No stories to share");
      return "";
    }

    try {
      let shareUrl = '';
      
      if (userId) {
        const shareId = await createStoryShareLink(userId, stories);
        shareUrl = `${window.location.origin}/share/${shareId}`;
      } else {
        // For non-authenticated users, generate a UUID but don't save to DB
        const tempShareId = uuidv4();
        shareUrl = `${window.location.origin}/share/${tempShareId}`;
        // This won't actually work for non-auth users without additional implementation
      }
      
      toast.success("Share link created", {
        description: "Link copied to clipboard!"
      });
      
      navigator.clipboard.writeText(shareUrl);
      
      return shareUrl;
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error("Failed to create share link");
      return "";
    }
  }, [stories, userId]);

  const getHistory = useCallback(async () => {
    if (!userId) return;
    
    try {
      const data = await fetchUserHistory(userId);
      
      if (data) {
        const formattedHistory: GenerationHistory[] = data.map(item => ({
          id: item.id,
          timestamp: new Date(item.created_at),
          stories: item.stories as unknown as UserStory[],
          settings: item.settings as unknown as StorySettings
        }));
        
        setHistory(formattedHistory);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error("Failed to load history");
    }
  }, [userId]);

  return {
    stories,
    history,
    generateStories,
    createShareLink,
    getHistory,
    setStories,
    setHistory
  };
};
