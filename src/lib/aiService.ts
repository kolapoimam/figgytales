import { AIRequest, AIResponse } from '@/lib/types';

// This file is now just a placeholder since we're using the Supabase Edge Function
// No need for the mock implementation anymore
export const generateUserStories = async (request: AIRequest): Promise<AIResponse> => {
  throw new Error('This function is deprecated. Use fileService.generateUserStories instead.');
};
