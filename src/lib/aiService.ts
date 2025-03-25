
import { AIRequest, AIResponse, UserStory } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const GEMINI_API_KEY = 'AIzaSyCcKtpIVaG0weD7ZIawyLFZMl8kojOM28Q';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

export const generateUserStories = async (request: AIRequest): Promise<AIResponse> => {
  try {
    // For a real implementation, we would call the Gemini API here
    // This is a simplified mock that returns static data
    
    // In a production app, you would format the request and send to Gemini API
    console.log('AI Request:', request);
    
    // Mock response for now
    const mockResponse: AIResponse = {
      stories: Array.from({ length: request.storyCount }, (_, i) => ({
        id: uuidv4(),
        title: `User Story ${i + 1}`,
        description: `As a user, I want to interact with the application, so that I can accomplish my tasks efficiently.`,
        criteria: Array.from({ length: request.criteriaCount }, (_, j) => ({
          id: uuidv4(),
          description: `The application should respond quickly to user interaction ${j + 1}.`
        }))
      }))
    };
    
    return mockResponse;
    
    /* This is how the real implementation would look:
    
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate ${request.storyCount} user stories with ${request.criteriaCount} acceptance criteria each based on these design screens.`
              },
              ...request.images.map(image => ({
                inline_data: {
                  data: image.split(',')[1], // Remove data:image/jpeg;base64, part
                  mime_type: 'image/jpeg', // Adjust based on actual image type
                }
              }))
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Parse the response into user stories (would need to format the text response)
    const stories: UserStory[] = parseAIResponseToStories(data, request);
    
    return { stories };
    */
  } catch (error) {
    console.error('Error calling AI service:', error);
    throw error;
  }
};

// Helper function to parse AI response text into structured stories
function parseAIResponseToStories(aiResponse: any, request: AIRequest): UserStory[] {
  // This would be a more complex function to extract structured data from text
  // For now we just return mock data
  return [];
}
