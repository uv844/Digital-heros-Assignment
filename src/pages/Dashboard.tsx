import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ScoreEntry from '../components/ScoreEntry';
import SubscriptionCard from '../components/SubscriptionCard';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Heart, Users, ArrowUpRight, Wallet, X, Check, User as UserIcon } from 'lucide-react';
import { MOCK_CHARITIES } from '../constants';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import PricingModal from '../components/PricingModal';
import { useSearchParams } from 'react-router-dom';
import { SubscriptionStatus } from '../types';

const Dashboard: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [charities, setCharities] = useState<any[]>([]);

  useEffect(() => {
    if (showHistoryModal) {
      fetchHistory();
    }
  }, [showHistoryModal]);

  useEffect(() => {
    fetchCharities();
    
    // Show pricing modal if user just signed up or is inactive and hasn't seen it
    const hasSeenPricing = localStorage.getItem('hasSeenPricing');
    if (profile && profile.subscriptionStatus === SubscriptionStatus.INACTIVE && !hasSeenPricing) {
      setShowPricingModal(true);
      localStorage.setItem('hasSeenPricing', 'true');
    }

    // Handle session_id from Stripe success
    if (searchParams.get('session_id')) {
      toast.success('Subscription successful! Welcome to the club.');
      searchParams.delete('session_id');
      setSearchParams(searchParams);
    }
  }, [profile, searchParams, setSearchParams]);

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
      const { error } = await supabase
        .from('user_profiles')
        .update({ selected_charity_id: charityId })
        .eq('uid', profile.uid);

      if (error) throw error;
      await refreshProfile();
      toast.success('Charity preference updated');
      setShowCharityModal(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const selectedCharity = charities.find(c => c.id === profile?.selectedCharityId) || charities[0] || MOCK_CHARITIES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">Hello, {profile?.display_name?.split(' ')[0] || 'Hero'}</h1>
          <p className="text-gray-500">Welcome back to your dashboard.</p>
        </motion.div>
      </header>

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
                  <p className="text-white/40 text-sm">Across 0 winning draws</p>
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
                <div className="text-2xl font-bold mb-1">April 1st, 2026</div>
                <p className="text-gray-500 text-sm">Estimated Jackpot: $25,000</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users size={16} />
                <span>12,450 participants entered</span>
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
