import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Users, Trophy, Heart, TrendingUp, BarChart3, ChevronRight, Activity, Settings, Database, Loader2, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '../lib/supabase';
import { MOCK_CHARITIES } from '../constants';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const [seeding, setSeeding] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubs: 0,
    charityPool: 0,
    prizePool: 0
  });
  const [charityDistribution, setCharityDistribution] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const [recentActivity, setRecentActivity] = useState<{ user: string; action: string; time: string; type: string }[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent signups
      const { data: signups, error: signupsError } = await supabase
        .from('user_profiles')
        .select('display_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (signupsError) throw signupsError;

      // Fetch recent draws
      const { data: draws, error: drawsError } = await supabase
        .from('draws')
        .select('date, status')
        .order('date', { ascending: false })
        .limit(3);
      
      if (drawsError) throw drawsError;

      const activity: { user: string; action: string; time: string; type: string; timestamp: string }[] = [];

      signups?.forEach(s => {
        activity.push({
          user: s.display_name || s.email.split('@')[0],
          action: 'joined the platform',
          time: formatTimeAgo(new Date(s.created_at)),
          type: 'signup',
          timestamp: s.created_at
        });
      });

      draws?.forEach(d => {
        activity.push({
          user: 'System',
          action: `${d.status === 'published' ? 'Published' : 'Simulated'} Draw on ${new Date(d.date).toLocaleDateString()}`,
          time: formatTimeAgo(new Date(d.date)),
          type: 'draw',
          timestamp: d.date
        });
      });

      // Sort combined activity by timestamp
      activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setRecentActivity(activity.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch total users
      const { count: totalUsersCount, error: usersError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) throw usersError;

      // Fetch active subscriptions
      const { count: activeSubsCount, error: subsError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active');
      
      if (subsError) throw subsError;

      // Calculate pools (assuming $10 per sub, 10% to charity, 40% to prize pool)
      const activeCount = activeSubsCount || 0;
      const monthlyRevenue = activeCount * 10;
      const charityPool = monthlyRevenue * 0.1;
      const prizePool = monthlyRevenue * 0.4;

      // Fetch charity distribution
      const { data: charities, error: charitiesError } = await supabase
        .from('charities')
        .select('id, name');
      
      if (charitiesError) throw charitiesError;

      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('selected_charity_id')
        .eq('subscription_status', 'active');
      
      if (profilesError) throw profilesError;

      const distributionMap: Record<string, number> = {};
      profiles?.forEach(p => {
        if (p.selected_charity_id) {
          distributionMap[p.selected_charity_id] = (distributionMap[p.selected_charity_id] || 0) + 1;
        }
      });

      const dist = (charities || []).map(c => ({
        name: c.name,
        value: (distributionMap[c.id] || 0) * 10 * 0.1 // Contribution from this charity's supporters
      })).filter(d => d.value > 0);

      // Add "Others" or "Unassigned" if needed
      const totalAssigned = dist.reduce((sum, d) => sum + d.value, 0);
      if (charityPool > totalAssigned) {
        dist.push({ name: 'Unassigned', value: charityPool - totalAssigned });
      }

      setStats({
        totalUsers: totalUsersCount || 0,
        activeSubs: activeCount,
        charityPool,
        prizePool
      });
      setCharityDistribution(dist.length > 0 ? dist : [{ name: 'No Data', value: 0 }]);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load real-time statistics');
    } finally {
      setLoading(false);
    }
  };

  const seedCharities = async () => {
    setSeeding(true);
    try {
      // Check if charities already exist
      const { count } = await supabase.from('charities').select('*', { count: 'exact', head: true });
      
      if (count && count > 0) {
        toast.info('Charities already exist in the database.');
        return;
      }

      const charitiesToInsert = MOCK_CHARITIES.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        image_url: c.imageURL,
      }));

      const { error } = await supabase.from('charities').insert(charitiesToInsert);
      if (error) throw error;

      toast.success('Charities seeded successfully!');
      fetchStats();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSeeding(false);
    }
  };

  const COLORS = ['#000000', '#666666', '#CCCCCC', '#999999', '#333333'];

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Admin Overview</h1>
          <p className="text-gray-500">Real-time platform performance and activity.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={seedCharities}
            disabled={seeding}
            className="flex items-center space-x-2 bg-white border border-gray-100 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:border-black transition-all disabled:opacity-50"
          >
            {seeding ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
            <span>{seeding ? 'Seeding...' : 'Seed Charities'}</span>
          </button>
          <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>System Online</span>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {[
          { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active Subs', value: stats.activeSubs.toLocaleString(), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
          { label: 'Charity Pool', value: `$${stats.charityPool.toLocaleString()}`, icon: Heart, color: 'bg-red-50 text-red-600' },
          { label: 'Prize Pool', value: `$${stats.prizePool.toLocaleString()}`, icon: Trophy, color: 'bg-orange-50 text-orange-600' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={20} />
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{stat.label}</div>
            <div className="text-2xl font-bold">{loading ? <Loader2 size={20} className="animate-spin" /> : stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Activity className="mr-3 text-gray-400" size={24} />
              Quick Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'User Management', description: 'Manage profiles and subscriptions', path: '/admin/users', icon: Users },
                { label: 'Draw Control', description: 'Execute and publish monthly draws', path: '/admin/draws', icon: Trophy },
                { label: 'Charity Partners', description: 'Update charity details and impact', path: '/admin/charities', icon: Heart },
                { label: 'Platform Settings', description: 'Configure global system parameters', path: '/admin/settings', icon: Settings },
                { 
                  label: 'External Dashboard', 
                  description: 'Access Supabase backend console', 
                  path: `https://supabase.com/dashboard/project/${import.meta.env.VITE_SUPABASE_URL?.match(/https:\/\/(.*?)\.supabase\.co/)?.[1] || ''}`, 
                  icon: Database,
                  external: true
                },
              ].map((action, i) => (
                action.external ? (
                  <a 
                    key={i}
                    href={action.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-black transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-black group-hover:text-white transition-all">
                        <action.icon size={18} />
                      </div>
                      <ExternalLink size={16} className="text-gray-300 group-hover:text-black transition-all" />
                    </div>
                    <div className="text-sm font-bold mb-1">{action.label}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </a>
                ) : (
                  <Link 
                    key={i}
                    to={action.path}
                    className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-black transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-black group-hover:text-white transition-all">
                        <action.icon size={18} />
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition-all" />
                    </div>
                    <div className="text-sm font-bold mb-1">{action.label}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </Link>
                )
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="text-sm font-bold">{activity.user}</span>
                      <span className="text-sm text-gray-500 ml-1">{activity.action}</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{activity.time}</div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400 text-sm">No recent activity found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Charity Distribution</h3>
              <BarChart3 size={20} className="text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {charityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-8">
              {charityDistribution.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm font-medium text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
