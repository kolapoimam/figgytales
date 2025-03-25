
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";
import type { AIRequest, AIResponse, UserStory, AcceptanceCriterion } from "./types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiRequest = await req.json() as AIRequest;
    
    // For now we'll use a mock implementation
    // In a production app, you would call the Google AI Studio API here
    console.log(`Generating ${apiRequest.storyCount} stories with ${apiRequest.criteriaCount} criteria each`);
    console.log(`Request includes ${apiRequest.images.length} images`);
    
    // Mock generating user stories
    const components = [
      'Login Form', 'Dashboard', 'Navigation Menu', 'Profile Page', 
      'Settings Panel', 'Search Bar', 'Data Table', 'Notification System', 
      'Checkout Flow', 'Image Gallery'
    ];
    
    const interactionTriggers = [
      'clicks', 'hovers', 'scrolls', 'inputs text', 'selects an option'
    ];
    
    const interactionActions = [
      'submit the form', 'navigate to a new page', 'display a tooltip',
      'show a modal', 'update the data', 'trigger an animation'
    ];
    
    const stories: UserStory[] = [];
    
    for (let i = 0; i < apiRequest.storyCount; i++) {
      const component = components[Math.floor(Math.random() * components.length)];
      
      const criteria: AcceptanceCriterion[] = Array.from({ length: apiRequest.criteriaCount }, (_, j) => {
        const trigger = interactionTriggers[Math.floor(Math.random() * interactionTriggers.length)];
        const action = interactionActions[Math.floor(Math.random() * interactionActions.length)];
        
        return {
          id: uuidv4(),
          description: j < 2
            ? `When the user ${trigger}, the component should ${action}`
            : [
                'The component should be responsive across all device sizes',
                'The component should be accessible with proper ARIA attributes',
                'The component should load within 500ms',
                'The component should display validation errors when appropriate',
                'The component should match the design system specifications'
              ][Math.floor(Math.random() * 5)]
        };
      });
      
      stories.push({
        id: uuidv4(),
        title: `User Story ${i + 1}`,
        description: `As a user, I want to interact with the ${component}, so that I can accomplish my task effectively.`,
        criteria
      });
    }

    const response: AIResponse = {
      stories
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
