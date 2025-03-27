
import React from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp } from 'lucide-react';
import { UpcomingFeature } from '@/lib/types';

interface FeatureCardProps {
  feature: UpcomingFeature;
  onUpvote: (featureId: string) => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onUpvote }) => {
  return (
    <Card className="h-full flex flex-col card-hover">
      <CardHeader>
        <CardTitle>{feature.title}</CardTitle>
        <CardDescription>
          {feature.upvotes} {feature.upvotes === 1 ? 'vote' : 'votes'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm">{feature.description}</p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onUpvote(feature.id)}
          variant={feature.hasUpvoted ? "secondary" : "outline"}
          className="w-full"
          disabled={feature.hasUpvoted}
        >
          <ThumbsUp size={16} className={`mr-2 ${feature.hasUpvoted ? 'text-primary' : ''}`} />
          {feature.hasUpvoted ? 'Upvoted' : 'Upvote'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeatureCard;
