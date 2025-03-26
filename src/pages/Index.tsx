import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import PreviewGrid from '@/components/PreviewGrid';
import SettingsPanel from '@/components/SettingsPanel';
import { useFiles } from '@/context/FileContext';
import { Button } from '@/components/Button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const { 
    files,
    stories, 
    clearFiles,
    generateStories,
    isGenerating,
    settings // Make sure this is available in your context
  } = useFiles();
  const navigate = useNavigate();
  
  // Clear state on mount but preserve settings
  useEffect(() => {
    const resetFiles = () => {
      clearFiles();
      // Keep stories in localStorage for potential recovery
      if (stories.length > 0) {
        localStorage.setItem('figgytales_stories', JSON.stringify(stories));
      }
    };
    resetFiles();
  }, [clearFiles, stories]);

  // Navigate to results when stories exist
  useEffect(() => {
    if (stories.length > 0) {
      navigate('/results', { replace: true });
    }
  }, [stories, navigate]);

  const handleGenerate = async () => {
    if (files.length === 0) {
      toast.warning('Please upload design files first');
      return;
    }

    try {
      await generateStories();
    } catch (error) {
      toast.error('Failed to generate stories');
      console.error('Generation error:', error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20">
        <div className="stagger-children">
          <div className="animate-slide-down space-y-8">
            {/* File Upload Section */}
            <FileUploader />
            
            {/* Preview Grid - Only shown when files exist */}
            {files.length > 0 && <PreviewGrid />}
            
            {/* Settings Panel - Always visible */}
            <SettingsPanel />
            
            {/* Generate Button - Only shown when files exist */}
            {files.length > 0 && (
              <div className="flex justify-center pt-6">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Stories...
                    </>
                  ) : (
                    'Generate User Stories'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Index;
