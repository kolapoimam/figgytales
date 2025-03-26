import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import PreviewGrid from '@/components/PreviewGrid';
import SettingsPanel from '@/components/SettingsPanel';
import { useFiles } from '@/context/FileContext';
import { Button } from '@/components/Button';

const Index: React.FC = () => {
  const { files, stories, clearFiles, generateStories, isGenerating } = useFiles();
  const navigate = useNavigate();
  
  // Clear state on mount but preserve settings
  useEffect(() => {
    clearFiles();
    return () => {
      // Optional cleanup if needed
    };
  }, [clearFiles]);

  const handleGenerate = async () => {
    if (files.length === 0) {
      alert('Please upload files first');
      return;
    }

    try {
      await generateStories();
      navigate('/results'); // Only navigate after successful generation
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate stories');
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
                  {isGenerating ? 'Generating...' : 'Generate User Stories'}
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
