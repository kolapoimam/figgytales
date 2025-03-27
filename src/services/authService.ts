
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
        redirectTo: `${window.location.origin}/profile`
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
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    toast.success("Signed in successfully");
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
 * Sign up with email, password and optional username
 */
export const signUpWithEmail = async (email: string, password: string, username?: string) => {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
        },
        emailRedirectTo: `${window.location.origin}/auth?verification=true`
      }
    });
    
    if (error) throw error;
    
    toast.success("Registration successful", {
      description: "Please check your email to verify your account"
    });
    return;
  } catch (error) {
    console.error('Signup error:', error);
    toast.error("Registration failed", {
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

/**
 * Reset password
 */
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });
    
    if (error) throw error;
    
    toast.success("Password reset link sent", {
      description: "Check your email for a link to reset your password"
    });
    return;
  } catch (error) {
    console.error('Password reset error:', error);
    toast.error("Failed to send reset link", {
      description: error instanceof Error ? error.message : 'An unknown error occurred'
    });
    throw error;
  }
};
