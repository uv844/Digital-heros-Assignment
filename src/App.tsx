import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminDraws from './pages/AdminDraws';
import AdminCharities from './pages/AdminCharities';
import AdminSettings from './pages/AdminSettings';
import AdminLayout from './components/AdminLayout';
import Charities from './pages/Charities';
import HowItWorks from './pages/HowItWorks';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    } else {
      // Safety timeout: if auth is still loading after 8 seconds, force stop
      const timer = setTimeout(() => {
        console.warn('Auth loading timed out after 8s. Forcing stop.');
        setLoading(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      <div className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading...</div>
    </div>
  </div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    } else {
      // Safety timeout
      const timer = setTimeout(() => {
        console.warn('Admin auth loading timed out after 8s. Forcing stop.');
        setLoading(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      <div className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading...</div>
    </div>
  </div>;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster 
          position="top-center" 
          richColors 
          expand={false} 
          closeButton 
          toastOptions={{
            style: {
              borderRadius: '1.5rem',
              padding: '1rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)',
            }
          }}
        />
        {!isSupabaseConfigured && (
          <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-4 py-2 text-center text-sm font-bold">
            Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the AI Studio Settings menu.
          </div>
        )}
        <div id="render-test" style={{ display: 'none' }}>App Rendered Successfully</div>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="charities" element={<Charities />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Route>

            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="draws" element={<AdminDraws />} />
              <Route path="charities" element={<AdminCharities />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
