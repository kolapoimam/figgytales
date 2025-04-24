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
  // First normalize the text by removing excessive whitespace and markdown artifacts
  const normalizedText = text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // More robust splitting that handles different delimiters
  const storyBlocks = normalizedText.split(/(?:\n---\n|====|\n\*\*\*\n)/)
    .map(block => block.trim())
    .filter(block => block.length > 0 && !block.includes('Example Output'));

  const stories: UserStory[] = [];

  for (const block of storyBlocks.slice(0, expectedStoryCount)) {
    try {
      // Extract title - more flexible matching
      const titleMatch = block.match(/(?:Title|Feature):\s*(.*?)(?:\n|$)/i);
      let title = titleMatch ? titleMatch[1].trim() : '';
      
      // If no formal title, try to extract from first line
      if (!title && block.includes('User Story:')) {
        const firstLine = block.split('\n')[0].trim();
        title = firstLine.replace(/^Title:\s*/i, '');
      }

      // Extract user story - more resilient parsing
      const storyMatch = block.match(/User Story:\s*([\s\S]*?)(?:\nAcceptance Criteria:|$)/i);
      let description = storyMatch ? storyMatch[1].trim() : '';
      
      // Fallback: if no "User Story:" label, look for "As a..." pattern
      if (!description) {
        const asAMatch = block.match(/As a .*?, I want .*?, so that .*?(?:\n|$)/i);
        if (asAMatch) description = asAMatch[0].trim();
      }

      // Extract criteria with better handling of different formats
      const criteria: AcceptanceCriterion[] = [];
      const criteriaSectionMatch = block.match(/Acceptance Criteria:\s*([\s\S]*?)(?:\n---|\n====|\n\*\*\*|$)/i);
      
      if (criteriaSectionMatch) {
        const criteriaText = criteriaSectionMatch[1];
        // Handle both numbered and bulleted lists
        const criteriaItems = criteriaText.split(/\n\d+\.|\n-|\n\*/)
          .map(item => item.trim())
          .filter(item => item.length > 0);
        
        criteriaItems.slice(0, expectedCriteriaCount).forEach((item, index) => {
          criteria.push({
            id: uuidv4(),
            description: item.replace(/^\d+\.\s*|^[-*]\s*/, '').trim(),
          });
        });
      }

      // Only add if we have valid content
      if (description || criteria.length > 0) {
        stories.push({
          id: uuidv4(),
          title: title || `Feature ${stories.length + 1}`,
          description: description || `User story ${stories.length + 1}`,
          criteria: criteria.length > 0 ? criteria : Array.from(
            { length: expectedCriteriaCount }, 
            (_, i) => ({
              id: uuidv4(),
              description: `The system shall perform required behavior ${i + 1}`
            })
          )
        });
      }
    } catch (error) {
      console.warn(`Error parsing story block: ${error}`);
      continue;
    }
  }

  // Fill in any missing stories with placeholders
  while (stories.length < expectedStoryCount) {
    stories.push({
      id: uuidv4(),
      title: `Feature ${stories.length + 1}`,
      description: `As a ${requestData?.userType || 'user'}, I want to perform core functionality ${stories.length + 1}`,
      criteria: Array.from({ length: expectedCriteriaCount }, (_, i) => ({
        id: uuidv4(),
        description: `The system shall properly handle requirement ${i + 1}`
      }))
    });
  }

  return stories.slice(0, expectedStoryCount);
}
