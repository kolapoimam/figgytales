
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { DesignFile, StorySettings, UserStory, GenerationHistory, ShareLink, User, AIRequest, AIResponse } from '@/lib/types';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || null,
            avatar: session.user.user_metadata.avatar_url || null
          });
          getHistory();
        } else {
          setUser(null);
          setHistory([]);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || null,
          avatar: session.user.user_metadata.avatar_url || null
        });
        getHistory();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const generateStories = useCallback(async () => {
    if (files.length === 0) return;
    
    setIsGenerating(true);
    try {
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
      
      const aiRequest: AIRequest = {
        prompt: `Generate ${settings.storyCount} user stories with ${settings.criteriaCount} acceptance criteria each based on these design screens.`,
        images: imageBase64s,
        storyCount: settings.storyCount,
        criteriaCount: settings.criteriaCount
      };
      
      const { data, error } = await supabase.functions.invoke('generate-stories', {
        body: aiRequest
      });
      
      if (error) {
        throw error;
      }
      
      if (data && data.stories) {
        setStories(data.stories);
        
        if (user) {
          const newHistoryEntry: GenerationHistory = {
            id: uuidv4(),
            timestamp: new Date(),
            stories: data.stories,
            settings: { ...settings }
          };
          
          if (user) {
            try {
              // Fix the type issues with the history insert
              await supabase
                .from('history')
                .insert({
                  user_id: user.id,
                  settings: settings,
                  stories: data.stories,
                  created_at: new Date().toISOString()
                });
            } catch (error) {
              console.error('Error saving to history:', error);
            }
          }
          
          setHistory(prev => [newHistoryEntry, ...prev]);
        }
        
        toast.success("Stories generated", {
          description: `${data.stories.length} user stories created based on your designs.`
        });
      } else {
        throw new Error('No stories returned from the API');
      }
      
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating stories:', error);
      toast.error("Failed to generate stories", {
        description: "There was an error processing your design files."
      });
      setIsGenerating(false);
    }
  }, [files, settings, user]);

  const createShareLink = useCallback(async () => {
    if (stories.length === 0) {
      toast.error("No stories to share");
      return "";
    }

    try {
      const shareId = uuidv4();
      if (user) {
        // Fix the type issues with the shared_links insert
        await supabase
          .from('shared_links')
          .insert({
            id: shareId,
            user_id: user.id,
            stories: stories,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
      }
      
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
  }, [stories, user]);

  const login = useCallback(async (provider: 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/results`
        }
      });
      
      if (error) throw error;
      
      return;
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      toast.success("Logged out successfully");
      return;
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Logout failed");
    }
  }, []);

  const getHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      // Fix the type issues with the history select
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedHistory: GenerationHistory[] = data.map(item => ({
          id: item.id,
          timestamp: new Date(item.created_at),
          stories: item.stories,
          settings: item.settings
        }));
        
        setHistory(formattedHistory);
      }
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
