// services/fileService.ts
import { supabase } from '@/integrations/supabase/client';
import { UserStory, StorySettings, AIRequest } from '@/lib/types';

// Placeholder for AI call (replace with your actual AI service)
const callAI = async (request: { prompt: string; images: string[] }) => {
  // This is a placeholder. Replace with your actual AI service call.
  // For example, if using an API like OpenAI or a custom AI service:
  /*
  const response = await fetch('your-ai-endpoint', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.json();
  */
  return {
    stories: [
      // Example response (replace with actual AI output)
      {
        title: "As a user, I want to log in, so that I can access my account.",
        description: "The user should be able to enter their credentials and log in.",
        criteria: [
          { description: "Given a valid email and password, when I click login, then I should be logged in." },
          { description: "Given an invalid email, when I click login, then I should see an error." },
          { description: "Given an invalid password, when I click login, then I should see an error." },
          { description: "Given I am logged in, when I visit the login page, then I should be redirected to the dashboard." },
        ]
      }
    ]
  };
};

export const generateUserStories = async (aiRequest: AIRequest): Promise<UserStory[]> => {
  try {
    const response = await callAI({
      prompt: aiRequest.prompt,
      images: aiRequest.images,
    });

    // Ensure response.stories is an array
    if (!Array.isArray(response.stories)) {
      console.error('AI response does not contain a stories array:', response);
      return [];
    }

    // Parse and validate the AI response
    const parsedStories = response.stories
      .map((story: any) => {
        // Ensure required fields exist and are of the correct type
        if (
          !story ||
          typeof story.title !== 'string' ||
          typeof story.description !== 'string' ||
          !Array.isArray(story.criteria)
        ) {
          return null;
        }

        // Validate criteria
        const validCriteria = story.criteria
          .filter((criterion: any) => typeof criterion.description === 'string' && criterion.description.trim().length > 0)
          .slice(0, aiRequest.criteriaCount) // Ensure we only take the requested number of criteria
          .map((criterion: any) => ({ description: criterion.description.trim() }));

        // If we don't have enough valid criteria, pad with placeholders
        while (validCriteria.length < aiRequest.criteriaCount) {
          validCriteria.push({ description: `Placeholder criterion ${validCriteria.length + 1}` });
        }

        return {
          id: crypto.randomUUID(),
          title: story.title.trim(),
          description: story.description.trim(),
          criteria: validCriteria,
        };
      })
      .filter((story: UserStory | null) => story !== null && // Remove invalid stories
        story.title.startsWith('As a') && // Ensure proper user story format
        story.description.length > 0 && // Ensure non-empty description
        story.criteria.length === aiRequest.criteriaCount && // Ensure exact number of criteria
        !story.title.toLowerCase().includes('here are')); // Exclude summaries

    return parsedStories;
  } catch (error) {
    console.error('Error in generateUserStories:', error);
    return [];
  }
};

// Existing functions (unchanged)
export const saveGenerationHistory = async (userId: string, stories: UserStory[], settings: StorySettings) => {
  const { error } = await supabase
    .from('generation_history')
    .insert({
      user_id: userId,
      stories,
      settings,
      created_at: new Date().toISOString(),
    });

  if (error) throw error;
};

export const fetchUserHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('generation_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createStoryShareLink = async (userId: string, stories: UserStory[]): Promise<string> => {
  const { data, error } = await supabase
    .from('shared_stories')
    .insert({
      user_id: userId,
      stories,
    })
    .select('id')
    .single();

  if (error) throw error;

  return data.id;
};

export const fetchSharedStories = async (shareId: string): Promise<UserStory[]> => {
  const { data, error } = await supabase
    .from('shared_stories')
    .select('stories')
    .eq('id', shareId)
    .single();

  if (error) throw error;

  return data.stories as UserStory[];
};
