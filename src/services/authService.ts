
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

/**
 * Sign in with OAuth provider
 */
export const signInWithOAuth = async (provider: 'google') => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/results`
      }
    });
    
    if (error) throw error;
    
    return;
  } catch (error) {
    console.error('Login error:', error);
    toast.error("Login failed", {
      description: error instanceof Error ? error.message : 'An unknown error occurred'
    });
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    toast.success("Logged out successfully");
    return;
  } catch (error) {
    console.error('Logout error:', error);
    toast.error("Logout failed");
    throw error;
  }
};
