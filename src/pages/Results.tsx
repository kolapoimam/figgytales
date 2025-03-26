// fileService.ts (assumed)
export const generateUserStories = async (aiRequest: AIRequest): Promise<UserStory[]> => {
  const response = await callAI({
    prompt: aiRequest.prompt,
    images: aiRequest.images,
  });

  // Parse the AI response to extract user stories
  const stories = response.stories.map((story: any) => ({
    id: crypto.randomUUID(),
    title: story.title,
    description: story.description,
    criteria: story.criteria || [],
  }));

  return stories;
};

// Enhanced version with validation
export const generateUserStories = async (aiRequest: AIRequest): Promise<UserStory[]> => {
  const response = await callAI({
    prompt: aiRequest.prompt,
    images: aiRequest.images,
  });

  const stories = response.stories
    .map((story: any) => ({
      id: crypto.randomUUID(),
      title: story.title,
      description: story.description,
      criteria: story.criteria || [],
    }))
    .filter((story: UserStory) => {
      return (
        story.title?.startsWith('As a') &&
        story.description &&
        Array.isArray(story.criteria) &&
        story.criteria.length === aiRequest.criteriaCount &&
        !story.title?.includes('Here are')
      );
    });

  return stories;
};
