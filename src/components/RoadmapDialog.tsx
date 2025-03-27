
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/Button';
import { ThumbsUp } from 'lucide-react';
import { UpcomingFeature } from '@/lib/types';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>FiggyTales Roadmap</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {features.map((feature) => (
            <div key={feature.id} className="flex gap-4 p-4 border border-border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-lg">{feature.title}</h3>
                <p className="text-muted-foreground mt-1">{feature.description}</p>
              </div>
              <div className="flex flex-col items-center">
                <Button 
                  onClick={() => onUpvote(feature.id)}
                  variant={feature.hasUpvoted ? "secondary" : "outline"}
                  size="sm"
                  disabled={feature.hasUpvoted}
                >
                  <ThumbsUp size={16} className={feature.hasUpvoted ? 'text-primary' : ''} />
                </Button>
                <span className="text-sm font-medium mt-1">{feature.upvotes}</span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoadmapDialog;
