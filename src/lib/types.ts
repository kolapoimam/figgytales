
export interface DesignFile {
  id: string;
  file: File;
  preview: string;
}

export interface StorySettings {
  storyCount: number;
  criteriaCount: number;
}

export interface AcceptanceCriterion {
  id: string;
  description: string;
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  criteria: AcceptanceCriterion[];
}
