import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import PreviewGrid from '@/components/PreviewGrid';
import SettingsPanel from '@/components/SettingsPanel';
import { useFiles } from '@/context/FileContext';
import { Button } from '@/components/Button';
import { Loader2 } from 'lucide-react';

const Index: React.FC = () => {
  const { files, stories, generateStories, isGenerating } = useFiles();
  const navigate = useNavigate();

  // Redirect to results when stories are generated
  useEffect(() => {
    if (stories.length > 0) {
      navigate('/results');
    }
  }, [stories, navigate]);

  const handleGenerate = async () => {
    if (files.length === 0) return;
    await generateStories();
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20 stagger-children">
        <div className="animate-slide-down">
          <FileUploader />
          {files.length > 0 && <PreviewGrid />}
        </div>
        
        <SettingsPanel />

        {files.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto"
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
        )}
      </div>
    </main>
  );
};

export default Index;
