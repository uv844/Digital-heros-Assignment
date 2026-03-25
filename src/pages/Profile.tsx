import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { User, Mail, Lock, Save, Camera, Shield } from 'lucide-react';
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ display_name: displayName })
        .eq('uid', user.id);

      if (error) throw error;
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password set successfully! You can now login with email/password.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Your Profile</h1>
        <p className="text-gray-500">Manage your account settings and security.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Basic Info */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <User size={20} />
              </div>
              <h2 className="text-xl font-bold">Basic Information</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                <div className="flex items-center p-4 bg-gray-50 rounded-2xl text-gray-500 cursor-not-allowed">
                  <Mail size={18} className="mr-3" />
                  <span>{user?.email}</span>
                </div>
                <p className="mt-2 text-[10px] text-gray-400">Email cannot be changed.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Display Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center disabled:opacity-50"
              >
                <Save className="mr-2" size={18} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </section>

          {/* Security */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Lock size={20} />
              </div>
              <h2 className="text-xl font-bold">Security</h2>
            </div>

            <div className="mb-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
              <div className="flex items-start space-x-3">
                <Shield size={20} className="text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-yellow-800">Set a Password</h4>
                  <p className="text-xs text-yellow-700 mt-1">
                    If you signed up with Google, you can set a password here to enable standard email/password login.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSetPassword} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">New Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all"
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center disabled:opacity-50"
              >
                <Lock className="mr-2" size={18} />
                {loading ? 'Setting Password...' : 'Set Password'}
              </button>
            </form>
          </section>
        </div>

        <div className="space-y-8">
          {/* Avatar Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-md">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black text-white text-4xl font-bold">
                    {profile?.displayName?.[0] || user?.email?.[0].toUpperCase()}
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full border-2 border-white hover:scale-110 transition-all">
                <Camera size={16} />
              </button>
            </div>
            <h3 className="text-xl font-bold">{profile?.displayName || 'Hero'}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Role</div>
              <div className="inline-block px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                {profile?.role}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
