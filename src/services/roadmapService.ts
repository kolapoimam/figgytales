import { createClient } from '@supabase/supabase-js';
import { UpcomingFeature } from '@/lib/types';

// Ensure these are set in your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Updated default features to match Supabase table
const defaultFeatures: Omit<UpcomingFeature, 'id' | 'upvotes' | 'hasUpvoted'>[] = [
  {
    title: 'AI Story Templates',
    description: 'Pre-made templates for common user stories',
  },
  {
    title: 'AI Voice Narration',
    description: 'Listen to AI narrate your user stories for better understanding',
  },
  {
    title: 'Design to API Integration',
    description: 'Automatically generate API endpoints from your designs',
  },
  {
    title: 'Collaborative Editing',
    description: 'Work on user stories with your team in real-time',
  },
  {
    title: 'Jira Integration',
    description: 'Export user stories directly to Jira board',
  },
  {
    title: 'Batch Export to PDF',
    description: 'Export multiple stories at once to a PDF document',
  },
  {
    title: 'Custom Export Templates',
    description: 'Create and use custom templates for exporting',
  },
  {
    title: 'Integrated Testing',
    description: 'Generate test cases directly from acceptance criteria',
  },
  {
    title: 'Team Collaboration',
    description: 'Invite team members to collaborate on story generation',
  },
  {
    title: 'Custom Fields',
    description: 'Add custom fields to your stories to track additional information',
  }
];

// Enhanced initialization of features
export const initializeFeatures = async () => {
  try {
    // First, check if features exist
    const { data: existingFeatures, error: selectError } = await supabase
      .from('upcoming_features')
      .select('id')
      .limit(1);

    if (selectError) {
      console.error('Error checking features:', selectError);
      return;
    }

    // If no features exist, insert default features
    if (!existingFeatures || existingFeatures.length === 0) {
      const { error: insertError } = await supabase
        .from('upcoming_features')
        .insert(defaultFeatures);

      if (insertError) {
        console.error('Error inserting features:', insertError);
      }
    }
  } catch (error) {
    console.error('Unexpected error in feature initialization:', error);
  }
};

// Enhanced feature fetching with more robust error handling
export const fetchFeatures = async (): Promise<UpcomingFeature[]> => {
  try {
    // Initialize features if needed
    await initializeFeatures();

    // Get current user or generate a client ID
    const { data: { user } } = await supabase.auth.getUser();
    const clientId = localStorage.getItem('clientId') || crypto.randomUUID();
    
    if (!localStorage.getItem('clientId')) {
      localStorage.setItem('clientId', clientId);
    }

    // Fetch features using RPC
    const { data: featuresData, error: featuresError } = await supabase
      .rpc('get_features_with_counts', {
        p_user_id: user?.id || null,
        p_client_id: !user ? clientId : null,
      });

    if (featuresError) {
      console.error('RPC Error fetching features:', featuresError);
      return [];
    }

    // Process and return features
    return (featuresData || []).map((feature: any) => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      upvotes: Number(feature.upvote_count) || 0,
      hasUpvoted: feature.has_upvoted || false,
      created_at: feature.created_at,
    }));

  } catch (error) {
    console.error('Comprehensive error fetching features:', error);
    return [];
  }
};

// Robust upvote feature with enhanced error handling
export const upvoteFeature = async (featureId: string): Promise<boolean> => {
  try {
    // Generate client ID if not exists
    const clientId = localStorage.getItem('clientId') || crypto.randomUUID();
    localStorage.setItem('clientId', clientId);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Use RPC for upvoting
    const { error } = await supabase.rpc('upvote_feature', {
      p_feature_id: featureId,
      p_user_id: user?.id || null,
      p_client_id: !user ? clientId : null,
    });

    if (error) {
      console.error('Upvote RPC Error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Comprehensive upvote error:', error);
    return false;
  }
};
