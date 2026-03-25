import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'sonner';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-black selection:text-white">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors />
      
      <footer className="bg-white border-t border-gray-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-black rounded-full" />
                <span className="text-lg font-bold tracking-tight">Digital Heroes Golf Charity</span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs">
                Digital Heroes Golf Charity Subscription Platform: A modern platform combining golf performance tracking, monthly prize draws, and charitable giving.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link to="/charities" className="text-sm text-gray-500 hover:text-black">Charities</Link></li>
                <li><Link to="/how-it-works" className="text-sm text-gray-500 hover:text-black">How it Works</Link></li>
                <li><Link to="/draws" className="text-sm text-gray-500 hover:text-black">Recent Draws</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-sm text-gray-500 hover:text-black">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-sm text-gray-500 hover:text-black">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-gray-400">© 2026 Digital Heroes. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-xs text-gray-400">GOLF · CHARITY · COMMUNITY</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
