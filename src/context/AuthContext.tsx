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
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  refreshProfile: async () => {},
  updateProfile: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchingUidRef = React.useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Initial session check
    const initAuth = async () => {
      try {
        console.log('[Auth] Initializing auth session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('[Auth] Error getting initial session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('[Auth] Initial session found for:', session.user.id);
          setUser(session.user);
          await fetchProfile(session.user.id, session.user);
        } else {
          console.log('[Auth] No initial session found');
          setLoading(false);
        }
      } catch (err) {
        console.error('[Auth] Unexpected error during initAuth:', err);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes - this handles SIGNED_IN, SIGNED_OUT, etc.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] State changed:', event, session?.user?.id);
      
      if (!mounted) return;

      const currentUser = session?.user ?? null;
      
      // Only update user if it actually changed to avoid redundant renders
      setUser(prev => {
        if (prev?.id === currentUser?.id) return prev;
        return currentUser;
      });

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (currentUser) {
          console.log('[Auth] User signed in/token refreshed, fetching profile...');
          await fetchProfile(currentUser.id, currentUser);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[Auth] User signed out');
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'USER_UPDATED') {
        if (currentUser) {
          await fetchProfile(currentUser.id, currentUser);
        }
      }
    });

    // Safety timeout to prevent infinite loading if onAuthStateChange fails to fire
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[Auth] Safety timeout reached. Forcing loading to false.');
        setLoading(false);
      }
    }, 10000);

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
          // Update profile immediately with payload data for instant UI response
          const mappedProfile = mapProfile(payload.new);
          if (mappedProfile.isBlocked) {
            console.warn('[Auth] User blocked in real-time. Signing out...');
            signOut();
          } else {
            setProfile(mappedProfile);
          }
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const fetchProfile = async (uid: string, authUser?: User) => {
    console.log(`[Auth] fetchProfile called for UID: "${uid}"`);
    
    if (!uid) {
      console.warn('[Auth] fetchProfile called with empty UID');
      setLoading(false);
      return;
    }
    
    // Prevent redundant fetches for the same UID if already loading
    if (fetchingUidRef.current === uid) {
      console.log('[Auth] Already fetching profile for', uid, 'skipping redundant call');
      return;
    }

    fetchingUidRef.current = uid;
    setLoading(true);
    
    try {
      // Retry logic for profile fetching (useful if trigger is still running)
      let retries = 5; 
      let data = null;
      let error = null;

      while (retries > 0) {
        // Check if we are still fetching for the same user
        if (fetchingUidRef.current !== uid) {
          console.log('[Auth] Fetching UID changed, aborting current fetch');
          return;
        }

        console.log(`[Auth] Attempting fetch for "${uid}" (Attempt ${6-retries}/5)`);
        
        const result = await supabase
          .from('user_profiles')
          .select('*')
          .eq('uid', uid)
          .maybeSingle();
        
        data = result.data;
        error = result.error;

        if (error) {
          console.error(`[Auth] Fetch error for "${uid}":`, error);
        }

        if (data) {
          console.log(`[Auth] Profile found for "${uid}":`, data);
          break;
        }
        
        if (retries > 1) {
          console.log(`[Auth] Profile not found for "${uid}", retrying in 1s...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        retries--;
      }

      // Final check before state updates
      if (fetchingUidRef.current !== uid) return;

      const currentUser = authUser || user;

      if (data) {
        const mappedProfile = mapProfile(data);
        if (mappedProfile.isBlocked) {
          console.warn('[Auth] User is blocked. Signing out...');
          await signOut();
          return;
        }
        
        setProfile(mappedProfile);

        // Sync check: if Auth metadata has info that Profile doesn't, update Profile
        if (currentUser) {
          const authName = currentUser.user_metadata?.display_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name;
          const authPhoto = currentUser.user_metadata?.photo_url || currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture;
          
          const needsSync = (authName && !mappedProfile.displayName) || (authPhoto && !mappedProfile.photoURL);
          
          if (needsSync) {
            console.log('[Auth] Syncing profile with Auth metadata...');
            const updates: any = {};
            if (authName && !mappedProfile.displayName) updates.display_name = authName;
            if (authPhoto && !mappedProfile.photoURL) updates.photo_url = authPhoto;
            
            await supabase.from('user_profiles').update(updates).eq('uid', uid);
          }
        }
      } else {
        console.warn('[Auth] Profile not found after all retries. Attempting manual creation...');
        
        if (currentUser && currentUser.id === uid) {
          console.log('[Auth] Creating profile manually for:', currentUser.email);
          const authName = currentUser.user_metadata?.display_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')?.[0] || 'Hero';
          const authPhoto = currentUser.user_metadata?.photo_url || currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture;

          const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              uid: currentUser.id,
              email: currentUser.email!,
              display_name: authName,
              photo_url: authPhoto,
              role: currentUser.email === 'admin@digitalhero.com' || currentUser.email === 'smssmack14@gmail.com' ? 'admin' : 'user',
              subscription_status: 'inactive',
              total_winnings: 0,
              charity_contribution_percentage: 10
            })
            .select()
            .maybeSingle();
          
          if (fetchingUidRef.current !== uid) return;

          if (newProfile) {
            console.log('[Auth] Profile created manually:', newProfile);
            setProfile(mapProfile(newProfile));
          } else if (insertError) {
            console.error('[Auth] Manual profile creation failed:', insertError);
            
            // If insert failed because it already exists (conflict), try fetching one last time
            if (insertError.code === '23505') {
              console.log('[Auth] Profile already exists (conflict), fetching again...');
              const { data: finalData } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('uid', uid)
                .maybeSingle();
              
              if (finalData && fetchingUidRef.current === uid) {
                setProfile(mapProfile(finalData));
              }
            }
          }
        } else {
          console.error('[Auth] Cannot create profile: No auth user or UID mismatch', { 
            hasAuthUser: !!currentUser, 
            authUid: currentUser?.id, 
            targetUid: uid 
          });
        }
      }
    } catch (err) {
      console.error('[Auth] Unexpected error in fetchProfile:', err);
    } finally {
      if (fetchingUidRef.current === uid) {
        console.log('[Auth] fetchProfile finished for', uid);
        setLoading(false);
        fetchingUidRef.current = null;
      }
    }
  };

  const isAdmin = profile?.role === UserRole.ADMIN || 
                  user?.email === 'admin@digitalhero.com' || 
                  user?.email === 'smssmack14@gmail.com';

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      // Map camelCase back to snake_case for Supabase
      const dbUpdates: any = {};
      const authUpdates: any = { data: {} };
      let hasAuthUpdates = false;

      if (updates.displayName !== undefined) {
        dbUpdates.display_name = updates.displayName;
        authUpdates.data.display_name = updates.displayName;
        hasAuthUpdates = true;
      }
      if (updates.photoURL !== undefined) {
        dbUpdates.photo_url = updates.photoURL;
        authUpdates.data.photo_url = updates.photoURL;
        hasAuthUpdates = true;
      }
      if (updates.selectedCharityId !== undefined) dbUpdates.selected_charity_id = updates.selectedCharityId;
      if (updates.charityContributionPercentage !== undefined) dbUpdates.charity_contribution_percentage = updates.charityContributionPercentage;
      if (updates.subscriptionStatus !== undefined) dbUpdates.subscription_status = updates.subscriptionStatus;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.isBlocked !== undefined) dbUpdates.is_blocked = updates.isBlocked;

      // Update Auth metadata if needed
      if (hasAuthUpdates) {
        await supabase.auth.updateUser(authUpdates);
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(dbUpdates)
        .eq('uid', user.id)
        .select()
        .single();
      
      if (error) throw error;
      if (data) setProfile(mapProfile(data));
    } catch (error) {
      console.error('[Auth] Error updating profile:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('[Auth] signOut called');
    try {
      setLoading(true);
      
      // 1. Attempt to notify Supabase, but don't let it block us forever
      // We use a race to ensure the UI remains responsive even if the network is slow
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign out timeout')), 1500)
      );
      
      try {
        await Promise.race([signOutPromise, timeoutPromise]);
      } catch (e) {
        console.warn('[Auth] Supabase sign out timed out or failed, proceeding with local clear');
      }

      // 2. Clear all local states immediately
      setUser(null);
      setProfile(null);
      fetchingUidRef.current = null;
      
      // 3. Clear all storage types
      localStorage.clear();
      sessionStorage.clear();
      
      // 4. Clear all cookies to ensure no stale session fragments remain
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }

      console.log('[Auth] Local state cleared, forcing redirect to home...');
      
      // 5. Force a hard reload to the home page to clear all memory states
      // Using window.location.href is the most reliable way to ensure a "proper logout"
      window.location.href = '/';
    } catch (err) {
      console.error('[Auth] Critical error during sign out:', err);
      // Fallback redirect to home even on critical error
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, refreshProfile, updateProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
