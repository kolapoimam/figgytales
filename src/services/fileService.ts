// services/fileService.ts
import { supabase } from '@/integrations/supabase/client';
import { UserStory, StorySettings, AIRequest } from '@/lib/types';

// Existing functions (assumed)
export const generateUserStories = async (aiRequest: AIRequest): Promise<UserStory[]> => {
  // Implementation as previously discussed
  // This would call your AI service and return user stories
  return []; // Placeholder
};

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
