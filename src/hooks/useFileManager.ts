// useFileManager.ts
import { useState, useCallback } from 'react';
import { DesignFile, StorySettings } from '@/lib/types';
import { toast } from "sonner";

const useFileManager = () => {
  const [files, setFiles] = useState<DesignFile[]>([]);
  const [settings, setSettings] = useState<StorySettings>({
    storyCount: 3,
    criteriaCount: 3,
    userType: "User"
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // ... (rest of the hook implementation remains the same) ...

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

export default useFileManager; // Make sure this is a default export
