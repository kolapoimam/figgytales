import React from 'react';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import PreviewGrid from '@/components/PreviewGrid';
import SettingsPanel from '@/components/SettingsPanel';
import { useFiles } from '@/context/FileContext';
import { Button } from '@/components/Button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const { files, generateStories, isGenerating } = useFiles();

  const handleGenerateStories = async () => {
    if (files.length === 0) {
      toast.warning('Please upload design files first');
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

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20">
        <div className="space-y-6">
          <FileUploader />
          
          {files.length > 0 && (
            <>
              <PreviewGrid />
              <SettingsPanel />
              
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleGenerateStories}
                  disabled={isGenerating}
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate User Stories'
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
