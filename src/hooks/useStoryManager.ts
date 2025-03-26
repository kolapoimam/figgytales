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

    // Validate user input
    if (settings.storyCount < 1 || settings.storyCount > 15) {
      toast.error("Invalid number of stories", {
        description: "Please specify between 1 and 15 user stories."
      });
      return;
    }

    if (settings.criteriaCount < 1 || settings.criteriaCount > 8) {
      toast.error("Invalid number of criteria", {
        description: "Please specify between 1 and 8 acceptance criteria per story."
      });
      return;
    }
    
    setIsGenerating(true);
    let allValidStories: UserStory[] = [];
    const maxAttempts = 5; // Increased to 5 attempts
    let attempts = 0;

    try {
      while (allValidStories.length < settings.storyCount && attempts < maxAttempts) {
        const remainingStories = settings.storyCount - allValidStories.length;
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
          prompt: `Based on the provided design screens, generate exactly ${remainingStories} user stories, each with exactly ${settings.criteriaCount} acceptance criteria. Each user story must follow the format 'As a [user type], I want to [action], so that [benefit]'. Ensure the following:
            - Each story has a title starting with 'As a'.
            - Each story has a description explaining the user story in detail.
            - Each story has exactly ${settings.criteriaCount} acceptance criteria, each starting with 'Given', 'When', or 'Then' to make them testable.
            - Do not include any summaries, introductions, placeholder text such as 'Here are X user stories', or any other content that is not a user story.
            - Return only the ${remainingStories} user stories in the specified format.
            - Consider all provided design screens collectively to generate diverse and relevant user stories.`,
          images: imageBase64s,
          storyCount: remainingStories,
          criteriaCount: settings.criteriaCount,
          userType: settings.userType
        };
        
        if (settings.audienceType) {
          aiRequest.audienceType = settings.audienceType;
        }
        
        const generatedStories = await generateUserStories(aiRequest);

        // Log the raw AI response for debugging
        console.log(`Attempt ${attempts + 1} - Raw AI response:`, generatedStories);

        // Filter to ensure only proper user stories are included
        const validStories = generatedStories.filter(story => {
          const isValid = (
            story && // Ensure story is not null/undefined
            typeof story.title === 'string' && story.title.trim().startsWith('As a') && // Proper user story format
            typeof story.description === 'string' && story.description.trim().length > 0 && // Has a non-empty description
            Array.isArray(story.criteria) && story.criteria.length === settings.criteriaCount && // Has exactly the requested number of criteria
            story.criteria.every(criterion => typeof criterion.description === 'string' && criterion.description.trim().length > 0) && // Each criterion has a non-empty description
            !story.title.toLowerCase().includes('here are') // Exclude summaries
          );
          if (!isValid) {
            console.log(`Attempt ${attempts + 1} - Filtered out invalid story:`, story);
          }
          return isValid;
        });

        allValidStories = [...allValidStories, ...validStories];
        attempts++;

        console.log(`Attempt ${attempts} - Valid stories so far: ${allValidStories.length}/${settings.storyCount}`);
      }

      // Final validation
      if (allValidStories.length === 0) {
        throw new Error("No valid user stories were generated after maximum attempts.");
      } else if (allValidStories.length < settings.storyCount) {
        toast.warning(`Expected ${settings.storyCount} user stories, but only ${allValidStories.length} valid stories were generated after ${maxAttempts} attempts.`, {
          description: "Displaying the available stories. You can try generating more."
        });
      } else {
        toast.success("Stories generated", {
          description: `${allValidStories.length} user stories created based on your designs.`
        });
      }

      // Ensure we only take the requested number of stories
      allValidStories = allValidStories.slice(0, settings.storyCount);
      setStories(allValidStories);
      
      if (userId) {
        await saveGenerationHistory(userId, allValidStories, settings);
        
        const newHistoryEntry: GenerationHistory = {
          id: uuidv4(),
          timestamp: new Date(),
          stories: allValidStories,
          settings: { ...settings }
        };
        
        setHistory(prev => [newHistoryEntry, ...prev]);
      }
      
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
        toast.error("Please sign in to share stories");
        return "";
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
