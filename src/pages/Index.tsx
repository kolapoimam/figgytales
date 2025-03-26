import React, { useEffect, useState } from 'react';
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
    isGenerating 
  } = useFiles();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize and clear state
  useEffect(() => {
    clearFiles();
    setIsInitialized(true);
    return () => {
      // Cleanup if needed
    };
  }, [clearFiles]);

  // Navigate to results when stories are generated
  useEffect(() => {
    if (stories.length > 0) {
      navigate('/results', { replace: true });
    }
  }, [stories, navigate]);

  const handleGenerate = async () => {
    if (files.length === 0) {
      toast.warning('Please upload files first');
      return;
    }

    try {
      await generateStories();
      toast.success('Stories generated successfully!');
    } catch (error) {
      toast.error('Failed to generate stories');
      console.error('Generation error:', error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20">
        <div className="space-y-8">
          <FileUploader />
          
          {/* Only show preview if files exist */}
          {files.length > 0 && (
            <>
              <PreviewGrid files={files} />
              <SettingsPanel />
              
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Stories'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Index;
