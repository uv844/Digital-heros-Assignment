import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Users, Trophy, Heart, TrendingUp, BarChart3, ChevronRight, Activity, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AdminDashboard: React.FC = () => {
  // Mock data for charts
  const charityData = [
    { name: 'Green Fairways', value: 4500 },
    { name: 'Golfers for Good', value: 3200 },
    { name: 'Others', value: 1500 },
  ];

  const COLORS = ['#000000', '#666666', '#CCCCCC'];

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Admin Overview</h1>
          <p className="text-gray-500">Real-time platform performance and activity.</p>
        </div>
        <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>System Online</span>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {[
          { label: 'Total Users', value: '15,240', icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active Subs', value: '12,450', icon: TrendingUp, color: 'bg-green-50 text-green-600' },
          { label: 'Charity Pool', value: '$125,400', icon: Heart, color: 'bg-red-50 text-red-600' },
          { label: 'Prize Pool', value: '$45,000', icon: Trophy, color: 'bg-orange-50 text-orange-600' },
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
            <div className="text-2xl font-bold">{stat.value}</div>
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
              ].map((action, i) => (
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
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {[
                { user: 'John Doe', action: 'joined the platform', time: '2 mins ago', type: 'signup' },
                { user: 'Admin', action: 'published Draw #42', time: '1 hour ago', type: 'draw' },
                { user: 'Sarah Smith', action: 'updated charity choice', time: '3 hours ago', type: 'update' },
                { user: 'Mike Ross', action: 'won $500 in Draw #41', time: '5 hours ago', type: 'win' },
              ].map((activity, i) => (
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
              ))}
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
                    data={charityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {charityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-8">
              {charityData.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
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
