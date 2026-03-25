import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole, SubscriptionStatus } from '../types';
import { motion } from 'motion/react';
import { User, Shield, CheckCircle2, XCircle, Ban, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

const AdminUserManager: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'admin' | 'blocked'>('all');

  useEffect(() => {
    fetchUsers();

    const subscription = supabase
      .channel('user_profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } else {
      const mappedUsers: UserProfile[] = (data || []).map(u => ({
        uid: u.uid,
        email: u.email,
        displayName: u.display_name,
        photoURL: u.photo_url,
        role: u.role,
        subscriptionStatus: u.subscription_status,
        renewalDate: u.renewal_date,
        selectedCharityId: u.selected_charity_id,
        charityContributionPercentage: u.charity_contribution_percentage,
        totalWinnings: Number(u.total_winnings) || 0,
        isBlocked: u.is_blocked || false,
      }));
      setUsers(mappedUsers);
    }
    setLoading(false);
  };

  const toggleBlock = async (uid: string, currentlyBlocked: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_blocked: !currentlyBlocked })
        .eq('uid', uid);

      if (error) throw error;
      toast.success(currentlyBlocked ? 'User unblocked' : 'User blocked');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleAdmin = async (uid: string, currentRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN })
        .eq('uid', uid);

      if (error) throw error;
      toast.success('User role updated');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleSubscription = async (uid: string, currentStatus: SubscriptionStatus) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ subscription_status: currentStatus === SubscriptionStatus.ACTIVE ? SubscriptionStatus.INACTIVE : SubscriptionStatus.ACTIVE })
        .eq('uid', uid);

      if (error) throw error;
      toast.success('Subscription status updated');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filter) {
      case 'active': return u.subscriptionStatus === SubscriptionStatus.ACTIVE;
      case 'inactive': return u.subscriptionStatus === SubscriptionStatus.INACTIVE;
      case 'admin': return u.role === UserRole.ADMIN;
      case 'blocked': return u.isBlocked;
      default: return true;
    }
  });

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold">User Management</h3>
          <p className="text-sm text-gray-500">View and manage platform subscribers</p>
        </div>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-black transition-all"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-black transition-all"
          >
            <option value="all">All Users</option>
            <option value="active">Active Subs</option>
            <option value="inactive">Inactive Subs</option>
            <option value="admin">Admins</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">User</th>
              <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Role</th>
              <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
              <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((u) => (
              <tr key={u.uid} className={`group ${u.isBlocked ? 'opacity-50' : ''}`}>
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                      {u.photoURL ? <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" /> : <User size={20} className="text-gray-400" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold flex items-center">
                        {u.displayName || 'Anonymous'}
                        {u.isBlocked && <Ban size={12} className="ml-2 text-red-500" />}
                      </div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex flex-col space-y-1">
                    <span className={`w-fit text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${u.subscriptionStatus === SubscriptionStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {u.subscriptionStatus}
                    </span>
                    {u.isBlocked && (
                      <span className="w-fit text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest bg-red-100 text-red-700">
                        Blocked
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => toggleAdmin(u.uid, u.role)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                      title="Toggle Admin"
                    >
                      <Shield size={16} />
                    </button>
                    <button 
                      onClick={() => toggleSubscription(u.uid, u.subscriptionStatus)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Toggle Subscription"
                    >
                      {u.subscriptionStatus === SubscriptionStatus.ACTIVE ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                    </button>
                    <button 
                      onClick={() => toggleBlock(u.uid, u.isBlocked || false)}
                      className={`p-2 rounded-lg transition-all ${u.isBlocked ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                      title={u.isBlocked ? 'Unblock User' : 'Block User'}
                    >
                      <Ban size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserManager;
