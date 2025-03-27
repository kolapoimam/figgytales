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
      { id: "1", title: "AI Story Templates", description: "Pre-made templates for common user story scenarios to speed up story creation", upvotes: 0 },
      { id: "2", title: "Batch Export to PDF", description: "Export multiple stories at once to a PDF document", upvotes: 0 },
      { id: "3", title: "Custom Fields", description: "Add custom fields to your stories to track additional information", upvotes: 0 },
      { id: "4", title: "Team Collaboration", description: "Invite team members to collaborate on story creation", upvotes: 0 },
      { id: "5", title: "Integrated Testing", description: "Generate test cases directly from acceptance criteria", upvotes: 0 },
      { id: "6", title: "Design to API Integration", description: "Automatically generate API endpoints from your design screens", upvotes: 0 },
      { id: "7", title: "Collaborative Editing", description: "Work on user stories with your team in real-time", upvotes: 0 },
      { id: "8", title: "Custom Export Templates", description: "Create and use custom templates for exporting your user stories", upvotes: 0 },
      { id: "9", title: "Jira Integration", description: "Export user stories directly to Jira", upvotes: 0 },
      { id: "10", title: "AI Voice Narration", description: "Listen to AI narrate your user stories for better comprehension", upvotes: 0 },
    ];
  });
  const [showRoadmap, setShowRoadmap] = useState(false);
  const { user } = useFiles();

  useEffect(() => {
    // Load features from sessionStorage on mount
    const savedFeatures = sessionStorage.getItem('features');
    if (savedFeatures) {
      setFeatures(JSON.parse(savedFeatures));
    }
  }, []);

  const handleUpvote = (featureId: string) => {
    const updatedFeatures = features.map(feature =>
      feature.id === featureId
        ? { ...feature, upvotes: feature.upvotes + 1 }
        : feature
    ).sort((a, b) => b.upvotes - a.upvotes);

    setFeatures(updatedFeatures);

    // Save to sessionStorage
    sessionStorage.setItem('features', JSON.stringify(updatedFeatures));

    toast.success('Thanks for your vote!');
  };

  const topFeatures = features.slice(0, 6);

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
            >
              View Full Roadmap
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
