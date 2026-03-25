import React from 'react';
import AdminDrawManager from '../components/AdminDrawManager';
import AdminUserManager from '../components/AdminUserManager';
import { motion } from 'motion/react';
import { Users, Trophy, Heart, TrendingUp, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const AdminDashboard: React.FC = () => {
  // Mock data for charts
  const charityData = [
    { name: 'Green Fairways', value: 4500 },
    { name: 'Golfers for Good', value: 3200 },
    { name: 'Others', value: 1500 },
  ];

  const COLORS = ['#000000', '#666666', '#CCCCCC'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Admin Control</h1>
          <p className="text-gray-500">Platform oversight and management.</p>
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
        <div className="lg:col-span-2">
          <AdminDrawManager />
        </div>
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

      <div className="grid grid-cols-1 gap-8">
        <AdminUserManager />
      </div>
    </div>
  );
};

export default AdminDashboard;
