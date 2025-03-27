import { useState, useCallback } from 'react';
import { DesignFile, StorySettings } from '@/lib/types';
import { toast } from "sonner";

export const useFileManager = () => {
  const [files, setFiles] = useState<DesignFile[]>([]);
  const [settings, setSettings] = useState<StorySettings>({
    storyCount: 3,
    criteriaCount: 3,
    userType: "User" // Default user type without requiring audience type
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    // Filter for valid image files
    const validImageFiles = newFiles.filter(file => {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
      return validTypes.includes(file.type);
    });

    if (validImageFiles.length === 0) {
      toast.error("Invalid file type", {
        description: "Please upload only image files (PNG, JPG, JPEG, SVG, or WEBP)."
      });
      return;
    }

    if (files.length + validImageFiles.length > 5) {
      toast.error("Maximum 5 files allowed", {
        description: `You can only upload up to 5 design files.`
      });
      return;
    }

    const filesWithPreviews = validImageFiles.map(file => {
      // Create object URL for preview
      const preview = URL.createObjectURL(file);
      
      // Create a DesignFile object
      return {
        id: crypto.randomUUID(),
        file,
        preview
      };
    });

    setFiles(prev => [...prev, ...filesWithPreviews]);
    
    if (filesWithPreviews.length > 0) {
      toast.success(`${filesWithPreviews.length} file${filesWithPreviews.length > 1 ? 's' : ''} added`, {
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
    setSettings(prev => ({ ...prev, ...newSettings }));
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
