import React, { createContext, useContext, ReactNode, useEffect, useCallback, useState } from 'react';
import { DesignFile, StorySettings, UserStory, GenerationHistory, User } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useFileManager } from '@/hooks/useFileManager';
import { useStoryManager } from '@/hooks/useStoryManager';
import { toast } from 'sonner';

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
  generateStories: () => Promise<void>;
  createShareLink: () => Promise<string>;
  login: (provider: 'google' | 'email', options?: any) => Promise<void>;
  logout: () => Promise<void>;
  getHistory: () => Promise<void>;
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
    getHistory,
    clearStoredStories,
    setStories: setStoryManagerStories
  } = useStoryManager(files, settings, user?.id || null, setIsGenerating);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check localStorage for stories
      const savedStories = localStorage.getItem('figgytales_stories');
      if (savedStories) {
        try {
          const parsedStories = JSON.parse(savedStories);
          if (Array.isArray(parsedStories)) {
            setStoryManagerStories(parsedStories);
          }
        } catch (e) {
          console.error("Error parsing saved stories:", e);
        }
      }

      // Load history if user is logged in
      if (user) {
        await getHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      toast.error('Failed to load initial data');
    } finally {
      setIsLoading(false);
    }
  }, [user, getHistory, setStoryManagerStories]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Comprehensive clear function
  const clearFiles = useCallback(() => {
    clearFileManagerFiles();
    localStorage.removeItem('figgytales_files');
    localStorage.removeItem('figgytales_settings');
  }, [clearFileManagerFiles]);

  // Set stories directly (for restoring from localStorage)
  const setStories = useCallback((newStories: UserStory[]) => {
    setStoryManagerStories(newStories);
  }, [setStoryManagerStories]);

  // Persist stories to localStorage when they change
  useEffect(() => {
    if (stories.length > 0) {
      localStorage.setItem('figgytales_stories', JSON.stringify(stories));
    }
  }, [stories]);

  // Retry mechanism
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
      generateStories,
      createShareLink,
      login,
      logout,
      getHistory,
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
