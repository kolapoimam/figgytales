import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { DesignFile, StorySettings, UserStory, GenerationHistory, ShareLink, User, AIRequest, AIResponse } from '@/lib/types';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

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
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<GenerationHistory[]>([]);

  const addFiles = useCallback((newFiles: File[]) => {
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
  }, [files.length]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(file => file.id === id);
      if (fileToRemove) {
        // Revoke the object URL to prevent memory leaks
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(file => file.id !== id);
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<StorySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const clearFiles = useCallback(() => {
    // Revoke all object URLs to prevent memory leaks
    files.forEach(file => {
      URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
    // Clear stories but don't touch user state
    setStories([]);
  }, [files]);

  // Function to generate stories using Gemini API
  const generateStories = useCallback(async () => {
    if (files.length === 0) return;
    
    setIsGenerating(true);
    try {
      // Mock Gemini API call for now
      // In a real implementation, you would send the images to the Gemini API
      
      // Convert images to base64 for API
      const imagePromises = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file.file);
        });
      });
      
      const imageBase64s = await Promise.all(imagePromises);
      
      // Simulate API call
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
        
        // Add to history if user is logged in
        if (user) {
          const newHistoryEntry: GenerationHistory = {
            id: uuidv4(),
            timestamp: new Date(),
            stories: newStories,
            settings: { ...settings }
          };
          
          setHistory(prev => [newHistoryEntry, ...prev]);
        }
        
        toast.success("Stories generated", {
          description: `${newStories.length} user stories created based on your designs.`
        });
      }, 1500);
      
    } catch (error) {
      console.error('Error generating stories:', error);
      toast.error("Failed to generate stories", {
        description: "There was an error processing your design files."
      });
      setIsGenerating(false);
    }
  }, [files, settings, user]);

  // Create share link function
  const createShareLink = useCallback(async () => {
    if (stories.length === 0) {
      toast.error("No stories to share");
      return "";
    }

    try {
      // In a real app, this would create an entry in a database
      // For now, we'll mock it with a fake URL
      const shareId = uuidv4();
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      
      toast.success("Share link created", {
        description: "Link copied to clipboard!"
      });
      
      navigator.clipboard.writeText(shareUrl);
      
      return shareUrl;
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error("Failed to create share link");
      return "";
    }
  }, [stories]);

  // Mock login function
  const login = useCallback(async (provider: 'google') => {
    try {
      // Mock login
      const mockUser: User = {
        id: uuidv4(),
        email: 'user@example.com',
        name: 'Demo User',
        avatar: null
      };
      
      setUser(mockUser);
      toast.success("Logged in successfully");
      
      // Mock fetch user's history
      await getHistory();
      
      return;
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed");
    }
  }, []);

  // Mock logout function
  const logout = useCallback(async () => {
    try {
      setUser(null);
      toast.success("Logged out successfully");
      return;
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Logout failed");
    }
  }, []);

  // Mock get history function
  const getHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      // Mock history data
      const mockHistory: GenerationHistory[] = [
        {
          id: uuidv4(),
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          stories: [{
            id: uuidv4(),
            title: "Previous User Story 1",
            description: "This is a story from a previous generation.",
            criteria: [
              { id: uuidv4(), description: "Previous criterion 1" },
              { id: uuidv4(), description: "Previous criterion 2" }
            ]
          }],
          settings: { storyCount: 1, criteriaCount: 2 }
        }
      ];
      
      setHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error("Failed to load history");
    }
  }, [user]);

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
      getHistory
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

