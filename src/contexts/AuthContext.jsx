import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      if (currentUser && (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION')) {
        try {
          const { data: profile } = await supabase.from('profiles').select('id').eq('id', currentUser.id).single();
          if (!profile) {
            await supabase.from('profiles').upsert({
              id: currentUser.id,
              full_name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
              email: currentUser.email,
              phone: currentUser.user_metadata?.phone || null,
              role: 'user'
            }, { onConflict: 'id' });
          }
        } catch (err) {
          console.error("Error auto-creating profile:", err);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async (redirectTo = '/') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + redirectTo
      }
    });
    if (error) console.error("Error logging in with Google:", error.message);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error.message);
  };

  const signInWithEmail = async (email, password) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signUpWithEmail = async (email, password, name, phone) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone,
        }
      }
    });
  };

  const value = {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
