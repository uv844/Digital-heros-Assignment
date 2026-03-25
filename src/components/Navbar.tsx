import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, User, LayoutDashboard, ShieldCheck, UserCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const Navbar: React.FC = () => {
  const { user, profile, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <span className="text-xl font-bold tracking-tight text-black">Digital Heroes</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/charities" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Charities</Link>
            <Link to="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">How it Works</Link>
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    {isAdmin && (
                      <Link to="/admin" title="Admin Panel" className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                        <ShieldCheck size={20} />
                      </Link>
                    )}
                    <Link to="/profile" title="My Profile" className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                      <UserCircle size={20} />
                    </Link>
                    <Link to="/dashboard" title="Dashboard" className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                      <LayoutDashboard size={20} />
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      title="Logout"
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Login</Link>
                    <Link to="/signup" className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all">
                      Join Now
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
