// hooks/useStoryManager.ts
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
    let allValidStories: UserStory[] = [];
    const maxAttempts = 3;
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
        
        // Improved prompt with clearer instructions and fallback
        const aiRequest: AIRequest = {
          prompt: `Generate exactly ${remainingStories} user stories with ${settings.criteriaCount} acceptance criteria each based on these design screens. Each user story must strictly follow the format 'As a [user type], I want to [action], so that [benefit]' in both the title and description. The title must start with 'As a'. Each story must have a description and exactly ${settings.criteriaCount} clear, testable acceptance criteria. If you cannot generate exactly ${remainingStories} stories, generate as many as possible in the correct format. Do not include any summaries, introductions, placeholder text such as 'Here are X user stories', or any other content that is not a user story. Return only the user stories in the specified format.`,
          images: imageBase64s,
          storyCount: remainingStories,
          criteriaCount: settings.criteriaCount,
          userType: settings.userType
        };
        
        if (settings.audienceType) {
          aiRequest.audienceType = settings.audienceType;
        }
        
        const generatedStories = await generateUserStories(aiRequest);

        console.log(`Attempt ${attempts + 1} - Raw AI response:`, generatedStories);

        // Relaxed validation with fallback
        const validStories = generatedStories.map((story: UserStory) => {
          // Ensure story has required fields
          const validatedStory: UserStory = {
            id: story.id || uuidv4(),
            title: story.title?.startsWith('As a') ? story.title : `As a ${settings.userType || 'User'}, I want to [action], so that [benefit]`,
            description: story.description || 'Description placeholder - please edit this story.',
            criteria: Array.isArray(story.criteria) && story.criteria.length > 0
              ? story.criteria.slice(0, settings.criteriaCount)
              : Array(settings.criteriaCount).fill({ description: 'Acceptance criterion placeholder - please edit.' })
          };

          // Pad or trim criteria to match criteriaCount
          if (validatedStory.criteria.length < settings.criteriaCount) {
            validatedStory.criteria = [
              ...validatedStory.criteria,
              ...Array(settings.criteriaCount - validatedStory.criteria.length).fill({
                description: 'Acceptance criterion placeholder - please edit.'
              })
            ];
          }

          // Log if the story was modified
          if (!story.title?.startsWith('As a') || !story.description || !Array.isArray(story.criteria)) {
            console.log(`Attempt ${attempts + 1} - Modified story to meet requirements:`, validatedStory);
          }

          return validatedStory;
        }).filter((story: UserStory) => {
          // Minimal validation to exclude completely invalid responses
          const isNotSummary = !story.title?.includes('Here are');
          return isNotSummary;
        });

        allValidStories = [...allValidStories, ...validStories];
        attempts++;

        console.log(`Attempt ${attempts} - Valid stories so far: ${allValidStories.length}/${settings.storyCount}`);
      }

      // If we still don't have enough stories, generate placeholders
      if (allValidStories.length < settings.storyCount) {
        const remaining = settings.storyCount - allValidStories.length;
        const placeholderStories = Array(remaining).fill(null).map((_, index) => ({
          id: uuidv4(),
          title: `As a ${settings.userType || 'User'}, I want to [action], so that [benefit]`,
          description: `Placeholder Story ${allValidStories.length + index + 1} - Generated due to insufficient valid stories. Please edit or regenerate.`,
          criteria: Array(settings.criteriaCount).fill({ description: 'Acceptance criterion placeholder - please edit.' })
        }));
        allValidStories = [...allValidStories, ...placeholderStories];

        toast.warning(`Expected ${settings.storyCount} user stories, but only ${validStories.length} valid stories were generated after ${maxAttempts} attempts.`, {
          description: `Added ${remaining} placeholder stories to meet the requirement. You can edit these or try generating more.`
        });
      } else {
        toast.success("Stories generated", {
          description: `${allValidStories.length} user stories created based on your designs.`
        });
      }

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
      // Fallback in case of complete failure
      const fallbackStories = Array(settings.storyCount).fill(null).map((_, index) => ({
        id: uuidv4(),
        title: `As a ${settings.userType || 'User'}, I want to [action], so that [benefit]`,
        description: `Fallback Story ${index + 1} - Generated due to an error. Please edit or try again.`,
        criteria: Array(settings.criteriaCount).fill({ description: 'Acceptance criterion placeholder - please edit.' })
      }));
      setStories(fallbackStories);
      toast.error("Failed to generate stories", {
        description: "Generated placeholder stories due to an error. Please edit these or try again later."
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
