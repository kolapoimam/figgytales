import { useState, useCallback } from 'react';
import { DesignFile, StorySettings } from '@/lib/types';
import { toast } from "sonner";

export const useFileManager = () => {
  const [files, setFiles] = useState<DesignFile[]>([]);
  const [settings, setSettings] = useState<StorySettings>({
    storyCount: 3,
    criteriaCount: 3,
    userType: "User"
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    try {
      const validImageFiles = newFiles.filter(file => {
        // More reliable way to check image files
        return file.type.match('image.*') && 
               ['.png', '.jpg', '.jpeg', '.svg', '.webp']
                .some(ext => file.name.toLowerCase().endsWith(ext));
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
        try {
          const preview = URL.createObjectURL(file);
          console.log('Created preview URL:', preview); // Debug log
          return {
            id: crypto.randomUUID(),
            file,
            preview
          };
        } catch (error) {
          console.error('Error creating preview for file:', file.name, error);
          return null;
        }
      }).filter(Boolean) as DesignFile[];

      setFiles(prev => [...prev, ...filesWithPreviews]);
      
      if (filesWithPreviews.length > 0) {
        toast.success(`${filesWithPreviews.length} file${filesWithPreviews.length > 1 ? 's' : ''} added`);
      }
    } catch (error) {
      console.error('Error in addFiles:', error);
      toast.error("Failed to process files");
    }
  }, [files.length]);

  // ... rest of the code remains the same ...
};

export default useFileManager;
