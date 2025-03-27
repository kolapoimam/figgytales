import React from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp } from 'lucide-react';
import { UpcomingFeature } from '@/lib/types';
import { useTheme } from '@/context/ThemeContext';

interface FeatureCardProps {
  feature: UpcomingFeature;
  onUpvote: (featureId: string) => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onUpvote }) => {
  const { theme } = useTheme();

  const cardStyle = {
    background: theme === 'dark'
      ? 'linear-gradient(135deg, rgba(247, 131, 51, 0.7), rgba(200, 100, 30, 0.5))'
      : 'linear-gradient(135deg, rgba(50, 50, 50, 0.7), rgba(20, 20, 20, 0.5))',
    backdropFilter: 'blur(10px)', // Adds a glassmorphism effect
    border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border for the mirror effect
  };

  const textStyle = {
    color: theme === 'dark' ? '#000000' : '#ffffff',
  };

  const votesStyle = {
    color: theme === 'dark' ? '#000000' : '#ffffff',
  };

  const buttonStyle = theme === 'light' ? {
    backgroundColor: '#ffffff',
    color: '#000000',
    borderColor: '#000000',
  } : {};

  const iconStyle = theme === 'light' ? {
    color: '#000000',
  } : {};

  return (
    <Card className="h-full flex flex-col card-hover" style={cardStyle}>
      <CardHeader>
        <CardTitle style={textStyle}>{feature.title}</CardTitle>
        <CardDescription style={votesStyle}>
          {feature.upvotes} {feature.upvotes === 1 ? 'vote' : 'votes'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm" style={textStyle}>{feature.description}</p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onUpvote(feature.id)}
          variant="outline"
          className="w-full"
          style={buttonStyle}
          disabled={feature.hasUpvoted}
        >
          <ThumbsUp size={16} className="mr-2" style={iconStyle} />
          {feature.hasUpvoted ? 'Upvoted' : 'Upvote'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeatureCard;
