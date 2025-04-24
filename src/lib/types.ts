// types.ts
export interface DesignFile {
  id: string;
  file: File;
  preview: string;
}

export interface StorySettings {
  storyCount: number;
  criteriaCount: number;
  audienceType?: 'internal' | 'external'; // Explicit union type
  userType: string;
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
  created_at?: string;
}

export type ThemeMode = 'light' | 'dark';

export interface AIRequest {
  prompt: string;
  images: string[];
  storyCount: number;
  criteriaCount: number;
  audienceType?: 'internal' | 'external';
  userType: string;
}

export interface AIResponse {
  stories: UserStory[];
}

export const USER_TYPES = {
  internal: ["Developer", "Product Manager", "Designer", "QA Engineer", "Business Analyst"],
  external: ["Customer", "End User", "Administrator", "Guest User", "Mobile User", "Power User"],
  default: ["User", "Customer", "Administrator", "Guest", "Developer"]
} as const;

export type InternalUserType = typeof USER_TYPES.internal[number];
export type ExternalUserType = typeof USER_TYPES.external[number];
export type DefaultUserType = typeof USER_TYPES.default[number];

export interface UpcomingFeature {
  id: string;
  title: string;
  description: string;
  upvotes: number;
  hasUpvoted: boolean;
  created_at?: string;
}

export interface FeatureUpvote {
  id: string;
  feature_id: string;
  user_id?: string;
  ip_address?: string;
  created_at?: string;
}
