
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/lib/types';
import { signInWithOAuth, signOut } from '@/services/authService';

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
            name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || null,
            avatar: session.user.user_metadata.avatar_url || null
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
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || null,
          avatar: session.user.user_metadata.avatar_url || null
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (provider: 'google') => {
    await signInWithOAuth(provider);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return {
    user,
    login,
    logout
  };
};
