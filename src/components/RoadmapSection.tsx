
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ThumbsUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFiles } from '@/context/FileContext';
import { UpcomingFeature } from '@/lib/types';

// Define the type for the data returned from our RPC function
type FeatureWithCounts = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  upvote_count: number;
  has_upvoted: boolean;
}

const RoadmapSection: React.FC = () => {
  const [features, setFeatures] = useState<UpcomingFeature[]>([]);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const { user } = useFiles();

  const fetchFeatures = async () => {
    setIsLoading(true);
    try {
      // Using stored procedure to get features with counts
      const { data: featuresData, error: featuresError } = await supabase
        .rpc('get_features_with_counts');

      if (featuresError) {
        console.error('Error fetching features:', featuresError);
        setFeatures([]);
        setIsLoading(false);
        return;
      }
      
      if (!featuresData || featuresData.length === 0) {
        setFeatures([]);
        setIsLoading(false);
        return;
      }
      
      // Process the data
      const processedFeatures = featuresData.map((feature: FeatureWithCounts) => {
        return {
          id: feature.id,
          title: feature.title,
          description: feature.description,
          upvotes: Number(feature.upvote_count) || 0,
          hasUpvoted: feature.has_upvoted || false,
          created_at: feature.created_at
        } as UpcomingFeature;
      });
      
      // Check if user has upvoted any feature
      const userHasUpvoted = processedFeatures.some(feature => feature.hasUpvoted);
      setHasUpvoted(userHasUpvoted);
      
      // Sort by upvote count (descending)
      const sortedFeatures = processedFeatures.sort((a, b) => b.upvotes - a.upvotes);
      setFeatures(sortedFeatures);
    } catch (error) {
      console.error('Error fetching features:', error);
      toast.error('Failed to load roadmap items');
      setFeatures([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [user]);

  const handleUpvote = async (featureId: string) => {
    try {
      // Generate a clientId if user is not logged in
      const userId = user?.id;
      const clientId = !userId ? localStorage.getItem('clientId') || crypto.randomUUID() : null;
      
      if (!userId && clientId && !localStorage.getItem('clientId')) {
        localStorage.setItem('clientId', clientId);
      }
      
      // Using stored procedure to handle upvote
      const { error } = await supabase.rpc('upvote_feature', { 
        p_feature_id: featureId,
        p_user_id: userId || null,
        p_ip_address: !userId ? clientId : null
      });
      
      if (error) {
        if (error.message.includes('unique constraint')) {
          toast.info('You already upvoted this feature');
        } else {
          console.error('Error upvoting:', error);
          toast.error('Failed to upvote');
        }
        return;
      }
      
      // Update local state
      setFeatures(prev => 
        prev.map(feature => 
          feature.id === featureId 
            ? { ...feature, upvotes: feature.upvotes + 1, hasUpvoted: true } 
            : feature
        )
      );
      
      // Update the hasUpvoted state
      setHasUpvoted(true);
      
      toast.success('Thanks for your vote!');
    } catch (error) {
      console.error('Error upvoting feature:', error);
      toast.error('Failed to upvote');
    }
  };

  // Always show the top 3 features
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
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {topFeatures.map((feature) => (
              <Card key={feature.id} className="h-full flex flex-col card-hover">
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>
                    {feature.upvotes} {feature.upvotes === 1 ? 'vote' : 'votes'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm">{feature.description}</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleUpvote(feature.id)}
                    variant={feature.hasUpvoted ? "secondary" : "outline"}
                    className="w-full"
                    disabled={feature.hasUpvoted}
                  >
                    <ThumbsUp size={16} className={`mr-2 ${feature.hasUpvoted ? 'text-primary' : ''}`} />
                    {feature.hasUpvoted ? 'Upvoted' : 'Upvote'}
                  </Button>
                </CardFooter>
              </Card>
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
          
          <Dialog open={showRoadmap} onOpenChange={setShowRoadmap}>
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
                        onClick={() => handleUpvote(feature.id)}
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
        </>
      )}
    </div>
  );
};

export default RoadmapSection;
