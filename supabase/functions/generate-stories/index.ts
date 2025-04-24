import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AIRequest, AIResponse, UserStory, AcceptanceCriterion } from "./types.ts";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Google Generative AI API key from environment
const GOOGLE_AI_API_KEY = 'AIzaSyCcKtpIVaG0weD7ZIawyLFZMl8kojOM28Q';

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const requestData: AIRequest = await req.json();
    
    if (!requestData.images || requestData.images.length === 0) {
      throw new Error('No images provided in the request');
    }
    
    console.log(`Generating ${requestData.storyCount} user stories with ${requestData.criteriaCount} acceptance criteria each`);
    console.log(`Number of images: ${requestData.images.length}`);
    
    if (requestData.audienceType) {
      console.log(`Audience: ${requestData.audienceType}, User Type: ${requestData.userType}`);
    } else {
      console.log(`User Type: ${requestData.userType} (no specific audience type)`);
    }

    // Enhanced prompt for better quality user stories
let userPrompt = `
Generate ${requestData.storyCount} clear, granular user stories with ${requestData.criteriaCount} specific acceptance criteria each based on these design screens.

Key requirements for each user story:
1. Follow the exact format: "As a [specific user role], I want to [concrete action], so that [clear business value]"
   - Example: "As a merchant, I want to submit transactions for settlement, so that I receive my funds"
2. User role must be specific (e.g., "admin user" not just "user")
3. Action should be concrete, testable, and implementation-agnostic
4. Benefit must explain real business value, not just features

For acceptance criteria:
1. Each must be independently testable and specific
2. Start with action verbs ("System shall...", "User can...")
3. Include edge cases and validation rules where relevant
4. Be specific about conditions, outcomes, and success metrics

Output format for each story:
---
Title: [Short, descriptive feature name (3-5 words)] 
User Story: [Complete narrative in "As a..." format]
Acceptance Criteria:
1. [First testable criterion]
2. [Second testable criterion]
...

Critical requirements:
1. NEVER include "Story #1", "Story #2" etc. in the output
2. Title must be a feature name, NOT the user story text
3. User story must be the complete narrative text
4. Criteria should be numbered but without story references

Additional context:
- Target audience: ${requestData.audienceType || 'general'}
- Primary user type: ${requestData.userType}
- Design focus: ${requestData.images.length} screen${requestData.images.length > 1 ? 's' : ''} provided
${requestData.images.length > 3 ? '\nNote: Multiple screens provided - ensure stories cover complete user flows' : ''}
${requestData.userType.includes('Admin') ? '\nFocus: For admin stories, emphasize permissions and system configuration' : ''}

Quality assurance:
- Stories must be small, focused, and atomic
- Absolutely no technical implementation details
- Business value must be clearly articulated
- Use consistent terminology matching the designs
- Ensure titles are distinct from user story narratives
- Maintain parallel structure in acceptance criteria
`;

