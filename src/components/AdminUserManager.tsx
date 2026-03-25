import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole, SubscriptionStatus } from '../types';
import { motion } from 'motion/react';
import { User, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminUserManager: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

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
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data as UserProfile[]);
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

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="mb-8">
        <h3 className="text-xl font-bold">User Management</h3>
        <p className="text-sm text-gray-500">View and manage platform subscribers</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">User</th>
              <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Role</th>
              <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Subscription</th>
              <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Winnings</th>
              <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.uid} className="group">
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                      {u.photoURL ? <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" /> : <User size={20} className="text-gray-400" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{u.displayName || 'Anonymous'}</div>
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
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${u.subscription_status === SubscriptionStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {u.subscription_status}
                  </span>
                </td>
                <td className="py-4">
                  <div className="text-sm font-bold">${u.totalWinnings?.toLocaleString() || '0'}</div>
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
                      onClick={() => toggleSubscription(u.uid, u.subscription_status)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Toggle Subscription"
                    >
                      {u.subscription_status === SubscriptionStatus.ACTIVE ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
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
