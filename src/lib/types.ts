
export interface DesignFile {
  id: string;
  file: File;
  preview: string;
}

export interface StorySettings {
  storyCount: number;
  criteriaCount: number;
  audienceType?: string; // "internal" or "external", now optional
  userType: string; // selected user type
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
  audienceType?: string; // Now optional
  userType: string;
}

export interface AIResponse {
  stories: UserStory[];
}

// User types for dropdown
export const USER_TYPES = {
  internal: ["Developer", "Product Manager", "Designer", "QA Engineer", "Business Analyst"],
  external: ["Customer", "End User", "Administrator", "Guest User", "Mobile User", "Power User"],
  default: ["User", "Customer", "Administrator", "Guest", "Developer"]
};
