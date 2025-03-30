
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserStory } from '@/lib/types';

interface StoryCardProps {
  story: UserStory;
  index: number;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, index }) => {
  // Skip the first story if it's the AI-generated summary
  if (index === 0 && story.userStory.includes('SUMMARY') || story.userStory.includes('AI ANALYSIS')) {
    return null;
  }

  // Extract a title from the user story (first line or up to first comma)
  const getStoryTitle = () => {
    const storyText = story.userStory;
    // If story starts with "As a", create a title from that
    if (storyText.startsWith('As a')) {
      const endOfPhrase = storyText.indexOf(', so that');
      if (endOfPhrase > 0) {
        return storyText.substring(0, endOfPhrase).trim();
      }
    }
    // Default title extraction
    const firstComma = storyText.indexOf(',');
    const firstPeriod = storyText.indexOf('.');
    const firstNewline = storyText.indexOf('\n');
    
    let end = storyText.length;
    if (firstComma > 0) end = Math.min(end, firstComma);
    if (firstPeriod > 0) end = Math.min(end, firstPeriod);
    if (firstNewline > 0) end = Math.min(end, firstNewline);
    
    return storyText.substring(0, end).trim();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{getStoryTitle()}</CardTitle>
        <CardDescription>Story #{index}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">User Story</h4>
            <p className="text-sm">{story.userStory}</p>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Acceptance Criteria</h4>
            <ul className="list-disc pl-5 space-y-1">
              {story.acceptanceCriteria.map((criteria, i) => (
                <li key={i} className="text-sm">{criteria}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 text-xs text-muted-foreground">
        Automatically generated from your design mockups
      </CardFooter>
    </Card>
  );
};

export default StoryCard;
