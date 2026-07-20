import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin emails should NEVER be treated as regular users on the public site.
  // This prevents admin logins from polluting the user panel session.
  const ADMIN_EMAILS = [
    'sirisairavitejateeda@gmail.com',
    'jnaneshwarmoturi123@gmail.com',
    'iamdesign81@gmail.com',
    'balajirockzz9030@gmail.com',
    'balajiprojects049@gmail.com',
    'paadukundam.dhaa@gmail.com' // Scanner operator account
  ];
  const isAdminEmail = (email) => email && ADMIN_EMAILS.includes(email.toLowerCase());

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      const sessionUser = session?.user ?? null;
      // If this is an admin session, don't expose it to the user panel
      setUser(sessionUser && !isAdminEmail(sessionUser.email) ? sessionUser : null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      // Block admin sessions from appearing on the user panel
      const publicUser = currentUser && !isAdminEmail(currentUser.email) ? currentUser : null;
      setUser(publicUser);
      setLoading(false);

      if (publicUser && (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION')) {
        try {
          const { data: profile } = await supabase.from('profiles').select('id').eq('id', publicUser.id).single();
          if (!profile) {
            await supabase.from('profiles').upsert({
              id: publicUser.id,
              full_name: publicUser.user_metadata?.full_name || publicUser.email.split('@')[0],
              email: publicUser.email,
              phone: publicUser.user_metadata?.phone || null,
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

  const signInWithApple = async (redirectTo = '/') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin + redirectTo
      }
    });
    if (error) console.error("Error logging in with Apple:", error.message);
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
    signInWithApple,
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
