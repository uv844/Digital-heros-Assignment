import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('Initializing Auth...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Session found for user:', session.user.id);
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          console.log('No session found');
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      const currentUser = session?.user ?? null;
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (mounted) setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
    isBlocked: data.is_blocked || false,
  });

  const fetchProfile = async (uid: string) => {
    if (!uid) return;
    
    console.log('fetchProfile starting for:', uid);
    setLoading(true);
    
    try {
      // Retry logic for profile fetching (useful if trigger is still running)
      let retries = 3;
      let data = null;
      let error = null;

      while (retries > 0) {
        console.log(`Attempting to fetch profile for ${uid}, retries left: ${retries}`);
        const result = await supabase
          .from('user_profiles')
          .select('*')
          .eq('uid', uid)
          .maybeSingle();
        
        data = result.data;
        error = result.error;

        if (data || (error && error.code !== 'PGRST116')) break;
        
        console.log(`Profile not found, retrying in 1s...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries--;
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else if (!data) {
        console.warn('Profile not found after retries. Attempting manual creation...');
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              uid: authUser.id,
              email: authUser.email!,
              display_name: authUser.user_metadata?.display_name || authUser.user_metadata?.full_name || 'Hero',
              role: authUser.email === 'yuvrajch1503@gmail.com' ? 'admin' : 'user',
              subscription_status: 'inactive',
              total_winnings: 0,
              charity_contribution_percentage: 10
            })
            .select()
            .single();
          
          if (newProfile) {
            console.log('Profile created manually:', newProfile);
            setProfile(mapProfile(newProfile));
          } else {
            console.error('Manual profile creation failed:', insertError);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } else {
        console.log('Profile fetched successfully:', data);
        const mappedProfile = mapProfile(data);
        if (mappedProfile.isBlocked) {
          console.warn('User is blocked. Signing out...');
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
        } else {
          setProfile(mappedProfile);
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      console.log('fetchProfile finished, setting loading to false');
      setLoading(false);
    }
  };

  const isAdmin = profile?.role === UserRole.ADMIN || user?.email === 'yuvrajch1503@gmail.com';

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
