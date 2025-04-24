import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserStory } from '@/lib/types';

interface StoryCardProps {
  story: UserStory;
  index: number;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, index }) => {
  // Skip AI-generated summary if present
  if (index === 0 && (
    story.title.includes('SUMMARY') || 
    story.title.includes('AI ANALYSIS') ||
    story.description.includes('SUMMARY') ||
    story.description.includes('AI ANALYSIS')
  )) {
    return null;
  }

  // Extract a clean title from the story data
  const getStoryTitle = () => {
    if (story.title) {
      // Clean up title if it starts with "As a"
      if (story.title.startsWith('As a')) {
        const endOfPhrase = story.title.indexOf(', so that');
        if (endOfPhrase > 0) {
          return story.title.substring(0, endOfPhrase).trim();
        }
      }
      return story.title;
    }
    
    // Fallback to first part of description if no title
    if (story.description) {
      const firstSentenceEnd = Math.min(
        story.description.indexOf('.'),
        story.description.indexOf('\n')
      );
      return firstSentenceEnd > 0 
        ? story.description.substring(0, firstSentenceEnd).trim()
        : story.description;
    }
    
    return `Story ${index + 1}`;
  };

  // Get the main story content
  const getStoryContent = () => {
    if (story.description) return story.description;
    if (story.title && !story.title.startsWith('As a')) return story.title;
    return 'No story content available';
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{getStoryTitle()}</CardTitle>
        <CardDescription>Story #{index + 1}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              User Story
            </h4>
            <p className="text-sm whitespace-pre-wrap">
              {getStoryContent()}
            </p>
          </div>
          
          {story.criteria?.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Acceptance Criteria ({story.criteria.length})
                </h4>
                <ul className="space-y-2">
                  {story.criteria.map((criterion, i) => (
                    <li 
                      key={criterion.id || i} 
                      className="text-sm pl-4 border-l-2 border-primary"
                    >
                      {criterion.description}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 text-xs text-muted-foreground">
        Automatically generated from your design mockups
      </CardFooter>
    </Card>
  );
};

export default StoryCard;
