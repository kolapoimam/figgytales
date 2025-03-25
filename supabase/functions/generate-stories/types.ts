
export interface AIRequest {
  prompt: string;
  images: string[];
  storyCount: number;
  criteriaCount: number;
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
