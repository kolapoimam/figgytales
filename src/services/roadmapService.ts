import { supabase } from '@/integrations/supabase/client';
import { UpcomingFeature } from '@/lib/types';

// Seed data for features
const defaultFeatures: Omit<UpcomingFeature, 'id' | 'upvotes' | 'hasUpvoted'>[] = [
  {
    title: 'Export to Jira',
    description: 'Export your generated user stories directly to Jira as tickets',
  },
  {
    title: 'AI Story Refinement',
    description: 'Get AI suggestions to improve your user stories based on best practices',
  },
  {
    title: 'Team Collaboration',
    description: 'Invite team members to collaborate on story generation and refinement',
  },
  {
    title: 'Custom Templates',
    description: 'Create and save custom templates for different types of projects',
  },
  {
    title: 'Story Prioritization',
    description: 'AI-assisted prioritization of stories based on impact and effort',
  },
  {
    title: 'API Integration',
    description: 'Connect with other tools via API to streamline your workflow',
  },
];

// Initialize features in the database if none exist
export const initializeFeatures = async () => {
  const { data: existingFeatures, error } = await supabase
    .from('upcoming_features')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Error checking existing features:', error);
    throw new Error('Failed to initialize features');
  }

  if (!existingFeatures || existingFeatures.length === 0) {
    // Insert default features
    for (const feature of defaultFeatures) {
      const { error: insertError } = await supabase
        .from('upcoming_features')
        .insert(feature);

      if (insertError) {
        console.error('Error inserting feature:', insertError);
        throw new Error('Failed to initialize features');
      }
    }
  }
};

// Fetch features with upvote counts
export const fetchFeatures = async (): Promise<UpcomingFeature[]> => {
  await initializeFeatures();

  try {
    // Get user ID or clientId for determining hasUpvoted
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const clientId = localStorage.getItem('clientId') || crypto.randomUUID();
    if (!localStorage.getItem('clientId')) {
      localStorage.setItem('clientId', clientId);
    }

    const { data: featuresData, error: featuresError } = await supabase
      .rpc('get_features_with_counts', {
        p_user_id: userId || null,
        p_client_id: !userId ? clientId : null,
      });

    if (featuresError) {
      console.error('Error fetching features:', featuresError);
      throw new Error('Failed to fetch features');
    }

    if (!featuresData || featuresData.length === 0) {
      return [];
    }

    // Process the data
    const processedFeatures = featuresData.map((feature: any) => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      upvotes: Number(feature.upvote_count) || 0,
      hasUpvoted: feature.has_upvoted || false,
      created_at: feature.created_at,
    }) as UpcomingFeature);

    return processedFeatures; // Sorting is now handled by the RPC
  } catch (error) {
    console.error('Error fetching features:', error);
    throw error;
  }
};

// Upvote a feature
export const upvoteFeature = async (featureId: string): Promise<boolean> => {
  try {
    // Generate a clientId if user is not logged in
    const clientId = localStorage.getItem('clientId') || crypto.randomUUID();
    if (!localStorage.getItem('clientId')) {
      localStorage.setItem('clientId', clientId);
    }

    // Get the current user ID if logged in
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Using stored procedure to handle upvote
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
    console.error('Error upvoting feature:', error);
    return false;
  }
};
