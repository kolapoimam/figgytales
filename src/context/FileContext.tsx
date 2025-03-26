import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { DesignFile, StorySettings, UserStory, GenerationHistory, User } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useFileManager } from '@/hooks/useFileManager';
import { useStoryManager } from '@/hooks/useStoryManager';

interface FileContextType {
  files: DesignFile[];
  settings: StorySettings;
  stories: UserStory[];
  user: User | null;
  history: GenerationHistory[];
  isGenerating: boolean;
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  updateSettings: (newSettings: Partial<StorySettings>) => void;
  clearFiles: () => void;
  generateStories: () => Promise<void>;
  createShareLink: () => Promise<string>;
  login: (provider: 'google') => Promise<void>;
  logout: () => Promise<void>;
  getHistory: () => Promise<void>;
  clearStoredStories: () => void;
  setStories: (stories: UserStory[]) => void; // Added to allow explicit story setting
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const { user, login, logout } = useAuth();
  const { 
    files, 
    settings, 
    isGenerating, 
    setIsGenerating,
    addFiles, 
    removeFile, 
    updateSettings, 
    clearFiles: clearFilesFromManager 
  } = useFileManager();
  
  const { 
    stories: managedStories, 
    history, 
    generateStories, 
    createShareLink, 
    getHistory,
    clearStoredStories: clearManagedStories
  } = useStoryManager(files, settings, user?.id || null, setIsGenerating);

  // Local state for stories to allow manual control
  const [stories, setStories] = useState<UserStory[]>(() => {
    // Initialize from localStorage if available
    const savedStoriesJson = localStorage.getItem('figgytales_stories');
    if (savedStoriesJson) {
      try {
        const savedStories = JSON.parse(savedStoriesJson);
        if (Array.isArray(savedStories)) {
          return savedStories;
        }
      } catch (error) {
        console.error('Failed to parse saved stories:', error);
      }
    }
    return [];
  });

  // Sync stories with localStorage when they change
  useEffect(() => {
    if (stories.length > 0) {
      localStorage.setItem('figgytales_stories', JSON.stringify(stories));
    } else {
      localStorage.removeItem('figgytales_stories');
    }
  }, [stories]);

  // Load history when user changes
  useEffect(() => {
    if (user) {
      getHistory();
    }
  }, [user, getHistory]);

  // Override clearFiles to also clear stories
  const clearFiles = () => {
    clearFilesFromManager();
    setStories([]);
    localStorage.removeItem('figgytales_stories');
  };

  // Override clearStoredStories to ensure full reset
  const clearStoredStories = () => {
    clearManagedStories();
    setStories([]);
    localStorage.removeItem('figgytales_stories');
  };

  // Merge managedStories into local stories when generation completes
  useEffect(() => {
    if (managedStories.length > 0 && !isGenerating) {
      setStories(managedStories);
    }
  }, [managedStories, isGenerating]);

  return (
    <FileContext.Provider value={{
      files,
      settings,
      stories,
      user,
      history,
      isGenerating,
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
      setStories // Expose setStories for explicit control
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
