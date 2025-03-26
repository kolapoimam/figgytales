import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/lib/types';
import { toast } from "sonner";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Set up subscription to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: userProfile?.name || session.user.email?.split('@')[0] || '',
            avatar: userProfile?.avatar || null
          });
        } else {
          setUser(null);
        }
      }
    );

    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        fetchUserProfile(session.user.id).then(userProfile => {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: userProfile?.name || session.user.email?.split('@')[0] || '',
            avatar: userProfile?.avatar || null
          });
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from the profiles table
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('name, avatar')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create a profile entry
        await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          name,
          avatar: null,
        });

        toast.success("Account created", {
          description: "Please check your email to confirm your account."
        });
      }
    } catch (error) {
      console.error('Sign-up error:', error);
      toast.error("Failed to sign up", {
        description: error.message || "An error occurred during sign-up."
      });
      throw error;
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user.id);
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: userProfile?.name || data.user.email?.split('@')[0] || '',
          avatar: userProfile?.avatar || null
        });
        toast.success("Signed in", {
          description: `Welcome back, ${userProfile?.name || data.user.email?.split('@')[0]}!`
        });
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      toast.error("Failed to sign in", {
        description: error.message || "Invalid email or password."
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success("Signed out", {
        description: "You have been successfully signed out."
      });
    } catch (error) {
      console.error('Sign-out error:', error);
      toast.error("Failed to sign out", {
        description: "An error occurred while signing out."
      });
    }
  };

  return {
    user,
    signUp,
    signIn,
    logout
  };
};
