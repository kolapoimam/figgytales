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
  // Skip the AI-generated summary card
  const isSummaryCard = 
    index === 0 && (
      story.title.includes('User Story') || 
      story.description.includes('Here are') ||
      story.description.includes('SUMMARY') ||
      story.description.includes('AI ANALYSIS') ||
      story.title.includes('SUMMARY') ||
      story.title.includes('AI ANALYSIS')
    );

  if (isSummaryCard) {
    return null;
  }

  // Clean up the description by removing markdown artifacts and summaries
  const cleanDescription = (text: string) => {
    if (!text) return '';
    // Remove **, *, and excessive newlines
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\n{2,}/g, '\n')
      .replace(/Here are \d+ user stories with \d+/, '') // Remove summary pattern
      .trim();
  };

  // Format the title by removing trailing asterisks and ellipses
  const cleanTitle = (title: string) => {
    if (!title) return `Story ${index + 1}`;
    return title
      .replace(/\*$/, '')
      .replace(/\.{3}$/, '')
      .trim();
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{cleanTitle(story.title)}</CardTitle>
        <CardDescription>Story #{index + 1}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-4">
          {/* User Story Section */}
          {story.description && cleanDescription(story.description) && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                User Story
              </h4>
              <p className="text-sm whitespace-pre-wrap">
                {cleanDescription(story.description)}
              </p>
            </div>
          )}
          
          {/* Acceptance Criteria Section */}
          {story.criteria?.length > 0 && (
            <>
              {story.description && <Separator />}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Acceptance Criteria ({story.criteria.length})
                </h4>
                <ul className="space-y-2">
                  {story.criteria.map((criterion) => (
                    <li 
                      key={criterion.id} 
                      className="text-sm pl-4 border-l-2 border-primary"
                    >
                      {cleanDescription(criterion.description)}
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
