
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/lib/types';
import { signInWithOAuth, signOut, signInWithEmail, signUpWithEmail } from '@/services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Set up subscription to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata.username || 
                  session.user.user_metadata.full_name || 
                  session.user.email?.split('@')[0] || null,
            avatar: session.user.user_metadata.avatar_url || null,
            created_at: session.user.created_at
          });
        } else {
          setUser(null);
        }
      }
    );

    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.username || 
                session.user.user_metadata.full_name || 
                session.user.email?.split('@')[0] || null,
          avatar: session.user.user_metadata.avatar_url || null,
          created_at: session.user.created_at
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (provider: 'google' | 'email', options?: { email?: string; password?: string }) => {
    if (provider === 'google') {
      await signInWithOAuth(provider);
    } else if (provider === 'email' && options?.email && options?.password) {
      await signInWithEmail(options.email, options.password);
    }
  };

  const signup = async (email: string, password: string, username?: string) => {
    await signUpWithEmail(email, password, username);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return {
    user,
    login,
    signup,
    logout
  };
};
