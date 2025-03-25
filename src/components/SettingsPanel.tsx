
import React from 'react';
import { useFiles } from '@/context/FileContext';
import { Button } from '@/components/Button';
import { Slider } from '@/components/ui/slider';
import { Settings, Wand2 } from 'lucide-react';

const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, files, generateStories, isGenerating } = useFiles();
  
  const handleStoryCountChange = (value: number[]) => {
    updateSettings({ storyCount: value[0] });
  };
  
  const handleCriteriaCountChange = (value: number[]) => {
    updateSettings({ criteriaCount: value[0] });
  };
  
  return (
    <div className="mt-12 bg-secondary/50 rounded-xl p-6 animate-slide-up border border-border">
      <div className="flex items-center mb-6">
        <Settings size={20} className="mr-2 text-primary" />
        <h2 className="text-xl font-medium">Story Generation Settings</h2>
      </div>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="storyCount" className="text-sm font-medium">
              Number of User Stories
            </label>
            <span className="text-sm bg-secondary px-2 py-1 rounded-md font-medium">
              {settings.storyCount}
            </span>
          </div>
          <Slider
            id="storyCount"
            min={1}
            max={10}
            step={1}
            value={[settings.storyCount]}
            onValueChange={handleStoryCountChange}
            className="py-2"
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="criteriaCount" className="text-sm font-medium">
              Acceptance Criteria per Story
            </label>
            <span className="text-sm bg-secondary px-2 py-1 rounded-md font-medium">
              {settings.criteriaCount}
            </span>
          </div>
          <Slider
            id="criteriaCount"
            min={1}
            max={8}
            step={1}
            value={[settings.criteriaCount]}
            onValueChange={handleCriteriaCountChange}
            className="py-2"
          />
        </div>
        
        <div className="pt-4">
          <Button
            onClick={generateStories}
            disabled={files.length === 0 || isGenerating}
            isLoading={isGenerating}
            className="w-full"
            size="lg"
          >
            {!isGenerating && <Wand2 size={16} className="mr-2" />}
            {isGenerating ? 'Generating Stories...' : 'Generate User Stories'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
