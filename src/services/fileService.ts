
import { supabase } from '@/integrations/supabase/client';
import { AIRequest, UserStory, StorySettings } from '@/lib/types';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates user stories based on provided request
 */
export const generateUserStories = async (request: AIRequest): Promise<UserStory[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-stories', {
      body: request
    });
    
    if (error) {
      console.error('Error from Supabase function:', error);
      throw error;
    }
    
    if (data && data.stories) {
      return data.stories;
    } else {
      throw new Error('No stories returned from the API');
    }
  } catch (error) {
    console.error('Error generating stories:', error);
    toast.error("Failed to generate stories", {
      description: "There was an error processing your design files."
    });
    throw error;
  }
};

/**
 * Saves a generation history entry to the database
 */
export const saveGenerationHistory = async (
  userId: string, 
  stories: UserStory[], 
  settings: StorySettings
): Promise<void> => {
  try {
    await supabase
      .from('history')
      .insert({
        user_id: userId,
        settings: settings as any,
        stories: stories as any,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error saving to history:', error);
    throw error;
  }
};

/**
 * Creates a share link for stories
 */
export const createStoryShareLink = async (
  userId: string, 
  stories: UserStory[]
): Promise<string> => {
  try {
    const shareId = uuidv4();
    
    await supabase
      .from('shared_links')
      .insert({
        id: shareId,
        user_id: userId,
        stories: stories as any,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    
    return shareId;
  } catch (error) {
    console.error('Error creating share link:', error);
    throw error;
  }
};

/**
 * Fetches user generation history
 */
export const fetchUserHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};
