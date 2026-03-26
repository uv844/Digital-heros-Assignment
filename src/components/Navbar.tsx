import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, User, LayoutDashboard, ShieldCheck, UserCircle, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const Navbar: React.FC = () => {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('Navbar: Initiating logout...');
      await signOut();
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Navbar: Logout error:', err);
      // Fallback redirect
      window.location.href = '/';
    }
  };

  const navLinks = [
    { name: 'Charities', path: '/charities' },
    { name: 'Draws', path: '/draws' },
    { name: 'How it Works', path: '/how-it-works' },
  ];

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {!loading && user && (
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Dashboard</Link>
            )}

            {!loading && (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-100">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" title="Admin Panel" className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                        <ShieldCheck size={20} />
                      </Link>
                    )}
                    <Link to="/profile" title="My Profile" className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                      <UserCircle size={20} />
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      title="Logout"
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    >
                      <LogOut size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Login</Link>
                    <Link to="/signup" className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all">
                      Join Now
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-black transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl transition-all"
                >
                  {link.name}
                </Link>
              ))}
              
              {!loading && user && (
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl transition-all"
                >
                  Dashboard
                </Link>
              )}

              <div className="pt-4 mt-4 border-t border-gray-100">
                {!loading && (
                  <>
                    {user ? (
                      <div className="space-y-2">
                        <Link 
                          to="/profile" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-4 text-base font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl transition-all"
                        >
                          <UserCircle size={20} />
                          <span>My Profile</span>
                        </Link>
                        {isAdmin && (
                          <Link 
                            to="/admin" 
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-4 text-base font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl transition-all"
                          >
                            <ShieldCheck size={20} />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        <button 
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center space-x-3 w-full px-3 py-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <LogOut size={20} />
                          <span>Logout</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <Link 
                          to="/login" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-center px-4 py-3 text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                        >
                          Login
                        </Link>
                        <Link 
                          to="/signup" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-center px-4 py-3 text-sm font-bold text-white bg-black rounded-xl hover:bg-gray-800 transition-all"
                        >
                          Join Now
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
