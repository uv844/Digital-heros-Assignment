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
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [fetchingUid, setFetchingUid] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Listen for auth changes - this handles INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, etc.
    // Relying on this instead of manual getSession prevents "Lock was released because another request stole it" errors.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] State changed:', event, session?.user?.id);
      
      if (!mounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (currentUser) {
          console.log('[Auth] User session active, fetching profile...');
          await fetchProfile(currentUser.id);
        } else {
          console.log('[Auth] No active session');
          setProfile(null);
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[Auth] User signed out');
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'USER_UPDATED') {
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      } else {
        // For other events, ensure we aren't stuck in loading
        if (!currentUser) {
          setLoading(false);
        }
      }
    });

    // Safety timeout to prevent infinite loading if onAuthStateChange fails to fire
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[Auth] Safety timeout reached. Forcing loading to false.');
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
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

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    // Subscribe to profile changes
    const channel = supabase
      .channel(`profile-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: `uid=eq.${user.id}`
      }, (payload) => {
        console.log('[Auth] Profile changed in real-time:', payload.new);
        if (payload.new) {
          setProfile(mapProfile(payload.new));
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const fetchProfile = async (uid: string) => {
    if (!uid) {
      setLoading(false);
      return;
    }

    // Prevent redundant fetches for the same UID if already loading
    if (fetchingUid === uid) {
      console.log('[Auth] Already fetching profile for', uid, 'skipping redundant call');
      return;
    }
    
    console.log('[Auth] fetchProfile starting for:', uid);
    setFetchingUid(uid);
    setLoading(true);
    
    try {
      // Retry logic for profile fetching (useful if trigger is still running)
      let retries = 5; 
      let data = null;
      let error = null;

      while (retries > 0) {
        console.log(`[Auth] Attempting to fetch profile for ${uid}, retries left: ${retries}`);
        const result = await supabase
          .from('user_profiles')
          .select('*')
          .eq('uid', uid)
          .maybeSingle();
        
        data = result.data;
        error = result.error;

        if (data || (error && error.code !== 'PGRST116')) break;
        
        console.log(`[Auth] Profile not found, retrying in 1s...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries--;
      }

      if (error && error.code !== 'PGRST116') {
        console.error('[Auth] Error fetching profile:', error);
        setProfile(null);
      } else if (!data) {
        console.warn('[Auth] Profile not found after retries. Attempting manual creation...');
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser && authUser.id === uid) {
          const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              uid: authUser.id,
              email: authUser.email!,
              display_name: authUser.user_metadata?.display_name || authUser.user_metadata?.full_name || 'Hero',
              role: authUser.email === 'admin@digitalhero.com' ? 'admin' : 'user',
              subscription_status: 'inactive',
              total_winnings: 0,
              charity_contribution_percentage: 10
            })
            .select()
            .single();
          
          if (newProfile) {
            console.log('[Auth] Profile created manually:', newProfile);
            setProfile(mapProfile(newProfile));
          } else {
            console.error('[Auth] Manual profile creation failed:', insertError);
          }
        }
      } else {
        console.log('[Auth] Profile fetched successfully:', data);
        const mappedProfile = mapProfile(data);
        if (mappedProfile.isBlocked) {
          console.warn('[Auth] User is blocked. Signing out...');
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
        } else {
          setProfile(mappedProfile);
        }
      }
    } catch (err) {
      console.error('[Auth] Unexpected error fetching profile:', err);
    } finally {
      console.log('[Auth] fetchProfile finished, setting loading to false');
      setLoading(false);
      setFetchingUid(null);
    }
  };

  const isAdmin = profile?.role === UserRole.ADMIN || user?.email === 'admin@digitalhero.com';

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      console.log('[Auth] Initiating sign out...');
      setLoading(true);
      
      // 1. Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[Auth] Supabase signOut error:', error);
      }

      // 2. Clear local states immediately
      setUser(null);
      setProfile(null);
      
      // 3. Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('[Auth] Sign out complete, redirecting...');
      
      // 4. Force a hard reload to the home page to clear all memory states
      window.location.href = '/';
    } catch (err) {
      console.error('[Auth] Unexpected error during sign out:', err);
      // Fallback redirect even on error
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
