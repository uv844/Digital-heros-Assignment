import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const AdminLayout: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('Attempting logout...');
      // Try to sign out from Supabase
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error (Supabase):', err);
    } finally {
      // Always clear local storage and redirect as a fallback
      console.log('Clearing local session data...');
      localStorage.clear();
      // Use window.location.href to force a full page reload and clear all states
      window.location.href = '/';
    }
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/draws', icon: Trophy, label: 'Draws' },
    { path: '/admin/charities', icon: Heart, label: 'Charities' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex font-sans selection:bg-black selection:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-50">
        <div className="p-8">
          <Link to="/" className="flex items-center space-x-2 mb-10">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="text-xl font-bold tracking-tight">Digital Heroes</span>
          </Link>

          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 ml-2">Main Menu</div>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
                    isActive 
                      ? 'bg-black text-white shadow-lg' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={18} />
                    <span className="text-sm font-bold">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="opacity-50" />}
                </Link>
              );
            })}
          </div>

          <div className="mt-10 pt-10 border-t border-gray-50 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 ml-2">External</div>
            <Link
              to="/dashboard"
              className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-black rounded-2xl transition-all"
            >
              <ShieldCheck size={18} />
              <span className="text-sm font-bold">User Dashboard</span>
            </Link>
            <a
              href={`https://supabase.com/dashboard/project/${import.meta.env.VITE_SUPABASE_URL?.match(/https:\/\/(.*?)\.supabase\.co/)?.[1] || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-black rounded-2xl transition-all"
            >
              <Database size={18} />
              <span className="text-sm font-bold">Supabase Dashboard</span>
            </a>
          </div>
        </div>

        <div className="mt-auto p-8 border-t border-gray-50">
          <div className="flex items-center space-x-3 mb-6 p-2">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <ShieldCheck className="text-gray-400" size={20} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{profile?.displayName || 'Admin'}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest">Administrator</div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-bold">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen relative">
        <div className="p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
