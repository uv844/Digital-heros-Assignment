import React from 'react';
import { motion } from 'motion/react';
import { Shield, Bell, Database, Globe, Save } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings: React.FC = () => {
  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Platform Settings</h1>
        <p className="text-gray-500">Configure global platform parameters and security.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* General Settings */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Globe className="mr-3 text-blue-500" size={24} />
              General Configuration
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Platform Name</label>
                  <input 
                    type="text" 
                    defaultValue="Digital Heroes"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Contact Email</label>
                  <input 
                    type="email" 
                    defaultValue="support@digitalheroes.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 transition-all text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Platform Description</label>
                <textarea 
                  defaultValue="A golf-based charity platform empowering heroes through sport."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 transition-all text-sm h-24"
                />
              </div>
            </div>
          </section>

          {/* Security Settings */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Shield className="mr-3 text-green-500" size={24} />
              Security & Access
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Two-Factor Authentication', description: 'Require 2FA for all admin accounts', enabled: true },
                { label: 'IP Whitelisting', description: 'Restrict admin access to specific IP ranges', enabled: false },
                { label: 'Session Timeout', description: 'Automatically log out inactive admins after 30 minutes', enabled: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <div className="text-sm font-bold">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                  <button className={`w-12 h-6 rounded-full transition-all relative ${item.enabled ? 'bg-black' : 'bg-gray-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.enabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <button 
              onClick={handleSave}
              className="px-8 py-4 bg-black text-white text-sm font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center shadow-lg"
            >
              <Save className="mr-2" size={18} />
              Save All Changes
            </button>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          {/* Notifications */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Bell className="mr-3 text-orange-500" size={24} />
              System Alerts
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <div className="text-xs font-bold text-orange-700 uppercase tracking-widest mb-1">New Signup</div>
                <div className="text-sm text-orange-900">Notify admins when a new user joins.</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Draw Complete</div>
                <div className="text-sm text-blue-900">Send summary report after each draw.</div>
              </div>
            </div>
          </section>

          {/* Database Info */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Database className="mr-3 text-purple-500" size={24} />
              Database Status
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Storage Used</span>
                <span className="font-bold">1.2 GB / 5 GB</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-[24%] h-full bg-purple-500" />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total Records</span>
                <span className="font-bold">45,240</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Last Backup</span>
                <span className="font-bold">2 hours ago</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSettings;
