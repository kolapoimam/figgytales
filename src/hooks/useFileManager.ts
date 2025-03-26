import { useState, useCallback } from 'react';
import { DesignFile, StorySettings } from '@/lib/types';
import { toast } from "sonner";

export const useFileManager = () => {
  const [files, setFiles] = useState<DesignFile[]>([]);
  const [settings, setSettings] = useState<StorySettings>({
    storyCount: 4,
    criteriaCount: 4,
    userType: "User"
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    const imageFiles = newFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length + imageFiles.length > 5) {
      toast.error("Maximum 5 files allowed", {
        description: `You can only upload up to 5 design files.`
      });
      return;
    }
    
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
  }, [files.length]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(file => file.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(file => file.id !== id);
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<StorySettings>) => {
    setSettings(prev => {
      const updatedSettings = { ...prev, ...newSettings };
      // Validate storyCount
      if (updatedSettings.storyCount < 1 || updatedSettings.storyCount > 15) {
        toast.error("Invalid number of stories", {
          description: "Please specify between 1 and 15 user stories."
        });
        updatedSettings.storyCount = Math.max(1, Math.min(15, updatedSettings.storyCount));
      }
      // Validate criteriaCount
      if (updatedSettings.criteriaCount < 1 || updatedSettings.criteriaCount > 8) {
        toast.error("Invalid number of criteria", {
          description: "Please specify between 1 and 8 acceptance criteria per story."
        });
        updatedSettings.criteriaCount = Math.max(1, Math.min(8, updatedSettings.criteriaCount));
      }
      return updatedSettings;
    });
  }, []);

  const clearFiles = useCallback(() => {
    files.forEach(file => {
      URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
  }, [files]);

  return {
    files,
    settings,
    isGenerating,
    setIsGenerating,
    addFiles,
    removeFile,
    updateSettings,
    clearFiles
  };
};
