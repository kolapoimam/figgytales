import React, { createContext, useContext, ReactNode, useEffect, useCallback, useState } from 'react';
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
  addFiles: (newFiles: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  updateSettings: (newSettings: Partial<StorySettings>) => void;
  clearFiles: () => void;
  generateStories: () => Promise<void>;
  createShareLink: () => Promise<string>;
  login: (provider: 'google') => Promise<void>;
  logout: () => Promise<void>;
  getHistory: () => Promise<void>;
  clearStoredStories: () => void;
  setStories: (stories: UserStory[]) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const { user, login, logout } = useAuth();
  const [previewGeneration, setPreviewGeneration] = useState<boolean>(false);
  
  const { 
    files, 
    settings, 
    isGenerating, 
    setIsGenerating,
    addFiles: addFilesManager, 
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

  // Enhanced addFiles with preview generation
  const addFiles = useCallback(async (newFiles: File[]) => {
    setPreviewGeneration(true);
    try {
      await addFilesManager(newFiles.map(file => ({
        ...file,
        previewUrl: URL.createObjectURL(file) // Generate preview URLs
      })));
    } catch (error) {
      console.error('Error adding files:', error);
      throw error;
    } finally {
      setPreviewGeneration(false);
    }
  }, [addFilesManager]);

  // Comprehensive clear function
  const clearFiles = useCallback(() => {
    // Revoke object URLs before clearing
    files.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
    clearFileManagerFiles();
    clearStoredStories();
    localStorage.removeItem('figgytales_stories');
    localStorage.removeItem('figgytales_files');
    localStorage.removeItem('figgytales_settings');
  }, [clearFileManagerFiles, clearStoredStories, files]);

  // Set stories directly
  const setStories = useCallback((newStories: UserStory[]) => {
    setStoryManagerStories(newStories);
  }, [setStoryManagerStories]);

  // Load history when user changes
  useEffect(() => {
    if (user) {
      getHistory();
    } else {
      clearStoredStories();
    }
  }, [user, getHistory, clearStoredStories]);

  // Persist data to localStorage
  useEffect(() => {
    if (stories.length > 0) {
      localStorage.setItem('figgytales_stories', JSON.stringify(stories));
    }
    if (files.length > 0) {
      localStorage.setItem('figgytales_files', JSON.stringify(files));
    }
  }, [stories, files]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [files]);

  return (
    <FileContext.Provider value={{
      files,
      settings,
      stories,
      user,
      history,
      isGenerating: isGenerating || previewGeneration,
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
      setStories
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
