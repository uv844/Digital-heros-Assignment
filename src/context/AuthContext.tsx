import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        // Handled by initAuth, but good to have as fallback
        if (currentUser) {
          setUser(currentUser);
          await fetchProfile(currentUser.id);
        } else {
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapProfile = (data: any): UserProfile => ({
    uid: data.uid,
    email: data.email,
    displayName: data.display_name,
    photoURL: data.photo_url,
    role: data.role,
    subscriptionStatus: data.subscription_status,
    renewalDate: data.renewal_date,
    selectedCharityId: data.selected_charity_id,
    charityContributionPercentage: data.charity_contribution_percentage,
    totalWinnings: Number(data.total_winnings) || 0,
  });

  const fetchProfile = async (uid: string) => {
    try {
      // Retry logic for profile fetching (useful if trigger is still running)
      let retries = 3;
      let data = null;
      let error = null;

      while (retries > 0) {
        const result = await supabase
          .from('user_profiles')
          .select('*')
          .eq('uid', uid)
          .single();
        
        data = result.data;
        error = result.error;

        if (data || (error && error.code !== 'PGRST116')) break;
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries--;
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        setProfile(null);
        return;
      }

      if (!data) {
        // If we reach here, the trigger might be slow or failed.
        // We wait and retry one last time before giving up.
        console.warn('Profile not found yet, waiting for trigger...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const finalCheck = await supabase
          .from('user_profiles')
          .select('*')
          .eq('uid', uid)
          .single();
          
        if (finalCheck.data) {
          setProfile(mapProfile(finalCheck.data));
        } else {
          console.error('Profile creation failed. Please check Supabase triggers.');
          setProfile(null);
        }
      } else {
        setProfile(mapProfile(data));
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = profile?.role === UserRole.ADMIN;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
