import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { toast } from 'sonner';
import { UpcomingFeature } from '@/lib/types';
import FeatureCard from './FeatureCard';
import RoadmapDialog from './RoadmapDialog';
import { fetchUpcomingFeatures, upvoteFeature } from '@/services/roadmapService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const RoadmapSection: React.FC = () => {
  const [showRoadmap, setShowRoadmap] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Fetch features from Supabase
  const { data: features = [], isLoading, error } = useQuery({
    queryKey: ['features'],
    queryFn: fetchUpcomingFeatures,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create mutation for upvoting
  const upvoteMutation = useMutation({
    mutationFn: (featureId: string) => upvoteFeature(featureId),
    onSuccess: () => {
      toast.success('Thanks for your vote!');
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
    onError: () => {
      toast.error('Failed to save your vote. Please try again.');
    }
  });

  const handleUpvote = (featureId: string) => {
    upvoteMutation.mutate(featureId);
  };

  if (isLoading) {
    return (
      <div className="mt-16 animate-slide-up text-center">
        <p>Loading roadmap features...</p>
      </div>
    );
  }

  if (error) {
    console.error('Error loading features:', error);
    return (
      <div className="mt-16 animate-slide-up text-center">
        <p className="text-muted-foreground">
          Unable to load upcoming features. Please try again later.
        </p>
      </div>
    );
  }

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