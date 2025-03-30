
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
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    transform: 'scale(1)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const hoverStyle = {
    transform: 'scale(1.03)',
    boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)'
  };

  const textStyle = {
    color: theme === 'dark' ? '#000000' : '#ffffff',
  };

  const votesStyle = {
    color: theme === 'dark' ? '#000000' : '#ffffff',
    fontWeight: 'bold'
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
    <Card 
      className="h-full flex flex-col card-hover"
      style={cardStyle}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, hoverStyle);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      }}
    >
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
          className="w-full transition-all duration-300 hover:bg-opacity-80"
          style={buttonStyle}
          disabled={feature.hasUpvoted}
        >
          <ThumbsUp size={16} className={`mr-2 ${feature.hasUpvoted ? 'text-green-500' : ''}`} style={iconStyle} />
          {feature.hasUpvoted ? 'Upvoted' : 'Upvote'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeatureCard;
