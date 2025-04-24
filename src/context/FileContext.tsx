// FileContext.tsx
import React, { createContext, useContext, ReactNode, useEffect, useCallback, useState } from 'react';
import { 
  DesignFile, 
  StorySettings, 
  UserStory, 
  GenerationHistory, 
  User,
  AIRequest,
  AIResponse
} from '@/lib/types';
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
  generateStories: (request: AIRequest) => Promise<AIResponse>;
  createShareLink: () => Promise<string>;
  login: (provider: 'google' | 'email', options?: any) => Promise<void>;
  logout: () => Promise<void>;
  getHistory: () => Promise<GenerationHistory[]>;
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

  // Enhanced generateStories function with proper typing
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

  // Load initial data with proper typing
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load from localStorage with validation
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

      if (user) {
        const historyData = await getHistory();
        return historyData;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      toast.error('Failed to load initial data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, getHistory, setStoryManagerStories]);

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
