
import React, { useEffect } from 'react';
import { useFiles } from '@/context/FileContext';
import { Button } from '@/components/Button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Settings, Wand2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { USER_TYPES } from '@/lib/types';

const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, files, generateStories, isGenerating } = useFiles();
  
  const handleStoryCountChange = (value: number[]) => {
    updateSettings({ storyCount: value[0] });
  };
  
  const handleStoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 15) {
      updateSettings({ storyCount: value });
    }
  };
  
  const handleCriteriaCountChange = (value: number[]) => {
    updateSettings({ criteriaCount: value[0] });
  };
  
  const handleCriteriaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 8) {
      updateSettings({ criteriaCount: value });
    }
  };

  const handleAudienceTypeChange = (value: string) => {
    // When audience type changes, reset the user type to first item in the corresponding list
    const newUserType = USER_TYPES[value as keyof typeof USER_TYPES][0];
    updateSettings({ 
      audienceType: value,
      userType: newUserType
    });
  };
  
  const handleUserTypeChange = (value: string) => {
    updateSettings({ userType: value });
  };
  
  useEffect(() => {
    // Ensure userType is valid whenever audienceType changes
    const validUserTypes = USER_TYPES[settings.audienceType as keyof typeof USER_TYPES];
    if (!validUserTypes.includes(settings.userType)) {
      updateSettings({ userType: validUserTypes[0] });
    }
  }, [settings.audienceType]);
  
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
            <div className="flex items-center gap-2">
              <Input
                id="storyCountInput"
                type="number"
                min={1}
                max={15}
                value={settings.storyCount}
                onChange={handleStoryInputChange}
                className="w-16 h-8 text-center"
              />
            </div>
          </div>
          <Slider
            id="storyCount"
            min={1}
            max={15}
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
            <div className="flex items-center gap-2">
              <Input
                id="criteriaCountInput"
                type="number"
                min={1}
                max={8}
                value={settings.criteriaCount}
                onChange={handleCriteriaInputChange}
                className="w-16 h-8 text-center"
              />
            </div>
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
        
        {/* New audience type selection */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Audience Type</label>
          <RadioGroup 
            value={settings.audienceType} 
            onValueChange={handleAudienceTypeChange}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="internal" id="internal" />
              <Label htmlFor="internal">Internal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="external" id="external" />
              <Label htmlFor="external">External</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* New user type dropdown */}
        <div className="space-y-4">
          <label htmlFor="userType" className="text-sm font-medium">User Type</label>
          <Select 
            value={settings.userType} 
            onValueChange={handleUserTypeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a user type" />
            </SelectTrigger>
            <SelectContent>
              {USER_TYPES[settings.audienceType as keyof typeof USER_TYPES].map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="pt-4">
          <Button
            onClick={() => generateStories()}
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
