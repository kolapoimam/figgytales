import React, { useState } from 'react';
import { Button } from '@/components/Button';
import { toast } from 'sonner';
import { useFiles } from '@/context/FileContext';
import { UpcomingFeature } from '@/lib/types';
import FeatureCard from './FeatureCard';
import RoadmapDialog from './RoadmapDialog';

const RoadmapSection: React.FC = () => {
  const [features, setFeatures] = useState<UpcomingFeature[]>([
    { id: "1", title: "AI Story Templates", description: "Pre-made templates for common user story scenarios to speed up story creation", upvotes: 0, hasUpvoted: false },
    { id: "2", title: "Batch Export to PDF", description: "Export multiple stories at once to a PDF document", upvotes: 0, hasUpvoted: false },
    { id: "3", title: "Custom Fields", description: "Add custom fields to your stories to track additional information", upvotes: 0, hasUpvoted: false },
    { id: "4", title: "Team Collaboration", description: "Invite team members to collaborate on story creation", upvotes: 0, hasUpvoted: false },
    { id: "5", title: "Integrated Testing", description: "Generate test cases directly from acceptance criteria", upvotes: 0, hasUpvoted: false },
  ]);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const { user } = useFiles();

  const handleUpvote = (featureId: string) => {
    setFeatures(prev =>
      prev.map(feature =>
        feature.id === featureId
          ? { ...feature, upvotes: feature.upvotes + 1, hasUpvoted: true }
          : feature
      ).sort((a, b) => b.upvotes - a.upvotes)
    );
    setHasUpvoted(true);
    toast.success('Thanks for your vote!');
  };

  const topFeatures = features.slice(0, 3);

  return (
    <div className="mt-16 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Vote for features you'd like to see next in FiggyTales
        </p>
      </div>

      {topFeatures.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {topFeatures.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                onUpvote={handleUpvote}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowRoadmap(true)}
              className="group"
              disabled={!hasUpvoted}
            >
              View Full Roadmap
              {!hasUpvoted && (
                <span className="ml-2 text-xs text-muted-foreground">(Available after upvoting)</span>
              )}
            </Button>
          </div>

          <RoadmapDialog
            open={showRoadmap}
            onOpenChange={setShowRoadmap}
            features={features}
            onUpvote={handleUpvote}
          />
        </>
      ) : (
        <p className="text-center text-muted-foreground">
          No upcoming features available at the moment. Check back later!
        </p>
      )}
    </div>
  );
};

export default RoadmapSection;
