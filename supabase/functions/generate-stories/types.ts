
export interface AIRequest {
  prompt: string;
  images: string[];
  storyCount: number;
  criteriaCount: number;
  audienceType?: string; // "internal" or "external" - now optional
  userType: string; // selected user type
}

export interface AIResponse {
  stories: UserStory[];
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
