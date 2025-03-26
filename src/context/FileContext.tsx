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
  setStories: (stories: UserStory[]) => void; // Added for direct manipulation
  resetApplication: () => void; // New comprehensive reset function
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const { user, login, logout } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { 
    files, 
    settings, 
    isGenerating, 
    setIsGenerating,
    addFiles: addFilesManager, 
    removeFile, 
    updateSettings, 
    clearFiles: clearFileManagerFiles,
    setFiles // Added from useFileManager
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
    const filesWithPreviews = await Promise.all(
      newFiles.map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        previewUrl: URL.createObjectURL(file),
        file
      }))
    );
    await addFilesManager(filesWithPreviews);
  }, [addFilesManager]);

  // Comprehensive clear function
  const clearFiles = useCallback(() => {
    // Revoke object URLs
    files.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
    clearFileManagerFiles();
    clearStoredStories();
  }, [files, clearFileManagerFiles, clearStoredStories]);

  // Complete application reset
  const resetApplication = useCallback(() => {
    clearFiles();
    setStories([]);
    localStorage.removeItem('figgytales_stories');
    localStorage.removeItem('figgytales_files');
    localStorage.removeItem('figgytales_settings');
  }, [clearFiles, setStories]);

  // Set stories directly
  const setStories = useCallback((newStories: UserStory[]) => {
    setStoryManagerStories(newStories);
  }, [setStoryManagerStories]);

  // Initialize state from localStorage
  useEffect(() => {
    if (isInitialized) return;

    const loadInitialState = async () => {
      try {
        const savedFiles = localStorage.getItem('figgytales_files');
        if (savedFiles) {
          const parsedFiles = JSON.parse(savedFiles);
          if (Array.isArray(parsedFiles)) {
            await addFilesManager(parsedFiles);
          }
        }

        const savedStories = localStorage.getItem('figgytales_stories');
        if (savedStories) {
          const parsedStories = JSON.parse(savedStories);
          if (Array.isArray(parsedStories)) {
            setStories(parsedStories);
          }
        }
      } catch (error) {
        console.error('Error loading initial state:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadInitialState();
  }, [addFilesManager, setStories, isInitialized]);

  // Persist data to localStorage
  useEffect(() => {
    if (!isInitialized) return;

    if (stories.length > 0) {
      localStorage.setItem('figgytales_stories', JSON.stringify(stories));
    } else {
      localStorage.removeItem('figgytales_stories');
    }

    if (files.length > 0) {
      localStorage.setItem('figgytales_files', JSON.stringify(files));
    } else {
      localStorage.removeItem('figgytales_files');
    }

    localStorage.setItem('figgytales_settings', JSON.stringify(settings));
  }, [stories, files, settings, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [files]);

  // Load history when user changes
  useEffect(() => {
    if (user) {
      getHistory();
    } else {
      clearStoredStories();
    }
  }, [user, getHistory, clearStoredStories]);

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
      setStories,
      resetApplication // Expose the reset function
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
