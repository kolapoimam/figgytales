import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { toast } from 'sonner';
import { useFiles } from '@/context/FileContext';
import { UpcomingFeature } from '@/lib/types';
import FeatureCard from './FeatureCard';
import RoadmapDialog from './RoadmapDialog';

const RoadmapSection: React.FC = () => {
  const [features, setFeatures] = useState<UpcomingFeature[]>(() => {
    const savedFeatures = sessionStorage.getItem('features');
    if (savedFeatures) {
      return JSON.parse(savedFeatures);
    }
    return [
      { id: "1", title: "AI Story Templates", description: "Pre-made templates for common user story scenarios to speed up story creation", upvotes: 0, hasUpvoted: false },
      { id: "2", title: "Batch Export to PDF", description: "Export multiple stories at once to a PDF document", upvotes: 0, hasUpvoted: false },
      { id: "3", title: "Custom Fields", description: "Add custom fields to your stories to track additional information", upvotes: 0, hasUpvoted: false },
      { id: "4", title: "Team Collaboration", description: "Invite team members to collaborate on story creation", upvotes: 0, hasUpvoted: false },
      { id: "5", title: "Integrated Testing", description: "Generate test cases directly from acceptance criteria", upvotes: 0, hasUpvoted: false },
      { id: "6", title: "Design to API Integration", description: "Automatically generate API endpoints from your design screens", upvotes: 0, hasUpvoted: false },
      { id: "7", title: "Collaborative Editing", description: "Work on user stories with your team in real-time", upvotes: 0, hasUpvoted: false },
      { id: "8", title: "Custom Export Templates", description: "Create and use custom templates for exporting your user stories", upvotes: 0, hasUpvoted: false },
      { id: "9", title: "Jira Integration", description: "Export user stories directly to Jira", upvotes: 0, hasUpvoted: false },
      { id: "10", title: "AI Voice Narration", description: "Listen to AI narrate your user stories for better comprehension", upvotes: 0, hasUpvoted: false },
    ];
  });
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(() => {
    return sessionStorage.getItem('hasUpvoted') === 'true';
  });
  const { user } = useFiles();

  useEffect(() => {
    // Check sessionStorage for upvote status on mount
    const savedFeatures = sessionStorage.getItem('features');
    if (savedFeatures) {
      const parsedFeatures = JSON.parse(savedFeatures);
      setFeatures(parsedFeatures);
      const userHasUpvoted = parsedFeatures.some((feature: UpcomingFeature) => feature.hasUpvoted);
      setHasUpvoted(userHasUpvoted);
    }
  }, []);

  const handleUpvote = (featureId: string) => {
    const updatedFeatures = features.map(feature =>
      feature.id === featureId
        ? { ...feature, upvotes: feature.upvotes + 1, hasUpvoted: true }
        : feature
    ).sort((a, b) => b.upvotes - a.upvotes);

    setFeatures(updatedFeatures);
    setHasUpvoted(true);

    // Save to sessionStorage
    sessionStorage.setItem('features', JSON.stringify(updatedFeatures));
    sessionStorage.setItem('hasUpvoted', 'true');

    toast.success('Thanks for your vote!');
  };

  return (
    <div className="mt-16 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Vote for features you'd like to see next in FiggyTales
        </p>
      </div>

      {features.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {features.map((feature) => (
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
