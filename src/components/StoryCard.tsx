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
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  // Clean up the title by removing any numbering or markdown
  const cleanTitle = (title: string) => {
    if (!title) return 'Feature';
    return title
      .replace(/^Story #\d+\s*[:-]?\s*/i, '') // Remove story numbering
      .replace(/^[*-]\s*/, '') // Remove markdown bullets
      .replace(/\.{3}$/, '') // Remove trailing ellipses
      .trim();
  };

  // Clean up the description text
  const cleanDescription = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove italics markdown
      .replace(/\n{2,}/g, '\n') // Normalize newlines
      .trim();
  };

  // Clean up criteria descriptions
  const cleanCriterion = (text: string) => {
    return cleanDescription(text)
      .replace(/^The system shall\s*/i, '') // Normalize criteria start
      .replace(/^[0-9]+\.\s*/, ''); // Remove numbering if present
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">
          {cleanTitle(story.title)}
        </CardTitle>
        {/* Removed the Story # label completely */}
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-4">
          {/* User Story Section */}
          {story.description && (
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
              <Separator />
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Acceptance Criteria
                </h4>
                <ul className="space-y-2">
                  {story.criteria.map((criterion) => (
                    <li 
                      key={criterion.id} 
                      className="text-sm pl-4 border-l-2 border-primary"
                    >
                      {cleanCriterion(criterion.description)}
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
