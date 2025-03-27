import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { toast } from 'sonner';
import { useFiles } from '@/context/FileContext';
import { UpcomingFeature } from '@/lib/types';
import FeatureCard from './FeatureCard';
import RoadmapDialog from './RoadmapDialog';
import { fetchFeatures, upvoteFeature } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';

const RoadmapSection: React.FC = () => {
  const [features, setFeatures] = useState<UpcomingFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [upvoting, setUpvoting] = useState<string | null>(null);
  const { user } = useFiles();

  // Fetch features and set up real-time subscription
  useEffect(() => {
    const loadFeatures = async () => {
      setLoading(true);
      try {
        const fetchedFeatures = await fetchFeatures();
        setFeatures(fetchedFeatures);
      } catch (error) {
        console.error('Error loading features:', error);
        toast.error('Failed to load features');
      } finally {
        setLoading(false);
      }
    };

    loadFeatures();

    // Subscribe to changes in feature_upvotes for real-time updates
    const subscription = supabase
      .channel('feature_upvotes_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feature_upvotes' },
        () => {
          loadFeatures();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleUpvote = async (featureId: string) => {
    setUpvoting(featureId);
    try {
      const success = await upvoteFeature(featureId);
      if (!success) {
        toast.error('Failed to upvote');
        return;
      }

      // Features will be updated via the real-time subscription,
      // but we can optimistically update the hasUpvoted state
      setFeatures((prevFeatures) =>
        prevFeatures.map((feature) =>
          feature.id === featureId ? { ...feature, hasUpvoted: true } : feature
        )
      );
      toast.success('Thanks for your vote!');
    } catch (error) {
      console.error('Error upvoting:', error);
      toast.error('Failed to upvote');
    } finally {
      setUpvoting(null);
    }
  };

  const topFeatures = features.slice(0, 6);

  if (loading) {
    return <p className="text-center text-muted-foreground">Loading features...</p>;
  }

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
                upvoting={upvoting}
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
            upvoting={upvoting}
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
