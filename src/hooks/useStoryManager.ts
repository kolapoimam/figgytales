import { useState, useCallback, useEffect } from 'react';
import { toast } from "sonner";
import { UserStory, GenerationHistory, StorySettings, AIRequest } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { generateUserStories, saveGenerationHistory, createStoryShareLink, fetchUserHistory } from '@/services/fileService';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  useEffect(() => {
    if (stories.length > 0) {
      localStorage.setItem('figgytales_stories', JSON.stringify(stories));
    }
  }, [stories]);

  const generateStories = useCallback(async () => {
    console.log('useStoryManager generateStories called with:', { files, settings, userId });
    if (files.length === 0) {
      toast.error("No design files", {
        description: "Please upload at least one design file before generating stories."
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const imagePromises = files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            console.log('FileReader result for file:', file.file.name, reader.result);
            resolve(reader.result as string);
          };
          reader.onerror = (error) => {
            console.error('FileReader error for file:', file.file.name, error);
            reject(error);
          };
          reader.readAsDataURL(file.file);
        });
      });
      
      const imageBase64s = await Promise.all(imagePromises);
      console.log('Base64 images:', imageBase64s);
      
      const aiRequest: AIRequest = {
        prompt: `Based on the provided design screens, generate exactly ${settings.storyCount} user stories, each with exactly ${settings.criteriaCount} acceptance criteria. Each user story must be granular, clear, and directly inspired by the visual elements, interactions, or features visible in the design screens. Use the format: 'As a ${settings.userType}, I want to [specific action based on the design], so that [clear, user-focused benefit]'. Ensure the acceptance criteria are simple, testable, and directly related to the user story, focusing on specific behaviors or outcomes (e.g., 'Given [context], when [action], then [expected result]'). Do not include any summaries, introductions, placeholders, or additional text beyond the user stories and their acceptance criteria.`,
        images: imageBase64s,
        storyCount: settings.storyCount,
        criteriaCount: settings.criteriaCount,
        userType: settings.userType
      };
      
      if (settings.audienceType) {
        aiRequest.audienceType = settings.audienceType;
      }
      
      console.log('Calling generateUserStories with request:', aiRequest);
      const generatedStories = await generateUserStories(aiRequest);
      console.log('Generated stories:', generatedStories);
      
      // Validate the response
      if (!Array.isArray(generatedStories)) {
        throw new Error('Invalid response: Expected an array of user stories');
      }
      
      if (generatedStories.length !== settings.storyCount) {
        throw new Error(`Expected ${settings.storyCount} user stories, but received ${generatedStories.length}`);
      }
      
      for (const story of generatedStories) {
        if (!story.title || !story.description || !Array.isArray(story.acceptanceCriteria)) {
          throw new Error('Invalid user story format: Missing title, description, or acceptance criteria');
        }
        if (story.acceptanceCriteria.length !== settings.criteriaCount) {
          throw new Error(`Expected ${settings.criteriaCount} acceptance criteria for story "${story.title}", but received ${story.acceptanceCriteria.length}`);
        }
      }

      setStories(generatedStories);
      
      if (userId) {
        console.log('Saving generation history for user:', userId);
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
      
      // Navigate to stories page
      navigate('/stories');
      
    } catch (error) {
      console.error('Error generating stories:', error);
      toast.error("Failed to generate stories", {
        description: error instanceof Error ? error.message : "There was an error processing your design files. Please try again later."
      });
    } finally {
      setIsGenerating(false);
    }
  }, [files, settings, userId, setIsGenerating, navigate]);

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
