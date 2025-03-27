/* eslint-disable react-hooks/exhaustive-deps */

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
    const imageFiles = newFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length + imageFiles.length > 5) {
      toast.error("Maximum 5 files allowed", {
        description: `You can only upload up to 5 design files.`
      });
      return;
    }
    
    const filesWithPreviewsPromises = imageFiles.map(file => 
      new Promise<DesignFile>((resolve) => {
        // Create object URL for preview
        const preview = URL.createObjectURL(file);
        
        // Create a DesignFile object
        const designFile: DesignFile = {
          id: crypto.randomUUID(),
          file,
          preview
        };
        
        resolve(designFile);
      })
    );
    
    // Wait for all previews to be generated
    Promise.all(filesWithPreviewsPromises).then(filesWithPreviews => {
      setFiles(prev => [...prev, ...filesWithPreviews]);
      
      if (filesWithPreviews.length > 0) {
        toast.success(`${filesWithPreviews.length} file${filesWithPreviews.length > 1 ? 's' : ''} added`, {
          description: "Ready to generate stories from your designs."
        });
      }
    });
  }, []);

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
  }, []);

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
