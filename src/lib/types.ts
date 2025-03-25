
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

export interface GenerationHistory {
  id: string;
  timestamp: Date;
  stories: UserStory[];
  settings: StorySettings;
}

export interface ShareLink {
  id: string;
  stories: UserStory[];
  expiresAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

export type ThemeMode = 'light' | 'dark';

export interface AIRequest {
  prompt: string;
  images: string[];
  storyCount: number;
  criteriaCount: number;
}

export interface AIResponse {
  stories: UserStory[];
}
