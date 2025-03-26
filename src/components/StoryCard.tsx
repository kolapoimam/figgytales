import React, { useState, useEffect } from 'react';
import { UserStory } from '@/lib/types';
import { Check, ClipboardCopy } from 'lucide-react';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';

interface StoryCardProps {
  story: UserStory;
  index: number;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, index }) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Trigger visibility after component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const copyToClipboard = () => {
    const textToCopy = `${story.title}\n${story.description}\n\nAcceptance Criteria:\n${
      story.criteria.map((c, i) => `${i + 1}. ${c.description}`).join('\n')
    }`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };
  
  return (
    <div 
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm transition-all",
        "hover:shadow-md hover:border-primary/20",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{
        transitionDelay: `${index * 50}ms`,
        transitionDuration: '300ms',
        transitionProperty: 'opacity, transform',
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-block text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full mb-2">
            {story.title}
          </span>
          <h3 className="text-xl font-medium text-card-foreground">User Story</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={copyToClipboard}
          className="text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check size={16} /> : <ClipboardCopy size={16} />}
          <span className="ml-1 text-xs">{copied ? 'Copied' : 'Copy'}</span>
        </Button>
      </div>
      
      <p className="text-card-foreground mb-6">
        {story.description}
      </p>
      
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          Acceptance Criteria
        </h4>
        <ul className="space-y-3">
          {story.criteria.map((criterion, i) => (
            <li 
              key={`${criterion.id}-${i}`}
              className="flex items-start rounded-md p-3 bg-secondary/50 text-sm"
            >
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                {i + 1}
              </span>
              <span>{criterion.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StoryCard;
