
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { DesignFile, StorySettings, UserStory } from '@/lib/types';
import { toast } from "sonner";

interface FileContextType {
  files: DesignFile[];
  settings: StorySettings;
  stories: UserStory[];
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  updateSettings: (newSettings: Partial<StorySettings>) => void;
  clearFiles: () => void;
  generateStories: () => void;
  isGenerating: boolean;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<DesignFile[]>([]);
  const [settings, setSettings] = useState<StorySettings>({
    storyCount: 3,
    criteriaCount: 3,
  });
  const [stories, setStories] = useState<UserStory[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addFiles = (newFiles: File[]) => {
    // Filter for image files
    const imageFiles = newFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    // Check if adding these would exceed the 5-file limit
    if (files.length + imageFiles.length > 5) {
      toast.error("Maximum 5 files allowed", {
        description: `You can only upload up to 5 design files.`
      });
      return;
    }
    
    // Create preview URLs and add files
    const filesWithPreviews = imageFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setFiles(prev => [...prev, ...filesWithPreviews]);
    
    if (imageFiles.length > 0) {
      toast.success(`${imageFiles.length} file${imageFiles.length > 1 ? 's' : ''} added`, {
        description: "Ready to generate stories from your designs."
      });
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(file => file.id === id);
      if (fileToRemove) {
        // Revoke the object URL to prevent memory leaks
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(file => file.id !== id);
    });
  };

  const updateSettings = (newSettings: Partial<StorySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const clearFiles = () => {
    // Revoke all object URLs to prevent memory leaks
    files.forEach(file => {
      URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
  };

  // Mock function to generate stories (in a real app, this would call an API)
  const generateStories = () => {
    setIsGenerating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const components = [
        'Login Form', 'Dashboard', 'Navigation Menu', 'Profile Page', 
        'Settings Panel', 'Search Bar', 'Data Table', 'Notification System', 
        'Checkout Flow', 'Image Gallery'
      ];
      
      const interactionTriggers = [
        'clicks', 'hovers', 'scrolls', 'inputs text', 'selects an option'
      ];
      
      const interactionActions = [
        'submit the form', 'navigate to a new page', 'display a tooltip',
        'show a modal', 'update the data', 'trigger an animation'
      ];
      
      const newStories: UserStory[] = [];
      
      for (let i = 0; i < settings.storyCount; i++) {
        const component = components[Math.floor(Math.random() * components.length)];
        
        const criteria = Array.from({ length: settings.criteriaCount }, (_, j) => {
          const trigger = interactionTriggers[Math.floor(Math.random() * interactionTriggers.length)];
          const action = interactionActions[Math.floor(Math.random() * interactionActions.length)];
          
          return {
            id: crypto.randomUUID(),
            description: j < 2
              ? `When the user ${trigger}, the component should ${action}`
              : [
                  'The component should be responsive across all device sizes',
                  'The component should be accessible with proper ARIA attributes',
                  'The component should load within 500ms',
                  'The component should display validation errors when appropriate',
                  'The component should match the design system specifications'
                ][Math.floor(Math.random() * 5)]
          };
        });
        
        newStories.push({
          id: crypto.randomUUID(),
          title: `User Story ${i + 1}`,
          description: `As a user, I want to interact with the ${component}, so that I can accomplish my task effectively.`,
          criteria
        });
      }
      
      setStories(newStories);
      setIsGenerating(false);
      
      toast.success("Stories generated", {
        description: `${newStories.length} user stories created based on your designs.`
      });
    }, 1500);
  };

  return (
    <FileContext.Provider value={{
      files,
      settings,
      stories,
      addFiles,
      removeFile,
      updateSettings,
      clearFiles,
      generateStories,
      isGenerating
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
