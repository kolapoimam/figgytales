import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/Button';
import { ThumbsUp } from 'lucide-react';
import { UpcomingFeature } from '@/lib/types';

// Adjust this based on your actual theme implementation
const useTheme = () => {
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  return { theme };
};

interface RoadmapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  features: UpcomingFeature[];
  onUpvote: (featureId: string) => void;
}

const RoadmapDialog: React.FC<RoadmapDialogProps> = ({ 
  open, 
  onOpenChange, 
  features, 
  onUpvote 
}) => {
  const { theme } = useTheme();
  const sortedFeatures = [...features].sort((a, b) => b.upvotes - a.upvotes);

  const cardStyle = {
    backgroundColor: theme === 'dark' ? '#f78333' : '#000000',
  };

  const textStyle = {
    color: '#ffffff',
  };

  const votesStyle = {
    color: '#ffffff',
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>FiggyTales Roadmap</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {sortedFeatures.map((feature) => (
            <div key={feature.id} className="flex gap-4 p-4 border border-border rounded-lg" style={cardStyle}>
              <div className="flex-1">
                <h3 className="font-medium text-lg" style={textStyle}>{feature.title}</h3>
                <p className="text-muted-foreground mt-1" style={textStyle}>{feature.description}</p>
              </div>
              <div className="flex flex-col items-center">
                <Button 
                  onClick={() => onUpvote(feature.id)}
                  variant="outline"
                  size="sm"
                  style={buttonStyle}
                  disabled={feature.hasUpvoted}
                >
                  <ThumbsUp size={16} style={iconStyle} />
                </Button>
                <span className="text-sm font-medium mt-1" style={votesStyle}>{feature.upvotes}</span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoadmapDialog;
