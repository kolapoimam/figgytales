
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ThumbsUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFiles } from '@/context/FileContext';
import { UpcomingFeature } from '@/lib/types';

// Utility function for safer data access
const safeFetch = async (tableName: string, query: any) => {
  try {
    const result = await query;
    return { data: result.data, error: result.error };
  } catch (error) {
    console.error(`Error fetching from ${tableName}:`, error);
    return { data: null, error };
  }
};

const RoadmapSection: React.FC = () => {
  const [features, setFeatures] = useState<UpcomingFeature[]>([]);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useFiles();

  const fetchFeatures = async () => {
    setIsLoading(true);
    try {
      // Try to fetch features directly with a custom query
      const { data: featuresData, error: featuresError } = await safeFetch(
        'upcoming_features',
        supabase.from('upcoming_features').select('*')
      );
      
      if (featuresError) {
        console.log('Error or table not found:', featuresError);
        setFeatures([]);
        setIsLoading(false);
        return;
      }
      
      if (!featuresData || featuresData.length === 0) {
        setFeatures([]);
        setIsLoading(false);
        return;
      }
      
      // For each feature, get upvote count
      const featuresWithCounts = await Promise.all(
        featuresData.map(async (feature: any) => {
          // Get total upvote count
          const { data: upvotesData, error: upvotesError } = await safeFetch(
            'feature_upvotes',
            supabase.from('feature_upvotes')
              .select('id')
              .eq('feature_id', feature.id)
          );
          
          const upvotes = upvotesData ? upvotesData.length : 0;
          
          // Check if current user has upvoted
          let hasUpvoted = false;
          if (user) {
            const { data: userUpvoteData } = await safeFetch(
              'feature_upvotes',
              supabase.from('feature_upvotes')
                .select('id')
                .eq('feature_id', feature.id)
                .eq('user_id', user.id)
                .maybeSingle()
            );
            
            hasUpvoted = !!userUpvoteData;
          } else {
            // Check for client ID-based upvotes for anonymous users
            const clientId = localStorage.getItem('clientId');
            if (clientId) {
              const { data: clientUpvoteData } = await safeFetch(
                'feature_upvotes',
                supabase.from('feature_upvotes')
                  .select('id')
                  .eq('feature_id', feature.id)
                  .eq('ip_address', clientId)
                  .maybeSingle()
              );
              
              hasUpvoted = !!clientUpvoteData;
            }
          }
          
          return {
            ...feature,
            upvotes,
            hasUpvoted
          } as UpcomingFeature;
        })
      );
      
      // Sort by upvote count (descending)
      const sortedFeatures = featuresWithCounts.sort((a, b) => b.upvotes - a.upvotes);
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
      
      // Check if already upvoted
      const { data: existingVote } = await safeFetch(
        'feature_upvotes',
        supabase.from('feature_upvotes')
          .select('id')
          .eq('feature_id', featureId)
          .eq(userId ? 'user_id' : 'ip_address', userId || clientId)
          .maybeSingle()
      );
      
      if (existingVote) {
        // Already upvoted
        toast.info('You already upvoted this feature');
        return;
      }
      
      // Add upvote
      const { error: upvoteError } = await safeFetch(
        'feature_upvotes',
        supabase.from('feature_upvotes')
          .insert({
            feature_id: featureId,
            user_id: userId || null,
            ip_address: !userId ? clientId : null
          })
      );
      
      if (upvoteError) {
        console.error('Error upvoting:', upvoteError);
        toast.error('Failed to upvote');
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
      
      toast.success('Thanks for your vote!');
    } catch (error) {
      console.error('Error upvoting feature:', error);
      toast.error('Failed to upvote');
    }
  };

  const topFeatures = features.slice(0, 3); // Only show top 3 in the home page

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
            >
              View Full Roadmap
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
