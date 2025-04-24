import { supabase } from '@/integrations/supabase/client';
import { UpcomingFeature } from '@/lib/types';

/**
 * Generates a client ID for anonymous users to track upvotes
 * Uses stored client ID from localStorage or creates a new one
 */
const getClientId = (): string => {
  const storageKey = 'figgytales_client_id';
  let clientId = localStorage.getItem(storageKey);

  if (!clientId) {
    // Generate a UUID v4
    clientId = crypto.randomUUID();
    localStorage.setItem(storageKey, clientId);
  }

  return clientId;
};

/**
 * Fetches the list of upcoming features with upvote counts
 * If user is logged in, it will also mark features that the user has already upvoted
 */
export const fetchUpcomingFeatures = async (): Promise<UpcomingFeature[]> => {
  try {
    const clientId = getClientId();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;

    // Set the auth token for the client ID
    supabase.realtime.setAuth(clientId);

    // Fetch features with upvote counts using RPC
    const { data: featuresData, error: featuresError } = await supabase.rpc(
      'get_features_with_counts'
    );

    if (featuresError) {
      console.error('Error fetching features:', featuresError);
      throw new Error('Failed to fetch upcoming features');
    }

    if (!featuresData) {
      return [];
    }

    // If user is logged in, check which features they've already upvoted
    if (userId) {
      const { data: upvotedData, error: upvotedError } = await supabase
        .from('feature_upvotes')
        .select('feature_id')
        .eq('user_id', userId);

      if (upvotedError) {
        console.error('Error fetching upvoted features:', upvotedError);
      }

      // Map features and mark ones the user has upvoted
      return featuresData.map((feature: any) => ({
        id: feature.id,
        title: feature.title,
        description: feature.description,
        status: feature.status,
        upvotes: feature.upvote_count || 0,
        hasUpvoted: upvotedData
          ? upvotedData.some((u: any) => u.feature_id === feature.id)
          : false,
      }));
    } else {
      // For anonymous users, check upvotes based on client ID in localStorage
      const { data: upvotedData, error: upvotedError } = await supabase
        .from('feature_upvotes')
        .select('feature_id')
        .eq('client_id', clientId)
        .is('user_id', null);

      if (upvotedError) {
        console.error('Error fetching upvoted features:', upvotedError);
      }

      // Map features and mark ones the client has upvoted
      return featuresData.map((feature: any) => ({
        id: feature.id,
        title: feature.title,
        description: feature.description,
        status: feature.status,
        upvotes: feature.upvote_count || 0,
        hasUpvoted: upvotedData
          ? upvotedData.some((u: any) => u.feature_id === feature.id)
          : false,
      }));
    }
  } catch (error) {
    console.error('Error in fetchUpcomingFeatures:', error);
    return [];
  }
};

/**
 * Upvotes a feature
 * Handles both authenticated users and anonymous users with client ID
 */
export const upvoteFeature = async (featureId: string): Promise<boolean> => {
  try {
    const clientId = getClientId();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;

    // Set the header in a custom way through auth
    supabase.realtime.setAuth(clientId);

    // Using stored procedure to handle upvote with removed ip_address parameter
    const { error } = await supabase.rpc('upvote_feature', {
      p_feature_id: featureId,
      p_user_id: userId || null,
      p_client_id: !userId ? clientId : null,
    });

    if (error) {
      console.error('Error upvoting:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in upvoteFeature:', error);
    return false;
  }
};
