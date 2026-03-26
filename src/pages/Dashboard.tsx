import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ScoreEntry from '../components/ScoreEntry';
import SubscriptionCard from '../components/SubscriptionCard';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Heart, Users, ArrowUpRight, Wallet, X, Check, User as UserIcon, PartyPopper, ShieldCheck } from 'lucide-react';
import { MOCK_CHARITIES } from '../constants';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { getNextDrawDate } from '../lib/dateUtils';
import { format } from 'date-fns';
import PricingModal from '../components/PricingModal';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { SubscriptionStatus } from '../types';
import confetti from 'canvas-confetti';

const Dashboard: React.FC = () => {
  const { user, profile, isAdmin, refreshProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showCharityModal, setShowCharityModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [charities, setCharities] = useState<any[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [totalParticipants, setTotalParticipants] = useState(12450);

  useEffect(() => {
    fetchTotalParticipants();
  }, []);

  const fetchTotalParticipants = async () => {
    try {
      const { count, error } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (!error && count) {
        // Add a base number to make it look more established if it's a new platform
        setTotalParticipants(count + 12400);
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
    }
  };

  useEffect(() => {
    console.log('[Dashboard] Auth state check. Profile:', !!profile, 'User:', !!user);
    if (user && !profile && !verifying) {
      console.log('[Dashboard] User present but no profile, refreshing...');
      refreshProfile();
    }
  }, [user, profile, verifying, refreshProfile]);

  useEffect(() => {
    fetchHistory();
  }, [profile]);

  useEffect(() => {
    fetchCharities();
  }, []);

  useEffect(() => {
    // Show pricing modal if user just signed up or is inactive and hasn't seen it
    const hasSeenPricing = localStorage.getItem('hasSeenPricing');
    if (profile && profile.subscriptionStatus === SubscriptionStatus.INACTIVE && !hasSeenPricing) {
      setShowPricingModal(true);
      localStorage.setItem('hasSeenPricing', 'true');
    }

    // Handle session_id from Stripe success
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      handleStripeSuccess(sessionId);
    }
  }, [profile, searchParams, setSearchParams]);

  const [pendingWinnings, setPendingWinnings] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      fetchPendingWinnings();
    }
  }, [profile]);

  const fetchPendingWinnings = async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('winners')
      .select('*, draws(*)')
      .eq('uid', profile.uid)
      .eq('status', 'pending');
    
    if (!error && data) {
      setPendingWinnings(data);
    }
  };

  const handleStripeSuccess = async (sessionId: string) => {
    if (verifying) return;
    setVerifying(true);
    
    try {
      // Force a manual verification to update status immediately
      const response = await fetch('/api/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      
      const data = await response.json();
      
      if (data.status === 'updated' || profile?.subscriptionStatus === 'active') {
        // Trigger confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#000000', '#ffffff', '#FFD700']
        });
        
        setShowSuccessModal(true);
        await refreshProfile();
      } else {
        toast.info('Subscription is being processed. It will update shortly.');
      }
      
      // Clear URL params
      searchParams.delete('session_id');
      setSearchParams(searchParams);
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify subscription status');
    } finally {
      setVerifying(false);
    }
  };

  const fetchCharities = async () => {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching charities:', error);
    } else {
      setCharities(data || []);
    }
  };

  const fetchHistory = async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('winners')
      .select('*, draws(*)')
      .eq('uid', profile.uid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
    } else {
      setHistory(data || []);
    }
  };

  const handleCharityChange = async (charityId: string) => {
    if (!profile) return;
    try {
      await updateProfile({ selectedCharityId: charityId });
      toast.success('Charity preference updated');
      setShowCharityModal(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const nextDrawDate = getNextDrawDate();
  const allCharities = [...charities, ...MOCK_CHARITIES.filter(mc => !charities.find(c => c.id === mc.id))];
  const selectedCharity = allCharities.find(c => c.id === profile?.selectedCharityId) || allCharities[0] || MOCK_CHARITIES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {!profile && (
        <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <UserIcon size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-orange-800">Profile Syncing</h4>
              <p className="text-xs text-orange-700">We're setting up your profile. Some features might be limited until this completes.</p>
            </div>
          </div>
          <button 
            onClick={() => refreshProfile(true)}
            className="px-4 py-2 bg-orange-100 text-orange-700 text-xs font-bold rounded-xl hover:bg-orange-200 transition-all"
          >
            Retry Sync
          </button>
        </div>
      )}

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">Hello, {profile?.displayName?.split(' ')[0] || 'Hero'}</h1>
          <p className="text-gray-500">Welcome back to your dashboard.</p>
        </motion.div>
        {isAdmin && (
          <Link 
            to="/admin" 
            className="flex items-center space-x-2 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-black/10 w-fit"
          >
            <ShieldCheck size={16} />
            <span>Back to Admin</span>
          </Link>
        )}
      </header>

      {pendingWinnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 p-8 bg-black text-white rounded-[40px] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
                <PartyPopper size={40} className="text-yellow-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
                <p className="text-white/60">You've won a prize in a recent draw. Check your history to claim it.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowHistoryModal(true)}
              className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all"
            >
              View Winnings
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1">
          <SubscriptionCard />
        </div>
        
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            {/* Winnings Card */}
            <div className="bg-black text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <Wallet size={24} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-white/40">Total Won</div>
                </div>
                <div className="flex-1">
                  <div className="text-4xl font-bold mb-1">${profile?.totalWinnings?.toLocaleString() || '0'}</div>
                  <p className="text-white/40 text-sm">Across {history.length} winning draws</p>
                </div>
                <button 
                  onClick={() => setShowHistoryModal(true)}
                  className="mt-8 text-sm font-bold flex items-center hover:underline"
                >
                  View History <ArrowUpRight size={16} className="ml-1" />
                </button>
              </div>
            </div>

            {/* Participation Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-8">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Trophy size={24} />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Next Draw</div>
              </div>
              <div className="mb-8">
                <div className="text-2xl font-bold mb-1">{format(nextDrawDate, 'MMMM do, yyyy')}</div>
                <p className="text-gray-500 text-sm">Estimated Jackpot: $25,000</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users size={16} />
                <span>{totalParticipants.toLocaleString()} participants entered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ScoreEntry />
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Your Charity</h3>
              <Heart size={20} className="text-red-500" />
            </div>

              <div className="mb-8">
                <div className="aspect-video rounded-2xl overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
                  {selectedCharity.image_url || selectedCharity.imageURL ? (
                    <img src={selectedCharity.image_url || selectedCharity.imageURL} alt={selectedCharity.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Heart size={48} className="text-gray-200" />
                  )}
                </div>
                <h4 className="font-bold mb-1">{selectedCharity.name}</h4>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{selectedCharity.description}</p>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contribution</span>
                <span className="text-sm font-bold">{profile?.charityContributionPercentage || 10}%</span>
              </div>
            </div>

            <button 
              onClick={() => setShowCharityModal(true)}
              className="w-full py-3 border border-gray-200 text-sm font-bold rounded-2xl hover:border-black transition-all"
            >
              Change Charity
            </button>
          </div>
        </div>
      </div>

      {/* Charity Selection Modal */}
      <AnimatePresence>
        {showCharityModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCharityModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Choose Your Charity</h3>
                  <p className="text-sm text-gray-500">Select where your contributions go</p>
                </div>
                <button onClick={() => setShowCharityModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
                {(charities.length > 0 ? charities : MOCK_CHARITIES).map((charity) => {
                  const isSelected = charity.id === profile?.selectedCharityId;
                  const imageUrl = charity.image_url || charity.imageURL;
                  return (
                    <button
                      key={charity.id}
                      onClick={() => handleCharityChange(charity.id)}
                      className={`w-full flex items-center p-6 rounded-3xl border-2 transition-all text-left group ${
                        isSelected ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden mr-6 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                        {imageUrl ? (
                          <img src={imageUrl} alt={charity.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Heart size={24} className="text-gray-200" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold">{charity.name}</h4>
                          {isSelected && <Check size={20} className="text-green-600" />}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{charity.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PricingModal 
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)} 
        showSkip={true}
      />

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10 text-center"
            >
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <PartyPopper size={48} />
              </div>
              <h3 className="text-3xl font-black tracking-tight mb-4">Congratulations!</h3>
              <p className="text-gray-500 mb-10 leading-relaxed">
                You are now a **Digital Hero**. Your subscription is active, and you've been entered into the next monthly draw!
              </p>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-5 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
              >
                Let's Go!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Winning History</h3>
                  <p className="text-sm text-gray-500">Your past draw winnings</p>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto">
                {history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((win) => (
                      <div key={win.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                            {format(new Date(win.draws.date), 'MMMM dd, yyyy')}
                          </div>
                          <div className="text-lg font-bold">Match {win.match_type}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">+${win.prize_amount.toLocaleString()}</div>
                          <div className={`text-[10px] font-bold uppercase tracking-widest ${win.status === 'paid' ? 'text-blue-600' : 'text-orange-600'}`}>
                            {win.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400">No winnings yet. Keep playing!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
