import { useState, useCallback, useEffect } from 'react';
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
  const [stories, setStories] = useState<UserStory[]>(() => {
    const savedStories = localStorage.getItem('figgytales_stories');
    return savedStories ? JSON.parse(savedStories) : [];
  });
  
  const [history, setHistory] = useState<GenerationHistory[]>([]);

  useEffect(() => {
    if (stories.length > 0) {
      localStorage.setItem('figgytales_stories', JSON.stringify(stories));
    } else {
      localStorage.removeItem('figgytales_stories');
    }
  }, [stories]);

  const generateStories = useCallback(async () => {
    if (files.length === 0) {
      toast.error("No design files", {
        description: "Please upload at least one design file before generating stories."
      });
      return;
    }
    
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
        prompt: `Generate exactly ${settings.storyCount} user stories with ${settings.criteriaCount} acceptance criteria each based on these design screens. Each user story must follow the format 'As a [user type], I want to [action], so that [benefit]'. Ensure acceptance criteria are clear and testable. Do not include any summaries, introductions, or placeholder text such as 'Here are X user stories'. Return only the user stories.`,
        images: imageBase64s,
        storyCount: settings.storyCount,
        criteriaCount: settings.criteriaCount,
        userType: settings.userType
      };
      
      if (settings.audienceType) {
        aiRequest.audienceType = settings.audienceType;
      }
      
      const generatedStories = await generateUserStories(aiRequest);

      // Filter to ensure only proper user stories are included
      const filteredStories = generatedStories.filter(story => {
        return (
          story.title?.startsWith('As a') && // Proper user story format
          story.description && // Has a description
          story.criteria?.length >= settings.criteriaCount && // Has the correct number of criteria
          !story.title?.includes('Here are') // Exclude summaries
        );
      });

      // Validate the number of stories
      if (filteredStories.length !== settings.storyCount) {
        throw new Error(`Expected ${settings.storyCount} user stories, but only ${filteredStories.length} valid stories were generated.`);
      }

      setStories(filteredStories);
      
      if (userId) {
        await saveGenerationHistory(userId, filteredStories, settings);
        
        const newHistoryEntry: GenerationHistory = {
          id: uuidv4(),
          timestamp: new Date(),
          stories: filteredStories,
          settings: { ...settings }
        };
        
        setHistory(prev => [newHistoryEntry, ...prev]);
      }
      
      toast.success("Stories generated", {
        description: `${filteredStories.length} user stories created based on your designs.`
      });
      
    } catch (error) {
      console.error('Error generating stories:', error);
      toast.error("Failed to generate stories", {
        description: error.message || "There was an error processing your design files. Please try again later."
      });
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
        const tempShareId = uuidv4();
        shareUrl = `${window.location.origin}/share/${tempShareId}`;
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

  const clearStoredStories = useCallback(() => {
    localStorage.removeItem('figgytales_stories');
    setStories([]);
  }, []);

  return {
    stories,
    history,
    generateStories,
    createShareLink,
    getHistory,
    setStories,
    setHistory,
    clearStoredStories
  };
};