// Example of expected output format:
const exampleOutput = `
---
Title: Transaction Settlement
User Story: As a merchant, I want to submit transactions for settlement, so that I receive my funds.
Acceptance Criteria:
1. The system shall submit all authorized transactions to the payment gateway
2. The interface shall display a confirmation message upon successful submission
3. The system shall update transaction status to "submitted for settlement"
4. The system shall notify the merchant via email within 5 minutes
---

---
Title: Dashboard Analytics
User Story: As a sales manager, I want to view real-time sales metrics, so that I can make data-driven decisions.
Acceptance Criteria:
1. The dashboard shall display current day's sales figures
2. The system shall update metrics at least every 15 minutes
3. Users shall be able to filter data by region and product line
4. The system shall highlight anomalies exceeding 10% variance
---
`;

    // Add conditional prompt enhancements based on input
    if (requestData.images.length > 3) {
      userPrompt += "\nNote: Since multiple screens were provided, ensure stories cover the complete user flow.";
    }

    if (requestData.userType.includes('Admin') || requestData.userType.includes('Manager')) {
      userPrompt += "\nFocus: For admin/manager stories, emphasize permission levels and system configuration.";
    }

    // Prepare the request for Google AI API
    const content = [
      {
        role: "user",
        parts: [
          { text: userPrompt },
          ...requestData.images.map(image => ({
            inline_data: {
              mime_type: image.split(';')[0].split(':')[1] || 'image/jpeg',
              data: image.split(',')[1]
            }
          }))
        ]
      }
    ];

    // Call Google AI API (Gemini 1.5 Flash model)
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GOOGLE_AI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: content,
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google AI API error:", errorText);
      throw new Error(`Google AI API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No content generated by AI");
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log("Generated text length:", generatedText.length);
    console.log("Sample generated text:", generatedText.substring(0, 200) + "...");

    // Parse the AI response into structured user stories
    const userStories = parseAIResponseToStories(generatedText, requestData.storyCount, requestData.criteriaCount);

    // Validate and enhance the generated stories
    const validatedStories = userStories.map(story => {
      // Ensure proper story format
      if (!story.description.startsWith('As a')) {
        story.description = `As a ${requestData.userType}, I want ${story.description}`;
      }
      
      // Clean up titles
      if (!story.title || story.title.length < 10) {
        story.title = story.description
          .replace(/^As a .*? I want to /, '')
          .replace(/ so that .*$/, '')
          .substring(0, 60);
      }
      
      return story;
    });

    // Prepare the response
    const aiResponse: AIResponse = {
      stories: validatedStories,
    };

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error.message);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred during story generation",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function parseAIResponseToStories(text: string, expectedStoryCount: number, expectedCriteriaCount: number): UserStory[] {
  // First check if the response contains the expected structure
  if (!text.includes("User Story:") || !text.includes("Acceptance Criteria:")) {
    console.warn("AI response doesn't follow expected format, attempting to parse anyway");
  }

  // Split the text by story delimiters
  const storyBlocks = text.split(/(?:\n---\n|Story #\d+:)/).filter(block => 
    block.trim().length > 0 && 
    !block.includes("Here are") && 
    !block.includes("SUMMARY")
  );

  const stories: UserStory[] = [];

  // Process each story block
  for (let i = 0; i < Math.min(storyBlocks.length, expectedStoryCount); i++) {
    const block = storyBlocks[i].trim();
    
    // Extract title
    const titleMatch = block.match(/Title:\s*(.*?)(?:\n|$)/i);
    let title = titleMatch ? titleMatch[1].trim() : `User Story ${i + 1}`;
    
    // Extract user story
    const storyMatch = block.match(/User Story:\s*(.*?)(?:\nAcceptance Criteria:|$)/is);
    let description = storyMatch ? storyMatch[1].trim() : block.split('\n')[0].trim();
    
    // Clean up the description
    description = description.replace(/^As an /, 'As a '); // Normalize "an" to "a"
    
    // Extract acceptance criteria
    const criteria: AcceptanceCriterion[] = [];
    const criteriaSectionMatch = block.match(/Acceptance Criteria:\s*([\s\S]*?)(?:\n---|\nStory|$)/i);
    
    if (criteriaSectionMatch) {
      const criteriaText = criteriaSectionMatch[1];
      const criteriaItems = criteriaText.split(/\n\d+\.|\n-/).filter(item => item.trim().length > 0);
      
      for (let j = 0; j < Math.min(criteriaItems.length, expectedCriteriaCount); j++) {
        criteria.push({
          id: uuidv4(),
          description: criteriaItems[j].trim().replace(/^\d+\.\s*/, ''),
        });
      }
    }
    
    // Add default criteria if none were found
    while (criteria.length < expectedCriteriaCount) {
      criteria.push({
        id: uuidv4(),
        description: `The system shall perform expected behavior for criterion ${criteria.length + 1}`,
      });
    }
    
    // Create the user story
    stories.push({
      id: uuidv4(),
      title: title.length > 100 ? title.substring(0, 97) + '...' : title,
      description: description.length > 500 ? description.substring(0, 497) + '...' : description,
      criteria,
    });
  }
  
  // Add default stories if we didn't get enough
  while (stories.length < expectedStoryCount) {
    const index = stories.length + 1;
    stories.push({
      id: uuidv4(),
      title: `User Story ${index}`,
      description: `As a user, I want to perform core functionality ${index}, so that I can achieve my goals.`,
      criteria: Array.from({ length: expectedCriteriaCount }, (_, j) => ({
        id: uuidv4(),
        description: `The system shall properly handle scenario ${j + 1} for story ${index}`,
      })),
    });
  }
  
  return stories;
}
