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
      toast.error("No design files", { description: "Please upload at least one design file." });
      return;
    }

    setIsGenerating(true);
    let allValidStories: UserStory[] = [];
    const maxAttempts = 5;
    let attempts = 0;

    try {
      while (allValidStories.length < settings.storyCount && attempts < maxAttempts) {
        const remainingStories = settings.storyCount - allValidStories.length;
        const imagePromises = files.map(file => {
          return new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file.file);
          });
        });
        const imageBase64s = await Promise.all(imagePromises);

        const aiRequest: AIRequest = {
          prompt: `Based on the provided design screens, generate exactly ${remainingStories} user stories. Each user story must be in the following format:

Title: As a [user type], I want to [action], so that [benefit]
Description: [Provide a brief description of the user story]
Acceptance Criteria:
1. [First acceptance criterion]
2. [Second acceptance criterion]
...
${settings.criteriaCount}. [Last acceptance criterion]

Ensure that:
- Each story has exactly ${settings.criteriaCount} acceptance criteria.
- The title starts with 'As a'.
- There is a description for each story.
- Do not include any text before or after the user stories, such as summaries or introductions.
- Only provide the user stories themselves.

For example, if generating 2 stories with 3 acceptance criteria each:
Title: As a user, I want to log in, so that I can access my account
Description: The login feature allows users to access their personal dashboard.
Acceptance Criteria:
1. The login form should have fields for username and password.
2. There should be a 'Forgot Password' link.
3. Successful login should redirect to the dashboard.

Title: As a user, I want to reset my password, so that I can regain access if I forget it
Description: Password reset functionality for account recovery.
Acceptance Criteria:
1. User should receive a reset link via email.
2. The reset link should expire after 24 hours.
3. User should be able to set a new password.

Provide exactly ${remainingStories} such stories based on the design screens.`,
          images: imageBase64s,
          storyCount: remainingStories,
          criteriaCount: settings.criteriaCount,
          userType: settings.userType,
          ...(settings.audienceType && { audienceType: settings.audienceType }),
        };

        const generatedStories = await generateUserStories(aiRequest);
        console.log(`Attempt ${attempts + 1} - Raw AI response:`, generatedStories);

        const validStories = generatedStories.filter(story => {
          const isValid = (
            story.title?.startsWith('As a') &&
            story.description &&
            Array.isArray(story.criteria) && story.criteria.length === settings.criteriaCount &&
            !story.title?.includes('Here are') &&
            !story.description?.includes('Here are')
          );
          if (!isValid) console.log(`Attempt ${attempts + 1} - Filtered out:`, story);
          return isValid;
        });

        allValidStories = [...allValidStories, ...validStories];
        attempts++;
        console.log(`Attempt ${attempts} - Valid stories: ${allValidStories.length}/${settings.storyCount}`);
      }

      if (allValidStories.length < settings.storyCount) {
        toast.warning(`Expected ${settings.storyCount} stories, but got ${allValidStories.length} after ${maxAttempts} attempts.`, {
          description: "Please try again or adjust your settings."
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
          settings: { ...settings },
        };
        setHistory(prev => [newHistoryEntry, ...prev]);
      }
    } catch (error) {
      console.error('Error generating stories:', error);
      toast.error("Failed to generate stories", { description: "Error processing design files. Try again later." });
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
      if (!userId) {
        toast.error("Please sign in to share stories");
        return "";
      }
      const shareId = await createStoryShareLink(userId, stories);
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      toast.success("Share link created", { description: "Link copied to clipboard!" });
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
          settings: item.settings as unknown as StorySettings,
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
    clearStoredStories,
  };
};
