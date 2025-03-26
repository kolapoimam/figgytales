// src/pages/Index.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import SettingsForm from '@/components/SettingsForm';
import { Button } from '@/components/Button';
import { useFiles } from '@/context/FileContext';

const Index: React.FC = () => {
  const {
    files,
    settings,
    isGenerating,
    addFiles,
    removeFile,
    updateSettings,
    generateStories,
  } = useFiles(); // Line 20: useFiles hook is called here

  const navigate = useNavigate();

  const handleGenerate = async () => {
    await generateStories();
    navigate('/results');
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20">
        <h1 className="text-3xl font-bold mb-8 text-center animate-fade-in">
          Generate User Stories from Designs
        </h1>
        <FileUpload
          files={files}
          onAddFiles={addFiles}
          onRemoveFile={removeFile}
        />
        <SettingsForm settings={settings} onUpdateSettings={updateSettings} />
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || files.length === 0}
            className="w-full sm:w-auto"
          >
            {isGenerating ? 'Generating...' : 'Generate Stories'}
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Index;
