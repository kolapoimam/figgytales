import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { toast } from 'sonner';
import { useFiles } from '@/context/FileContext';
import { UpcomingFeature } from '@/lib/types';
import FeatureCard from './FeatureCard';
import RoadmapDialog from './RoadmapDialog';
import { fetchFeatures, upvoteFeature } from '@/services/roadmapService';

const RoadmapSection: React.FC = () => {
  const [features, setFeatures] = useState<UpcomingFeature[]>([]);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const { user } = useFiles();

  useEffect(() => {
    loadFeatures();
  }, [user]);

  const loadFeatures = async () => {
    setIsLoading(true);
    try {
      const fetchedFeatures = await fetchFeatures();
      console.log("Fetched features:", fetchedFeatures); // Debug log
      setFeatures(fetchedFeatures);
      const userHasUpvoted = fetchedFeatures.some(feature => feature.hasUpvoted);
      setHasUpvoted(userHasUpvoted);
    } catch (error) {
      console.error('Error loading features:', error);
      toast.error('Failed to load roadmap items');
      // Fallback to mock data if fetch fails
      setFeatures([
        { id: "1", title: "Dark Mode", description: "Toggle between light and dark themes.", upvotes: 5, hasUpvoted: false },
        { id: "2", title: "Story Sharing", description: "Share stories directly from the app.", upvotes: 3, hasUpvoted: false },
        { id: "3", title: "Custom Avatars", description: "Create and customize your avatar.", upvotes: 2, hasUpvoted: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvote = async (featureId: string) => {
    try {
      const success = await upvoteFeature(featureId);
      if (!success) {
        return;
      }
      setFeatures(prev => 
        prev.map(feature => 
          feature.id === featureId 
            ? { ...feature, upvotes: feature.upvotes + 1, hasUpvoted: true } 
            : feature
        ).sort((a, b) => b.upvotes - a.upvotes)
      );
      setHasUpvoted(true);
      toast.success('Thanks for your vote!');
    } catch (error) {
      console.error('Error upvoting feature:', error);
      toast.error('Failed to upvote');
    }
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
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : topFeatures.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {topFeatures.map((feature) => (
              <FeatureCard 
                key={feature.id} 
                feature={feature} 
                onUpvote={handleUpvote} 
              />
            ))}
         
