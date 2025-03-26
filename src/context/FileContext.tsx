import React, { createContext, useContext, ReactNode, useEffect, useCallback } from 'react';
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
  setStories: (stories: UserStory[]) => void; // Added for direct stories manipulation
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

  // Comprehensive clear function
  const clearFiles = useCallback(() => {
    clearFileManagerFiles();
    clearStoredStories();
    localStorage.removeItem('figgytales_stories');
    localStorage.removeItem('figgytales_files');
    localStorage.removeItem('figgytales_settings');
  }, [clearFileManagerFiles, clearStoredStories]);

  // Set stories directly (for restoring from localStorage)
  const setStories = useCallback((newStories: UserStory[]) => {
    setStoryManagerStories(newStories);
  }, [setStoryManagerStories]);

  // Load history when user changes
  useEffect(() => {
    if (user) {
      getHistory();
    } else {
      // Clear user-specific data when logging out
      clearStoredStories();
    }
  }, [user, getHistory, clearStoredStories]);

  // Persist stories to localStorage when they change
  useEffect(() => {
    if (stories.length > 0) {
      localStorage.setItem('figgytales_stories', JSON.stringify(stories));
    }
  }, [stories]);

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
      setStories // Expose setStories to consumers
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
