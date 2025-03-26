
import { useState, useCallback } from 'react';
import { DesignFile, StorySettings } from '@/lib/types';
import { toast } from "sonner";

export const useFileManager = () => {
  const [files, setFiles] = useState<DesignFile[]>([]);
  const [settings, setSettings] = useState<StorySettings>({
    storyCount: 3,
    criteriaCount: 3,
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
