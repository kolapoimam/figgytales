import React, { createContext, useContext, ReactNode, useEffect, useCallback, useState } from 'react';
import { 
  DesignFile, 
  StorySettings, 
  UserStory, 
  GenerationHistory, 
  User,
  AIRequest,
  AIResponse,
  Tag
} from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useFileManager } from '@/hooks/useFileManager';
import { useStoryManager } from '@/hooks/useStoryManager';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FileContextType {
  files: DesignFile[];
  settings: StorySettings;
  stories: UserStory[];
  user: User | null;
  history: GenerationHistory[];
  isGenerating: boolean;
  isLoading: boolean;
  error: string | null;
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  updateSettings: (newSettings: Partial<StorySettings>) => void;
  clearFiles: () => void;
  generateStories: (request: AIRequest) => Promise<AIResponse>;
  createShareLink: () => Promise<string>;
  login: (provider: 'google' | 'email', options?: any) => Promise<void>;
  logout: () => Promise<void>;
  getHistory: () => Promise<GenerationHistory[]>;
  updateHistoryTitle: (historyId: string, title: string) => Promise<void>;
  addTagToHistory: (historyId: string, tagName: string) => Promise<void>;
  removeTagFromHistory: (historyId: string, tagId: string) => Promise<void>;
  getAvailableTags: () => Promise<Tag[]>;
  clearStoredStories: () => void;
  setStories: (stories: UserStory[]) => void;
  retryFetch: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const { user, login, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    files, 
    settings, 
    isGenerating, 
    setIsGenerating,
    addFiles, 
    removeFile, 
    updateSettings, 
    clearFiles: clearFileManagerFiles 
  } = useFileManager();
  
  const { 
    stories, 
    history, 
    generateStories, 
    createShareLink, 
    getHistory: getStoryManagerHistory,
    clearStoredStories,
    setStories: setStoryManagerStories
  } = useStoryManager(files, settings, user?.id || null, setIsGenerating);

  // Enhanced getHistory with tags support
  const getHistory = useCallback(async (): Promise<GenerationHistory[]> => {
    try {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('history')
        .select(`
          *,
          history_tags(
            tag:tags(id, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const formattedHistory = data?.map(item => ({
        ...item,
        timestamp: new Date(item.created_at),
        tags: item.history_tags?.map((ht: any) => ht.tag) || []
      })) || [];

      return formattedHistory;
    } catch (err) {
      console.error("Error fetching history:", err);
      toast.error('Failed to load history');
      throw err;
    }
  }, [user]);

  // Update history title
  const updateHistoryTitle = useCallback(async (historyId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('history')
        .update({ title })
        .eq('id', historyId);
      
      if (error) throw error;
      toast.success('Title updated');
    } catch (err) {
      console.error("Error updating title:", err);
      toast.error('Failed to update title');
      throw err;
    }
  }, []);

  // Add tag to history item
  const addTagToHistory = useCallback(async (historyId: string, tagName: string) => {
    try {
      // Find or create tag
      const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName.trim())
        .maybeSingle();
      
      let tagId;
      if (existingTag) {
        tagId = existingTag.id;
      } else {
        const { data: newTag, error } = await supabase
          .from('tags')
          .insert({ name: tagName.trim(), user_id: user?.id })
          .select('id')
          .single();
        
        if (error) throw error;
        tagId = newTag.id;
      }

      // Add tag to history
      const { error: relationError } = await supabase
        .from('history_tags')
        .insert({ history_id: historyId, tag_id: tagId });
      
      if (relationError) throw relationError;
      
      toast.success('Tag added');
    } catch (err) {
      console.error("Error adding tag:", err);
      toast.error('Failed to add tag');
      throw err;
    }
  }, [user?.id]);

  // Remove tag from history item
  const removeTagFromHistory = useCallback(async (historyId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('history_tags')
        .delete()
        .eq('history_id', historyId)
        .eq('tag_id', tagId);
      
      if (error) throw error;
      toast.success('Tag removed');
    } catch (err) {
      console.error("Error removing tag:", err);
      toast.error('Failed to remove tag');
      throw err;
    }
  }, []);

  // Get available tags for the user
  const getAvailableTags = useCallback(async (): Promise<Tag[]> => {
    try {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tags')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching tags:", err);
      toast.error('Failed to load tags');
      return [];
    }
  }, [user]);

  // Enhanced generateStories function
  const handleGenerateStories = useCallback(async (request: AIRequest) => {
    try {
      setIsGenerating(true);
      setError(null);
      const response = await generateStories(request);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate stories');
      toast.error('Story generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [generateStories, setIsGenerating]);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load from localStorage
      const savedStories = localStorage.getItem('figgytales_stories');
      if (savedStories) {
        try {
          const parsedStories = JSON.parse(savedStories) as UserStory[];
          if (Array.isArray(parsedStories)) {
            setStoryManagerStories(parsedStories);
          }
        } catch (e) {
          console.error("Error parsing saved stories:", e);
        }
      }

      // Load history if user is logged in
      if (user) {
        await getStoryManagerHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      toast.error('Failed to load initial data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, getStoryManagerHistory, setStoryManagerStories]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const clearFiles = useCallback(() => {
    clearFileManagerFiles();
    localStorage.removeItem('figgytales_files');
    localStorage.removeItem('figgytales_settings');
  }, [clearFileManagerFiles]);

  const setStories = useCallback((newStories: UserStory[]) => {
    setStoryManagerStories(newStories);
  }, [setStoryManagerStories]);

  useEffect(() => {
    if (stories.length > 0) {
      localStorage.setItem('figgytales_stories', JSON.stringify(stories));
    }
  }, [stories]);

  const retryFetch = useCallback(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <FileContext.Provider value={{
      files,
      settings,
      stories,
      user,
      history,
      isGenerating,
      isLoading,
      error,
      addFiles,
      removeFile,
      updateSettings,
      clearFiles,
      generateStories: handleGenerateStories,
      createShareLink,
      login,
      logout,
      getHistory,
      updateHistoryTitle,
      addTagToHistory,
      removeTagFromHistory,
      getAvailableTags,
      clearStoredStories,
      setStories,
      retryFetch
    }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};
