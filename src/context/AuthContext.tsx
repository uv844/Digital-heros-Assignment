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
      const timeout = setTimeout(() => {
        console.warn('Auth initialization timed out');
        setLoading(false);
      }, 5000); // 5 second timeout

      try {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        clearTimeout(timeout);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        clearTimeout(timeout);
        console.error('Auth initialization error:', err);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        setLoading(false);
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
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('uid', uid)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        setProfile(null);
        return;
      }

      if (!data) {
        // Get user from auth to get email and metadata
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        // Create profile if it doesn't exist (e.g. for OAuth users)
        const { data: newData, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            uid: uid,
            email: authUser?.email || '',
            display_name: authUser?.user_metadata?.display_name || authUser?.user_metadata?.full_name || 'Hero',
            role: UserRole.USER,
            subscription_status: 'inactive',
            total_winnings: 0,
            charity_contribution_percentage: 10,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setProfile(null);
        } else {
          setProfile(mapProfile(newData));
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
